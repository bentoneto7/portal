#!/usr/bin/env node

/**
 * UPDATE FROM LANCE
 *
 * Script completo que:
 * 1. Faz scraping do Lance.com.br
 * 2. Reescreve com IA (Journalist Agent)
 * 3. Gera HTMLs dos artigos
 * 4. Atualiza articles-index.json
 * 5. Publica automaticamente no site
 */

require('dotenv').config();

const { LanceNewsScraper } = require('../scrapers/lance-news-scraper');
const { RSSNewsScraper } = require('../scrapers/rss-news-scraper');
const { JournalistAgent } = require('../agents/journalist-agent');
const { TeamLogoScraper } = require('../scrapers/team-logo-scraper');
const fs = require('fs').promises;
const path = require('path');

class LanceSiteUpdater {
    constructor() {
        this.lanceScraper = new LanceNewsScraper();
        this.rssScraper = new RSSNewsScraper();
        this.teamLogoScraper = new TeamLogoScraper();
        this.journalistAgent = null;

        this.dataDir = path.join(__dirname, '../../data');
        this.publicDir = path.join(__dirname, '../../public');
        this.articlesDir = path.join(this.publicDir, 'articles/pt-BR');

        this.articlesIndexPath = path.join(this.dataDir, 'articles-index.json');
        this.publicArticlesIndexPath = path.join(this.publicDir, 'data/articles-index.json');
        this.publishedTitlesPath = path.join(this.dataDir, 'published-titles.json');

        // Mapa de categorias Lance → Bola na Rede
        this.categoryMap = {
            'brasileirao': 'brasileirao',
            'brasileiro-serie-a': 'brasileirao',
            'selecao-brasileira': 'copa',
            'copa': 'copa',
            'mercado-da-bola': 'mercado',
            'mercado': 'mercado',
            'futebol-internacional': 'internacional',
            'internacional': 'internacional'
        };
    }

    /**
     * Inicializa componentes
     */
    async init() {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║   RSS → BOLA NA REDE UPDATER         ║');
        console.log('╚════════════════════════════════════════╝\n');

        // Valida API Key
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY não configurada no .env');
        }

        // Inicializa Journalist Agent
        this.journalistAgent = new JournalistAgent(
            process.env.ANTHROPIC_API_KEY,
            process.env.AI_MODEL || 'claude-sonnet-4'
        );

        // Valida API Key
        await this.validateApiKey();

        // Inicializa scrapers
        await this.rssScraper.init();
        await this.teamLogoScraper.init();

        console.log('✅ Componentes inicializados\n');
    }

    /**
     * Valida ANTHROPIC_API_KEY
     */
    async validateApiKey() {
        console.log('🔑 Validando ANTHROPIC_API_KEY...');

        try {
            const axios = require('axios');

            // Faz chamada de teste com modelo barato
            await axios.post(
                'https://api.anthropic.com/v1/messages',
                {
                    model: 'claude-haiku-4-5',
                    max_tokens: 10,
                    messages: [{ role: 'user', content: 'test' }]
                },
                {
                    headers: {
                        'x-api-key': this.journalistAgent.apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            console.log('✅ API Key válida\n');
            return true;

        } catch (error) {
            if (error.response?.status === 401) {
                console.error('❌ ANTHROPIC_API_KEY inválida ou expirada!');
                throw new Error('Configure ANTHROPIC_API_KEY válida no .env');
            }

            // Outros erros são OK (rate limit, etc)
            console.log('⚠️  Não foi possível validar API Key (assumindo válida)');
            console.log('   Motivo:', error.message);
            return true;
        }
    }

    /**
     * Carrega artigos já publicados
     */
    async loadPublishedTitles() {
        try {
            const data = await fs.readFile(this.publishedTitlesPath, 'utf8');
            return new Set(JSON.parse(data));
        } catch (error) {
            return new Set();
        }
    }

    /**
     * Salva títulos publicados
     */
    async savePublishedTitles(titles) {
        await fs.writeFile(
            this.publishedTitlesPath,
            JSON.stringify([...titles], null, 2),
            'utf8'
        );
    }

    /**
     * Verifica se artigo já foi publicado
     */
    isDuplicate(title, publishedTitles) {
        const normalized = title.toLowerCase().trim();

        for (const published of publishedTitles) {
            const similarity = this.calculateSimilarity(normalized, published.toLowerCase());
            if (similarity > 0.7) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calcula similaridade entre textos
     */
    calculateSimilarity(str1, str2) {
        const words1 = new Set(str1.split(/\s+/));
        const words2 = new Set(str2.split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    /**
     * Atualiza site com notícias (RSS feeds públicos)
     */
    async updateSite(options = {}) {
        const {
            sections = ['brasileirao', 'mercado'],
            articlesPerSection = 2,
            maxTotal = 5,
            useRSS = true // Usar RSS como padrão
        } = options;

        try {
            let scrapedArticles = [];

            if (useRSS) {
                // 1. Scraping via RSS (PRIMÁRIO - sem bloqueio)
                console.log('📡 ETAPA 1: Scraping via RSS Feeds (GE, UOL, ESPN, Lance)\n');

                scrapedArticles = await this.rssScraper.scrapeMultipleSections(
                    sections,
                    articlesPerSection
                );

                console.log(`✅ RSS Scraping: ${scrapedArticles.length} artigos coletados\n`);

            } else {
                // 1b. Scraping direto do Lance (FALLBACK - pode ser bloqueado)
                console.log('📡 ETAPA 1: Scraping direto do Lance.com.br\n');

                scrapedArticles = await this.lanceScraper.scrapeMultipleSections(
                    sections,
                    articlesPerSection
                );
            }

            if (scrapedArticles.length === 0) {
                console.log('⚠️  Nenhum artigo coletado');
                return;
            }

            // 2. Filtra duplicatas
            console.log('\n🔍 ETAPA 2: Verificando duplicatas\n');

            const publishedTitles = await this.loadPublishedTitles();
            const newArticles = scrapedArticles.filter(article => {
                const isDup = this.isDuplicate(article.title, publishedTitles);
                if (isDup) {
                    console.log(`   ⏭️  Pulando (duplicata): ${article.title.substring(0, 50)}...`);
                }
                return !isDup;
            });

            console.log(`   ✅ ${newArticles.length} artigos novos (${scrapedArticles.length - newArticles.length} duplicatas removidas)`);

            if (newArticles.length === 0) {
                console.log('\n⚠️  Todos os artigos já foram publicados');
                return;
            }

            // 3. Reescreve com IA
            console.log('\n✍️  ETAPA 3: Reescrevendo artigos com IA\n');

            const rewrittenArticles = [];

            for (const article of newArticles.slice(0, maxTotal)) {
                console.log(`\n📝 Processando: ${article.title.substring(0, 50)}...`);

                try {
                    const rewritten = await this.journalistAgent.createArticle([article], {
                        language: 'pt-BR',
                        category: this.categoryMap[article.section] || 'brasileirao',
                        style: 'direto',
                        tone: 'crítico'
                    });

                    if (rewritten) {
                        rewrittenArticles.push({
                            original: article,
                            rewritten: rewritten
                        });

                        console.log(`   ✅ Artigo reescrito com sucesso`);
                    }

                } catch (error) {
                    console.error(`   ❌ Erro ao reescrever: ${error.message}`);
                }

                // Delay entre reescritas
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            if (rewrittenArticles.length === 0) {
                console.log('\n⚠️  Nenhum artigo foi reescrito com sucesso');
                return;
            }

            // 4. Publica artigos
            console.log(`\n📤 ETAPA 4: Publicando ${rewrittenArticles.length} artigos\n`);

            const publishedArticles = [];

            for (const { original, rewritten } of rewrittenArticles) {
                try {
                    const published = await this.publishArticle(original, rewritten);

                    if (published) {
                        publishedArticles.push(published);
                        publishedTitles.add(original.title);
                        console.log(`   ✅ Publicado: ${published.title.substring(0, 50)}...`);
                    }

                } catch (error) {
                    console.error(`   ❌ Erro ao publicar: ${error.message}`);
                }
            }

            // 5. Atualiza índices
            console.log('\n💾 ETAPA 5: Atualizando índices\n');

            await this.updateArticlesIndex(publishedArticles);
            await this.savePublishedTitles(publishedTitles);

            // 6. Relatório final
            console.log('\n📊 RELATÓRIO FINAL\n');
            console.log(`   📡 Coletados do Lance: ${scrapedArticles.length}`);
            console.log(`   🆕 Novos (sem duplicatas): ${newArticles.length}`);
            console.log(`   ✍️  Reescritos com IA: ${rewrittenArticles.length}`);
            console.log(`   ✅ Publicados no site: ${publishedArticles.length}`);
            console.log('\n🎉 Atualização completa!\n');

        } catch (error) {
            console.error('\n❌ ERRO FATAL:', error);
            throw error;
        }
    }

    /**
     * Publica um artigo
     */
    async publishArticle(original, rewritten) {
        // Gera slug
        const slug = this.generateSlug(rewritten.title);
        const category = this.categoryMap[original.section] || 'brasileirao';

        // Define paths
        const articlePath = path.join(this.articlesDir, category, `${slug}.html`);

        // Garante que diretório existe
        await fs.mkdir(path.dirname(articlePath), { recursive: true });

        // Gera HTML
        const html = this.generateArticleHTML({
            title: rewritten.title,
            subtitle: rewritten.subtitle || original.subtitle,
            content: rewritten.content,
            image: original.image,
            category: category,
            publishedAt: new Date().toISOString(),
            source: 'Lance.com.br'
        });

        // Salva HTML
        await fs.writeFile(articlePath, html, 'utf8');

        // Retorna dados para índice
        return {
            id: slug,
            title: rewritten.title,
            excerpt: rewritten.subtitle || rewritten.content.substring(0, 150) + '...',
            category: category,
            language: 'pt-BR',
            url: `/articles/pt-BR/${category}/${slug}.html`,
            image: original.image || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop&auto=format&q=80',
            publishedAt: new Date().toISOString(),
            readingTime: Math.ceil(rewritten.content.split(/\s+/).length / 200)
        };
    }

    /**
     * Gera slug
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 100);
    }

    /**
     * Gera HTML do artigo
     */
    generateArticleHTML(data) {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - Bola na Rede</title>
    <meta name="description" content="${data.subtitle || data.excerpt}">
    <meta name="author" content="Bola na Rede">
    <meta property="og:title" content="${data.title}">
    <meta property="og:description" content="${data.subtitle || data.excerpt}">
    <meta property="og:image" content="${data.image}">
    <meta property="og:type" content="article">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${data.title}">
    <meta name="twitter:description" content="${data.subtitle || data.excerpt}">
    <meta name="twitter:image" content="${data.image}">
    <link rel="canonical" href="https://seudominio.com${data.url}">
    <meta name="keywords" content="futebol brasileiro, ${data.category}, Brasileirão 2026">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/article.css">
</head>
<body>
    <header class="article-header">
        <nav>
            <a href="/" class="logo">BOLA NA REDE</a>
        </nav>
    </header>

    <main class="article-container">
        <article class="article-content">
            <nav class="breadcrumb">
                <a href="/">Início</a> &raquo;
                <a href="/#${data.category}">${data.category.toUpperCase()}</a> &raquo;
                <span>${data.title.substring(0, 50)}...</span>
            </nav>

            <div class="article-category">${data.category.toUpperCase()}</div>

            <h1 class="article-title">${data.title}</h1>

            ${data.subtitle ? `<p class="article-subtitle">${data.subtitle}</p>` : ''}

            <div class="article-meta">
                <span class="author">Por <strong>Bola na Rede</strong></span>
                <span class="date">${new Date(data.publishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span class="reading-time">⏱️ ${data.readingTime} min de leitura</span>
            </div>

            <figure class="article-image">
                <img src="${data.image}" alt="${data.title}" onerror="this.src='/images/placeholder.jpg'">
                <figcaption>Fonte: ${data.source}</figcaption>
            </figure>

            <div class="article-body">
                ${data.content.split('\n\n').map(p => `<p>${p}</p>`).join('\n')}
            </div>

            <div class="article-share">
                <p><strong>Compartilhe:</strong></p>
                <div class="share-buttons">
                    <a href="#" class="share-btn twitter">🐦 Twitter</a>
                    <a href="#" class="share-btn facebook">📘 Facebook</a>
                    <a href="#" class="share-btn whatsapp">💬 WhatsApp</a>
                </div>
            </div>

            <p class="article-source">Baseado em reportagem do Lance.com.br</p>

            <!-- Continue Lendo: Artigos Relacionados -->
            <div class="related-articles-container"></div>
        </article>

        <!-- Sidebar com "Não Perca" -->
        <aside class="article-sidebar">
            <div class="sidebar-widget">
                <h3>⚽ Sobre o Bola na Rede</h3>
                <p>Portal de notícias esportivas com cobertura completa do futebol brasileiro e internacional.</p>
            </div>
        </aside>
    </main>

    <footer class="site-footer">
        <p>&copy; 2026 Bola na Rede | <a href="/">Voltar à home</a></p>
    </footer>

    <script src="/js/main.js"></script>
    <script src="/js/related-articles.js"></script>
</body>
</html>`;
    }

    /**
     * Atualiza articles-index.json
     */
    async updateArticlesIndex(newArticles) {
        try {
            // Lê índice atual
            let currentArticles = [];
            try {
                const data = await fs.readFile(this.articlesIndexPath, 'utf8');
                currentArticles = JSON.parse(data);
            } catch (error) {
                console.log('   📝 Criando novo articles-index.json');
            }

            // Adiciona novos artigos no início
            const updatedArticles = [...newArticles, ...currentArticles];

            // Mantém apenas os 50 artigos mais recentes
            const limitedArticles = updatedArticles.slice(0, 50);

            // Salva
            await fs.writeFile(
                this.articlesIndexPath,
                JSON.stringify(limitedArticles, null, 2),
                'utf8'
            );

            await fs.writeFile(
                this.publicArticlesIndexPath,
                JSON.stringify(limitedArticles, null, 2),
                'utf8'
            );

            console.log(`   ✅ articles-index.json atualizado (${limitedArticles.length} artigos)`);

        } catch (error) {
            console.error('   ❌ Erro ao atualizar índice:', error.message);
            throw error;
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    (async () => {
        const updater = new LanceSiteUpdater();
        await updater.init();

        // Configurações (pode ser passado via args)
        await updater.updateSite({
            sections: ['brasileirao', 'mercado'],
            articlesPerSection: 3,
            maxTotal: 5
        });

    })().catch(error => {
        console.error('\n💥 ERRO FATAL:', error);
        process.exit(1);
    });
}

module.exports = { LanceSiteUpdater };
