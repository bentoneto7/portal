/**
 * AUTOMATED PUBLISHER
 *
 * Sistema que:
 * 1. Monitora fontes de notícias
 * 2. Agrupa artigos sobre o mesmo tema
 * 3. Envia para o agente jornalista criar conteúdo original
 * 4. Publica automaticamente no portal
 */

const fs = require('fs').promises;
const path = require('path');

class AutomatedPublisher {
    constructor(config = {}) {
        this.newsAggregator = config.newsAggregator;
        this.journalistAgent = config.journalistAgent;
        this.outputDir = config.outputDir || path.join(__dirname, '../../public/articles');
        this.dataDir = config.dataDir || path.join(__dirname, '../../data');
        this.minSourcesForArticle = config.minSourcesForArticle || 2;
        this.publishInterval = config.publishInterval || 30 * 60 * 1000; // 30 minutos
        this.isRunning = false;
    }

    /**
     * Inicia o sistema de publicação automatizada
     */
    async start() {
        console.log('🚀 Starting Automated Publisher...');

        this.isRunning = true;

        // Cria diretórios necessários
        await this.ensureDirectories();

        // Primeira execução imediata
        await this.publishCycle();

        // Agenda execuções periódicas
        this.interval = setInterval(async () => {
            if (this.isRunning) {
                await this.publishCycle();
            }
        }, this.publishInterval);

        console.log(`✅ Publisher started! Running every ${this.publishInterval / 60000} minutes`);
    }

    /**
     * Para o sistema
     */
    stop() {
        console.log('🛑 Stopping Automated Publisher...');
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    /**
     * Ciclo completo de publicação
     */
    async publishCycle() {
        console.log('\n📰 Starting publish cycle...');

        const languages = ['pt-BR', 'en-US', 'es'];
        const categories = ['brasil', 'mundo', 'economia', 'tecnologia'];

        const stats = {
            processed: 0,
            published: 0,
            errors: 0
        };

        for (const language of languages) {
            for (const category of categories) {
                try {
                    console.log(`\n📡 Fetching ${category} news for ${language}...`);

                    // Agrega notícias
                    const newsGroups = await this.newsAggregator.aggregateNews({
                        category,
                        language,
                        limit: 10,
                        groupSimilar: true
                    });

                    console.log(`Found ${newsGroups.length} news groups`);

                    // Processa cada grupo
                    for (const sources of newsGroups) {
                        // Pula se tiver poucas fontes
                        if (sources.length < this.minSourcesForArticle) {
                            continue;
                        }

                        stats.processed++;

                        // Verifica se já foi publicado
                        if (await this.isDuplicate(sources[0].title)) {
                            console.log(`⏭️  Skipping duplicate: ${sources[0].title.substring(0, 50)}...`);
                            continue;
                        }

                        try {
                            console.log(`\n✍️  Creating article from ${sources.length} sources...`);

                            // Cria artigo original com IA
                            const article = await this.journalistAgent.createArticleFromSources(sources, {
                                category,
                                language
                            });

                            // Publica
                            await this.publishArticle(article);

                            stats.published++;

                            console.log(`✅ Published: ${article.title}`);

                            // Rate limiting
                            await this.sleep(2000);

                        } catch (error) {
                            console.error(`❌ Error creating article:`, error.message);
                            stats.errors++;
                        }
                    }

                } catch (error) {
                    console.error(`❌ Error in ${category}/${language}:`, error.message);
                    stats.errors++;
                }
            }
        }

        console.log('\n📊 Publish cycle completed:');
        console.log(`   Processed: ${stats.processed}`);
        console.log(`   Published: ${stats.published}`);
        console.log(`   Errors: ${stats.errors}`);

        // Atualiza índices
        await this.updateIndices();
    }

    /**
     * Publica um artigo
     */
    async publishArticle(article) {
        // Salva HTML do artigo
        const articlePath = path.join(
            this.outputDir,
            article.language,
            article.category,
            `${article.slug}.html`
        );

        await this.ensureDirectory(path.dirname(articlePath));

        const html = this.generateArticleHTML(article);
        await fs.writeFile(articlePath, html, 'utf8');

        // Salva JSON para API
        const jsonPath = articlePath.replace('.html', '.json');
        await fs.writeFile(jsonPath, JSON.stringify(article, null, 2), 'utf8');

        // Adiciona ao índice
        await this.addToIndex(article);

        article.url = `/articles/${article.language}/${article.category}/${article.slug}.html`;

        return article;
    }

    /**
     * Gera HTML completo do artigo
     */
    generateArticleHTML(article) {
        const publishDate = new Date(article.created_at);
        const formattedDate = publishDate.toLocaleDateString(article.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `<!DOCTYPE html>
<html lang="${article.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${this.escapeHtml(article.excerpt)}">
    <meta name="keywords" content="${article.keywords?.join(', ') || ''}">
    <meta name="author" content="News Portal">
    <meta name="robots" content="index, follow">
    <meta name="date" content="${article.created_at}">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${this.escapeHtml(article.title)}">
    <meta property="og:description" content="${this.escapeHtml(article.excerpt)}">
    <meta property="og:image" content="${article.image || '/images/og-default.jpg'}">
    <meta property="article:published_time" content="${article.created_at}">
    <meta property="article:section" content="${article.category}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${this.escapeHtml(article.title)}">
    <meta name="twitter:description" content="${this.escapeHtml(article.excerpt)}">
    <meta name="twitter:image" content="${article.image || '/images/twitter-default.jpg'}">

    <!-- Schema.org -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "${this.escapeHtml(article.title)}",
        "image": "${article.image || ''}",
        "datePublished": "${article.created_at}",
        "description": "${this.escapeHtml(article.excerpt)}",
        "articleSection": "${article.category}",
        "wordCount": ${article.content.split(/\s+/).length},
        "publisher": {
            "@type": "Organization",
            "name": "News Portal",
            "logo": {
                "@type": "ImageObject",
                "url": "https://seudominio.com/images/logo.png"
            }
        }
    }
    </script>

    <link rel="stylesheet" href="/css/style.css">
    <link rel="canonical" href="https://seudominio.com/articles/${article.language}/${article.category}/${article.slug}.html">

    <!-- Google Adsense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>

    <title>${this.escapeHtml(article.title)} | News Portal</title>
</head>
<body>
    <header class="site-header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <h1><a href="/">News Portal</a></h1>
                </div>
                <nav class="main-nav">
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/#brasil">Brasil</a></li>
                        <li><a href="/#mundo">Mundo</a></li>
                        <li><a href="/#economia">Economia</a></li>
                        <li><a href="/#tecnologia">Tecnologia</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <main class="article-page">
        <div class="container">
            <article class="article-content" itemscope itemtype="https://schema.org/NewsArticle">
                <header class="article-header">
                    <div class="article-category">${article.category.toUpperCase()}</div>
                    <h1 itemprop="headline">${article.title}</h1>
                    <div class="article-meta">
                        <time itemprop="datePublished" datetime="${article.created_at}">${formattedDate}</time>
                        <span class="reading-time">${article.readingTime || 5} min de leitura</span>
                    </div>
                </header>

                ${article.image ? `
                <figure class="article-image">
                    <img src="${article.image}" alt="${this.escapeHtml(article.title)}" itemprop="image">
                </figure>
                ` : ''}

                <div class="article-excerpt">
                    <p><strong>${article.excerpt}</strong></p>
                </div>

                <!-- Adsense In-Article -->
                <div class="ad-container">
                    <ins class="adsbygoogle"
                         style="display:block; text-align:center;"
                         data-ad-layout="in-article"
                         data-ad-format="fluid"
                         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                         data-ad-slot="XXXXXXXXXX"></ins>
                    <script>
                         (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>

                <div class="article-body" itemprop="articleBody">
                    ${article.content}
                </div>

                <footer class="article-footer">
                    <div class="article-tags">
                        ${(article.keywords || []).map(kw => `<span class="tag">${kw}</span>`).join('')}
                    </div>
                    <div class="article-share">
                        <p>Compartilhe:</p>
                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}" target="_blank">Twitter</a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://seudominio.com/articles/' + article.slug)}" target="_blank">Facebook</a>
                    </div>
                </footer>
            </article>
        </div>
    </main>

    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2026 News Portal. Todos os direitos reservados.</p>
        </div>
    </footer>
</body>
</html>`;
    }

    /**
     * Verifica se o artigo é duplicado
     */
    async isDuplicate(title) {
        const indexPath = path.join(this.dataDir, 'published-titles.json');

        try {
            const data = await fs.readFile(indexPath, 'utf8');
            const titles = JSON.parse(data);

            // Similaridade simples
            const normalized = title.toLowerCase().trim();

            return titles.some(t =>
                this.calculateStringSimilarity(t.toLowerCase(), normalized) > 0.8
            );
        } catch (error) {
            return false;
        }
    }

    /**
     * Adiciona artigo ao índice
     */
    async addToIndex(article) {
        const indexPath = path.join(this.dataDir, 'articles-index.json');
        const titlesPath = path.join(this.dataDir, 'published-titles.json');

        // Atualiza índice de artigos
        let articles = [];
        try {
            const data = await fs.readFile(indexPath, 'utf8');
            articles = JSON.parse(data);
        } catch (error) {
            // Arquivo não existe ainda
        }

        articles.unshift({
            title: article.title,
            excerpt: article.excerpt,
            category: article.category,
            language: article.language,
            image: article.image,
            url: article.url,
            publishedAt: article.created_at,
            readingTime: article.readingTime
        });

        // Mantém últimos 1000 artigos
        articles = articles.slice(0, 1000);

        await fs.writeFile(indexPath, JSON.stringify(articles, null, 2));

        // Atualiza lista de títulos
        let titles = [];
        try {
            const data = await fs.readFile(titlesPath, 'utf8');
            titles = JSON.parse(data);
        } catch (error) {
            // Arquivo não existe
        }

        titles.unshift(article.title);
        titles = titles.slice(0, 5000); // Últimos 5000 títulos

        await fs.writeFile(titlesPath, JSON.stringify(titles, null, 2));
    }

    /**
     * Atualiza índices por categoria e idioma
     */
    async updateIndices() {
        const indexPath = path.join(this.dataDir, 'articles-index.json');

        try {
            const data = await fs.readFile(indexPath, 'utf8');
            const allArticles = JSON.parse(data);

            const languages = ['pt-BR', 'en-US', 'es'];
            const categories = ['brasil', 'mundo', 'economia', 'tecnologia'];

            // Cria índices específicos
            for (const lang of languages) {
                for (const cat of categories) {
                    const filtered = allArticles.filter(a =>
                        a.language === lang && a.category === cat
                    ).slice(0, 50);

                    const catIndexPath = path.join(
                        this.dataDir,
                        'indices',
                        `${lang}-${cat}.json`
                    );

                    await this.ensureDirectory(path.dirname(catIndexPath));
                    await fs.writeFile(catIndexPath, JSON.stringify(filtered, null, 2));
                }
            }

            console.log('✅ Indices updated');
        } catch (error) {
            console.error('Error updating indices:', error);
        }
    }

    /**
     * Utilitários
     */
    async ensureDirectories() {
        const dirs = [
            this.outputDir,
            this.dataDir,
            path.join(this.dataDir, 'indices')
        ];

        const languages = ['pt-BR', 'en-US', 'es'];
        const categories = ['brasil', 'mundo', 'economia', 'tecnologia'];

        for (const lang of languages) {
            for (const cat of categories) {
                dirs.push(path.join(this.outputDir, lang, cat));
            }
        }

        for (const dir of dirs) {
            await this.ensureDirectory(dir);
        }
    }

    async ensureDirectory(dir) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            // Directory exists
        }
    }

    calculateStringSimilarity(s1, s2) {
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    levenshteinDistance(s1, s2) {
        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { AutomatedPublisher };
