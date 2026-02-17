#!/usr/bin/env node
/**
 * FOOTBALL PUBLISHER
 *
 * Sistema automático de publicação para o portal Bola na Rede:
 * 1. Coleta notícias via RSS de portais esportivos (GE, UOL, ESPN, Lance)
 * 2. Classifica por categoria (brasileirao, neymar, copa, mercado, opiniao, taticas)
 * 3. Usa Claude AI para reescrever com conteúdo original e exclusivo
 * 4. Publica no formato /artigo/{id}.html + atualiza articles-index.json
 */

require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const DATA_DIR = path.join(__dirname, '../../data');
const ARTIGO_DIR = path.join(__dirname, '../../public/artigo');
const ARTICLES_INDEX = path.join(DATA_DIR, 'articles-index.json');
const PUBLISHED_TITLES = path.join(DATA_DIR, 'published-titles.json');

// Imagens Pexels por categoria (pool rotativo com diversidade visual)
function px(id) {
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1`;
}
const CATEGORY_IMAGES = {
    brasileirao: [px(33257251), px(18075411), px(17955074), px(3131405)],
    neymar:      [px(17955074), px(33257251), px(32179248)],
    copa:        [px(15976858), px(18075458), px(17071576)],
    mercado:     [px(32179248), px(16114080), px(18075411)],
    opiniao:     [px(5817858),  px(17071576), px(15976858)],
    taticas:     [px(15153169), px(17955074), px(18075411)],
    regionais:   [px(3131405),  px(17071576), px(16731731)],
};

const CATEGORY_LABELS = {
    brasileirao: 'Brasileirão',
    neymar: 'Neymar Jr',
    copa: 'Copa 2026',
    mercado: 'Mercado da Bola',
    opiniao: 'Opinião',
    taticas: 'Táticas'
};

// Keywords para classificação automática por categoria
const CATEGORY_KEYWORDS = {
    neymar: ['neymar', 'ney', 'camisa 10 do santos', 'jr do santos'],
    copa: ['copa do mundo', 'copa 2026', 'seleção brasileira', 'ancelotti', 'convocação', 'eliminatórias', 'mundial'],
    mercado: ['contratação', 'transferência', 'janela', 'reforço', 'negociação', 'proposta', 'salário', 'mercado da bola', 'milh'],
    taticas: ['tática', 'análise', 'pressing', 'esquema', 'xg', 'dados', 'estatística', 'sistema'],
    opiniao: ['opinião', 'coluna', 'polêmica', 'var', 'árbitro', 'cbf', 'crítica'],
    brasileirao: ['brasileirão', 'série a', 'brasileiro', 'rodada', 'palmeiras', 'flamengo', 'corinthians', 'são paulo', 'grêmio', 'fluminense', 'botafogo', 'atletico']
};

class FootballPublisher {
    constructor() {
        this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        this.model = 'claude-sonnet-4-5-20250929';
        this.imageIndexes = {};
    }

    /**
     * Roda um ciclo completo de publicação
     */
    async run() {
        console.log('\n🚀 FOOTBALL PUBLISHER - Iniciando ciclo de publicação');
        console.log('='.repeat(55));

        // 1. Carrega artigos já publicados
        const publishedTitles = await this.loadPublishedTitles();
        console.log(`📚 Títulos já publicados: ${publishedTitles.length}`);

        // 2. Coleta notícias via RSS
        const rawNews = await this.collectRSSNews();
        console.log(`📡 Notícias coletadas via RSS: ${rawNews.length}`);

        if (rawNews.length === 0) {
            console.log('⚠️  Nenhuma notícia coletada. Verifique os feeds RSS.');
            return;
        }

        // 3. Filtra duplicatas
        const newNews = rawNews.filter(item =>
            !this.isDuplicate(item.title, publishedTitles)
        );
        console.log(`🆕 Novas notícias (sem duplicatas): ${newNews.length}`);

        // 4. Classifica por categoria
        const classified = this.classifyNews(newNews);
        console.log(`\n📊 Distribuição por categoria:`);
        for (const [cat, items] of Object.entries(classified)) {
            if (items.length > 0) console.log(`   [${cat}]: ${items.length}`);
        }

        // 5. Publica até 5 artigos por ciclo
        let published = 0;
        const maxPerCycle = 5;

        for (const [category, items] of Object.entries(classified)) {
            if (published >= maxPerCycle) break;
            if (items.length === 0) continue;

            // Pega o mais recente de cada categoria
            const item = items[0];
            try {
                console.log(`\n✍️  Gerando artigo: [${category}] ${item.title.substring(0, 50)}...`);
                const article = await this.generateArticle(item, category);
                await this.publishArticle(article);
                published++;
                console.log(`   ✅ Publicado: ${article.id}`);

                // Rate limiting entre artigos
                if (published < maxPerCycle) {
                    await this.sleep(3000);
                }
            } catch (error) {
                console.error(`   ❌ Erro: ${error.message}`);
            }
        }

        console.log(`\n✅ Ciclo concluído: ${published} artigos publicados`);
    }

    /**
     * Coleta notícias via RSS dos principais portais esportivos
     * Fallback automático para temas pré-definidos se RSS indisponível
     */
    async collectRSSNews() {
        const Parser = require('rss-parser');
        const parser = new Parser({
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BolaRSS/1.0)' }
        });

        const feeds = [
            { url: 'https://ge.globo.com/rss/futebol/', source: 'GE Globo' },
            { url: 'https://esporte.uol.com.br/futebol/index.xml', source: 'UOL Esporte' },
            { url: 'https://www.lance.com.br/feed/rss', source: 'Lance!' },
            { url: 'https://www.espn.com.br/espn/rss/news', source: 'ESPN Brasil' },
        ];

        const allItems = [];

        for (const feed of feeds) {
            try {
                console.log(`   📡 Buscando ${feed.source}...`);
                const result = await parser.parseURL(feed.url);
                const items = (result.items || []).slice(0, 10).map(item => ({
                    title: item.title || '',
                    description: item.contentSnippet || item.summary || item.description || '',
                    url: item.link || '',
                    publishedAt: item.pubDate || new Date().toISOString(),
                    source: feed.source
                }));
                allItems.push(...items);
                console.log(`      ✅ ${items.length} itens`);
            } catch (err) {
                console.log(`      ⚠️  ${feed.source}: ${err.message.substring(0, 50)}`);
            }
        }

        const validItems = allItems.filter(item => item.title && item.title.length > 10);

        // Fallback: se não conseguiu RSS, usa temas atuais pré-definidos
        if (validItems.length === 0) {
            console.log('   📋 RSS indisponível - usando temas atuais do futebol brasileiro...');
            return this.getCurrentTopics();
        }

        return validItems;
    }

    /**
     * Temas atuais do futebol brasileiro (fallback quando RSS não disponível)
     * Atualizar periodicamente com os temas mais relevantes
     */
    getCurrentTopics() {
        const now = new Date().toISOString();
        return [
            {
                title: 'Neymar e a preparação do Santos para as quartas do Paulistão',
                description: 'Santos enfrenta Novorizontino nas quartas de final do Paulistão. Neymar pode jogar mais minutos após retorno bem-sucedido contra Guarani.',
                url: '', publishedAt: now, source: 'Tema Atual', category: 'neymar'
            },
            {
                title: 'Ancelotti define os últimos 8 convocados para a Copa 2026',
                description: 'Seleção brasileira tem 18 nomes garantidos. Técnico avalia jogadores da Europa e Brasileirão para fechar a lista de 26 antes de maio.',
                url: '', publishedAt: now, source: 'Tema Atual', category: 'copa'
            },
            {
                title: 'Janela fecha em março - quem Palmeiras e Flamengo ainda podem contratar',
                description: 'Últimas semanas da janela de transferências no Brasil. Clubes da Série A buscam reforços antes do fechamento em 3 de março.',
                url: '', publishedAt: now, source: 'Tema Atual', category: 'mercado'
            },
            {
                title: 'Brasileirão volta na Quarta de Cinzas com clássicos na primeira rodada',
                description: 'Série A retorna após pausa de Carnaval. Palmeiras lidera com 6 pontos em 2 jogos. Flamengo em segundo após vitória sobre Vitória.',
                url: '', publishedAt: now, source: 'Tema Atual', category: 'brasileirao'
            },
            {
                title: 'VAR no Brasileirão: especialistas analisam as polêmicas das 2 primeiras rodadas',
                description: 'Três decisões controversas nas duas primeiras rodadas do Brasileirão 2026. CBF defende uso do VAR mas admite necessidade de calibração.',
                url: '', publishedAt: now, source: 'Tema Atual', category: 'opiniao'
            },
            {
                title: 'Análise tática: como Palmeiras marcou 7 gols em apenas 2 rodadas',
                description: 'Sistema ofensivo do Verdão com Carlos Vinícius é o mais letal da Série A. Análise dos esquemas de Abel Ferreira e como funciona o pressing alto.',
                url: '', publishedAt: now, source: 'Tema Atual', category: 'taticas'
            },
        ];
    }

    /**
     * Classifica notícias por categoria usando keywords
     * Respeita categoria pré-definida no item (fallback mode)
     */
    classifyNews(items) {
        const classified = {
            neymar: [],
            copa: [],
            mercado: [],
            taticas: [],
            opiniao: [],
            brasileirao: []
        };

        for (const item of items) {
            // Se o item já tem categoria definida (fallback mode), usa ela
            if (item.category && classified[item.category] !== undefined) {
                classified[item.category].push(item);
                continue;
            }

            const text = (item.title + ' ' + item.description).toLowerCase();
            let assigned = false;

            // Ordem de prioridade: neymar > copa > mercado > taticas > opiniao > brasileirao
            for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
                if (keywords.some(kw => text.includes(kw))) {
                    classified[cat].push(item);
                    assigned = true;
                    break;
                }
            }

            // Se não classificado, vai para brasileirao
            if (!assigned) {
                classified.brasileirao.push(item);
            }
        }

        return classified;
    }

    /**
     * Usa Claude para gerar artigo original a partir de uma notícia
     */
    async generateArticle(newsItem, category) {
        const prompt = `Você é um jornalista esportivo especializado em futebol brasileiro para o portal "Bola na Rede".

## NOTÍCIA FONTE:
**Título:** ${newsItem.title}
**Fonte:** ${newsItem.source}
**Resumo:** ${newsItem.description || 'Sem resumo disponível'}
**Link original:** ${newsItem.url}

## SUA TAREFA:
Crie um artigo ORIGINAL e EXCLUSIVO sobre este tema para o portal. O artigo deve:
1. Ter título impactante e diferente do original (máx 90 chars)
2. Ter perspectiva crítica e análise aprofundada
3. Ser 100% original - não copie o texto fonte
4. Ser escrito em português brasileiro informal mas profissional
5. Ter entre 400-600 palavras de corpo

## CATEGORIA: ${CATEGORY_LABELS[category] || category}

## RETORNE EXATAMENTE este JSON (sem markdown, sem texto extra):
{
  "title": "Título do artigo",
  "excerpt": "Resumo de 2-3 linhas para preview (máx 200 chars)",
  "body": "<p>Parágrafo 1...</p><p>Parágrafo 2...</p><h2>Subtítulo</h2><p>...</p>",
  "imageKeyword": "2-3 palavras em inglês específicas para buscar imagem relevante no Unsplash (ex: 'neymar soccer dribbling', 'world cup trophy stadium', 'soccer transfer contract')",
  "readingTime": 5
}`;

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }]
        });

        const text = response.content[0].text.trim();

        // Parse JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                data = JSON.parse(match[0]);
            } else {
                throw new Error('Claude não retornou JSON válido');
            }
        }

        // Gera ID e metadados
        const id = this.generateId(data.title);
        const image = data.imageKeyword
            ? `https://source.unsplash.com/800x600/?${encodeURIComponent(data.imageKeyword)}`
            : this.pickImage(category);

        return {
            id,
            title: data.title,
            excerpt: data.excerpt,
            body: data.body,
            category,
            language: 'pt-BR',
            url: `/artigo/${id}.html`,
            image,
            publishedAt: new Date().toISOString(),
            readingTime: data.readingTime || 5,
            sourceUrl: newsItem.url,
            sourceName: newsItem.source
        };
    }

    /**
     * Publica o artigo: salva HTML + atualiza articles-index.json
     */
    async publishArticle(article) {
        // 1. Gera HTML do artigo
        const html = this.generateHTML(article);
        await fs.mkdir(ARTIGO_DIR, { recursive: true });
        await fs.writeFile(path.join(ARTIGO_DIR, `${article.id}.html`), html, 'utf8');

        // 2. Atualiza articles-index.json (data/ e public/data/)
        let articles = [];
        try {
            const data = await fs.readFile(ARTICLES_INDEX, 'utf8');
            articles = JSON.parse(data);
        } catch (e) { /* arquivo não existe ainda */ }

        // Adiciona no topo (mais recente primeiro)
        articles.unshift({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            category: article.category,
            language: article.language,
            url: article.url,
            image: article.image,
            publishedAt: article.publishedAt,
            readingTime: article.readingTime
        });

        // Mantém últimos 100 artigos
        articles = articles.slice(0, 100);
        const indexJson = JSON.stringify(articles, null, 2);
        await fs.writeFile(ARTICLES_INDEX, indexJson, 'utf8');

        // Sincroniza com public/data/ (servido como static pelo Express)
        const publicDataDir = path.join(__dirname, '../../public/data');
        await fs.mkdir(publicDataDir, { recursive: true });
        await fs.writeFile(path.join(publicDataDir, 'articles-index.json'), indexJson, 'utf8');

        // 3. Salva título como publicado
        let titles = [];
        try {
            const data = await fs.readFile(PUBLISHED_TITLES, 'utf8');
            titles = JSON.parse(data);
        } catch (e) { /* */ }
        titles.unshift(article.title);
        titles = titles.slice(0, 2000);
        await fs.writeFile(PUBLISHED_TITLES, JSON.stringify(titles, null, 2), 'utf8');

        return article;
    }

    /**
     * Gera o HTML completo do artigo
     */
    generateHTML(article) {
        const categoryLabel = CATEGORY_LABELS[article.category] || article.category;
        const pubDate = new Date(article.publishedAt).toLocaleDateString('pt-BR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escape(article.title)} - Bola na Rede</title>
    <meta name="description" content="${this.escape(article.excerpt)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://bolanarede.com.br${article.url}">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${this.escape(article.title)}">
    <meta property="og:description" content="${this.escape(article.excerpt)}">
    <meta property="og:image" content="${article.image}">
    <meta property="og:url" content="https://bolanarede.com.br${article.url}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${this.escape(article.title)}">
    <meta name="twitter:description" content="${this.escape(article.excerpt)}">
    <meta name="twitter:image" content="${article.image}">

    <!-- Schema.org NewsArticle -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "${this.escape(article.title)}",
        "image": "${article.image}",
        "datePublished": "${article.publishedAt}",
        "description": "${this.escape(article.excerpt)}",
        "articleSection": "${categoryLabel}",
        "publisher": {
            "@type": "Organization",
            "name": "Bola na Rede",
            "logo": { "@type": "ImageObject", "url": "https://bolanarede.com.br/images/logo.png" }
        }
    }
    </script>

    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/article.css">
    <link rel="stylesheet" href="/css/dark-mode.css">
    <link rel="stylesheet" href="/css/infinite-feed.css">
    <link rel="manifest" href="/manifest.json">
    <link rel="preconnect" href="https://images.pexels.com">
</head>
<body>
    <!-- Header -->
    <header>
        <nav class="container">
            <div class="logo">
                <a href="/"><strong>BOLA NA REDE</strong></a>
                <span class="tagline">O futebol sem filtro</span>
            </div>
            <ul class="main-nav">
                <li><a href="/">Início</a></li>
                <li><a href="/#brasileirao">Série A</a></li>
                <li><a href="/#neymar">Neymar</a></li>
                <li><a href="/#copa">Copa 2026</a></li>
                <li><a href="/#mercado">Mercado</a></li>
                <li><a href="/#opiniao">Opinião</a></li>
                <li><a href="/#taticas">Táticas</a></li>
            </ul>
        </nav>
    </header>

    <!-- Breadcrumb -->
    <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol>
                <li><a href="/">Home</a></li>
                <li><a href="/#${article.category}">${categoryLabel}</a></li>
                <li aria-current="page">${article.title.substring(0, 50)}...</li>
            </ol>
        </nav>
    </div>

    <!-- Article -->
    <main class="article-page">
        <div class="container article-container">
            <div class="article-content">
                <div class="article-header">
                    <span class="article-category">${categoryLabel}</span>
                    <h1 class="article-title">${article.title}</h1>
                    <p class="article-subtitle">${article.excerpt}</p>
                    <div class="article-meta">
                        <span class="article-date">📅 ${pubDate}</span>
                        <span class="article-reading-time">⏱️ ${article.readingTime} min de leitura</span>
                    </div>
                </div>

                <figure class="article-image">
                    <img src="${article.image}" alt="${this.escape(article.title)}" loading="eager">
                </figure>

                <div class="article-body">
                    ${article.body}
                </div>

                <!-- Share -->
                <div class="article-share">
                    <p><strong>Compartilhe:</strong></p>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent('https://bolanarede.com.br' + article.url)}" target="_blank" rel="noopener">🐦 Twitter</a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://bolanarede.com.br' + article.url)}" target="_blank" rel="noopener">📘 Facebook</a>
                    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' - ' + 'https://bolanarede.com.br' + article.url)}" target="_blank" rel="noopener">💬 WhatsApp</a>
                </div>

                ${article.sourceUrl ? `<p class="article-source"><small>Fonte: <a href="${article.sourceUrl}" target="_blank" rel="noopener">${article.sourceName || 'Fonte externa'}</a></small></p>` : ''}

                <!-- Recomendações de notícias -->
                <div class="related-articles-container"></div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2026 Bola na Rede. Futebol sem filtro.</p>
            <p><a href="/privacy.html">Privacidade</a> | <a href="/terms.html">Termos</a></p>
        </div>
    </footer>

    <script src="/js/main.js"></script>
    <script src="/js/infinite-feed.js"></script>
    <script src="/js/related-articles.js"></script>
</body>
</html>`;
    }

    /**
     * Utilitários
     */
    generateId(title) {
        return title
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 60)
            + '-' + Date.now().toString(36);
    }

    pickImage(category) {
        const pool = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.brasileirao;
        const idx = (this.imageIndexes[category] || 0) % pool.length;
        this.imageIndexes[category] = idx + 1;
        return pool[idx];
    }

    isDuplicate(title, publishedTitles) {
        const norm = title.toLowerCase().trim();
        return publishedTitles.some(t => {
            const tNorm = t.toLowerCase().trim();
            // Similaridade simples: mais de 70% das palavras em comum
            const words1 = new Set(norm.split(/\s+/).filter(w => w.length > 3));
            const words2 = new Set(tNorm.split(/\s+/).filter(w => w.length > 3));
            const common = [...words1].filter(w => words2.has(w)).length;
            return common / Math.max(words1.size, words2.size) > 0.7;
        });
    }

    async loadPublishedTitles() {
        try {
            const data = await fs.readFile(PUBLISHED_TITLES, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }

    escape(text) {
        return (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Executa diretamente se chamado via CLI
if (require.main === module) {
    const publisher = new FootballPublisher();
    publisher.run().catch(err => {
        console.error('❌ Erro fatal:', err);
        process.exit(1);
    });
}

module.exports = { FootballPublisher };
