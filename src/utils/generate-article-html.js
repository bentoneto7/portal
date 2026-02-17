#!/usr/bin/env node

/**
 * GENERATE ARTICLE HTML
 *
 * Gera HTMLs modernos para todos os artigos com:
 * - Feed infinito
 * - Dark mode
 * - Analytics
 * - SEO completo
 * - PWA
 */

const fs = require('fs').promises;
const path = require('path');
const { SEOGenerator } = require('./seo-generator');

class ArticleHTMLGenerator {
    constructor() {
        this.seo = new SEOGenerator();
        this.articlesIndexPath = path.join(__dirname, '../../data/articles-index.json');
        this.publicDir = path.join(__dirname, '../../public');
        this.templatesDir = path.join(__dirname, '../templates');
        this.generatedCount = 0;
        this.categoryLabels = {
            'champions': 'Champions League',
            'estaduais': 'Estaduais',
            'neymar': 'Neymar Jr',
            'messi': 'Lionel Messi',
            'cr7': 'Cristiano Ronaldo',
            'copa': 'Copa 2026',
            'brasileirao': 'Brasileirão',
            'mercado': 'Mercado',
            'opiniao': 'Opinião',
            'taticas': 'Táticas'
        };
    }

    getCategoryLabel(category) {
        return this.categoryLabels[category] || category || 'Notícias';
    }

    /**
     * Gera HTMLs para todos os artigos
     */
    async generateAllArticles() {
        console.log('🏗️  GERANDO HTMLS MODERNOS PARA TODOS OS ARTIGOS\n');

        try {
            // Cria diretório de artigos
            await fs.mkdir(path.join(this.publicDir, 'artigo'), { recursive: true });

            // Lê índice
            const data = await fs.readFile(this.articlesIndexPath, 'utf8');
            const articles = JSON.parse(data);

            console.log(`📊 Total de artigos: ${articles.length}\n`);

            // Gera HTML para cada artigo
            for (const article of articles) {
                await this.generateArticleHTML(article);
            }

            console.log(`\n✅ HTMLs gerados com sucesso!`);
            console.log(`📈 ${this.generatedCount} artigos prontos\n`);

        } catch (error) {
            console.error('❌ Erro ao gerar HTMLs:', error);
            throw error;
        }
    }

    /**
     * Gera HTML de um artigo
     */
    async generateArticleHTML(article) {
        console.log(`📝 ${article.title.substring(0, 60)}...`);

        try {
            const html = this.createArticleHTML(article);
            const htmlPath = path.join(this.publicDir, 'artigo', `${article.id}.html`);

            await fs.writeFile(htmlPath, html, 'utf8');

            console.log(`   ✅ HTML gerado`);
            this.generatedCount++;

        } catch (error) {
            console.error(`   ❌ Erro: ${error.message}`);
        }
    }

    /**
     * Cria HTML completo do artigo
     */
    createArticleHTML(article) {
        const metaTags = this.seo.generateAllMetaTags(article);
        const schemaScript = this.seo.generateSchemaScript(article);

        const publishedDate = new Date(article.publishedAt);
        const formattedDate = publishedDate.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - Bola na Rede</title>

    ${metaTags}
    ${schemaScript}

    <!-- Styles -->
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/article.css">
    <link rel="stylesheet" href="/css/dark-mode.css">
    <link rel="stylesheet" href="/css/search.css">
    <link rel="stylesheet" href="/css/infinite-feed.css">

    <!-- PWA -->
    <link rel="manifest" href="/manifest.json">

    <!-- Preconnect -->
    <link rel="preconnect" href="https://images.unsplash.com">
    <link rel="preconnect" href="https://www.googletagmanager.com">

    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX');
    </script>
</head>
<body>
    <!-- Header -->
    <header>
        <nav class="container">
            <div class="logo">
                <a href="/">
                    <h1>⚽ Bola na Rede</h1>
                </a>
            </div>
            <ul class="main-nav">
                <li><a href="/">Início</a></li>
                <li><a href="/#champions">Champions</a></li>
                <li><a href="/#estaduais">Estaduais</a></li>
                <li><a href="/#neymar">Neymar</a></li>
                <li><a href="/#messi">Messi</a></li>
                <li><a href="/#cr7">CR7</a></li>
                <li><a href="/#copa">Copa 2026</a></li>
                <li><button data-search-toggle aria-label="Buscar">🔍</button></li>
            </ul>
        </nav>
    </header>

    <!-- Main -->
    <main class="container article-page">
        <article class="article-main">
            <!-- Breadcrumb -->
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <ol>
                    <li><a href="/">Home</a></li>
                    <li><a href="/${this.seo.slugify(article.section || 'noticias')}">${this.getCategoryLabel(article.category || article.section)}</a></li>
                    <li aria-current="page">${article.title}</li>
                </ol>
            </nav>

            <!-- Article Header -->
            <div class="article-header">
                <span class="article-category">${this.getCategoryLabel(article.category || article.section)}</span>
                <h1 class="article-title">${article.title}</h1>
                <p class="article-subtitle">${article.excerpt || article.subtitle || ''}</p>

                <div class="article-meta">
                    <span class="article-author">Por ${article.author || 'Redação Bola na Rede'}</span>
                    <time class="article-date" datetime="${article.publishedAt}">${formattedDate}</time>
                    <span class="article-source">${article.source || 'Bola na Rede'}</span>
                </div>
            </div>

            <!-- Article Image -->
            <figure class="article-image">
                <img
                    src="${article.image}"
                    alt="${article.title}"
                    loading="eager"
                >
                <figcaption>${article.imageCredit || 'Imagem: Divulgação'}</figcaption>
            </figure>

            <!-- Article Content -->
            <div class="article-content">
                <div class="article-text">
                    ${this.generateArticleContent(article)}
                </div>

                <!-- Share Buttons -->
                <div class="article-share">
                    <h3>Compartilhe:</h3>
                    <div class="share-buttons">
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://bolanarede.com.br/artigo/' + article.id + '.html')}"
                           target="_blank"
                           data-share="facebook"
                           class="share-btn facebook">
                            Facebook
                        </a>
                        <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent('https://bolanarede.com.br/artigo/' + article.id + '.html')}&text=${encodeURIComponent(article.title)}"
                           target="_blank"
                           data-share="twitter"
                           class="share-btn twitter">
                            Twitter
                        </a>
                        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' https://bolanarede.com.br/artigo/' + article.id + '.html')}"
                           target="_blank"
                           data-share="whatsapp"
                           class="share-btn whatsapp">
                            WhatsApp
                        </a>
                    </div>
                </div>

                <!-- Tags -->
                ${article.tags ? `
                <div class="article-tags">
                    <h3>Tags:</h3>
                    ${article.tags.map(tag => `<a href="/tag/${this.seo.slugify(tag)}" class="tag">${tag}</a>`).join('')}
                </div>
                ` : ''}
            </div>

            <!-- Feed Infinito será inserido aqui pelo JS -->
        </article>

        <!-- Sidebar -->
        <aside class="sidebar sticky-sidebar">
            <!-- Widget "Não Perca" -->
            <div class="widget trending-widget">
                <h2>🔥 Não Perca</h2>
                <div id="trending-articles" class="trending-list">
                    <!-- Será populado por JS -->
                </div>
            </div>

            <!-- Widget Newsletter -->
            <div class="widget newsletter-widget">
                <h2>📧 Newsletter</h2>
                <p>Receba as melhores notícias de futebol no seu email</p>
                <form class="newsletter-form">
                    <input type="email" placeholder="Seu email" required>
                    <button type="submit">Inscrever</button>
                </form>
            </div>
        </aside>
    </main>

    <!-- Footer -->
    <footer>
        <div class="container">
            <p>&copy; 2026 Bola na Rede - Portal de Futebol</p>
            <nav>
                <a href="/sobre">Sobre</a>
                <a href="/contato">Contato</a>
                <a href="/privacidade">Privacidade</a>
            </nav>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="/js/related-articles.js"></script>
    <script src="/js/pwa.js"></script>
    <script src="/js/analytics.js"></script>
    <script src="/js/dark-mode.js"></script>
    <script src="/js/search.js"></script>
    <script src="/js/infinite-feed.js"></script>
</body>
</html>`;
    }

    /**
     * Gera conteúdo do artigo
     */
    generateArticleContent(article) {
        // Por enquanto usa excerpt, depois será substituído pela IA
        return `
            <p><strong>${article.excerpt || article.subtitle || ''}</strong></p>

            <p>Esta é uma notícia em desenvolvimento. O conteúdo completo será gerado em breve com análises táticas, estatísticas e citações de especialistas.</p>

            <h2>Contexto</h2>
            <p>${article.title} é uma das principais notícias do futebol brasileiro neste momento.</p>

            <h2>Análise</h2>
            <p>Em breve, você terá acesso a análises táticas detalhadas, números e estatísticas completas sobre este acontecimento.</p>

            <blockquote>
                <p>"O futebol brasileiro está em constante evolução."</p>
                <footer>— Especialista da Bola na Rede</footer>
            </blockquote>

            <h2>Perspectivas</h2>
            <p>Acompanhe as atualizações desta e de outras notícias aqui no Bola na Rede.</p>
        `;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    (async () => {
        const generator = new ArticleHTMLGenerator();
        await generator.generateAllArticles();

    })().catch(error => {
        console.error('\n💥 ERRO FATAL:', error);
        process.exit(1);
    });
}

module.exports = { ArticleHTMLGenerator };
