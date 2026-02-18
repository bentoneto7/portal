/**
 * SEO GENERATOR
 *
 * Gera meta tags, Schema.org markup, Open Graph, Twitter Cards
 * para máxima visibilidade em buscadores e redes sociais
 */

class SEOGenerator {
    constructor() {
        this.siteUrl = 'https://bolanarede.com.br';
        this.siteName = 'Bola na Rede';
        this.siteDescription = 'Portal de notícias de futebol brasileiro e mundial com cobertura completa, análises táticas e bastidores';
        this.twitterHandle = '@bolanarede';
        this.facebookAppId = ''; // Configurar depois
    }

    /**
     * Gera Schema.org NewsArticle markup
     */
    generateNewsArticleSchema(article) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "description": article.excerpt || article.subtitle,
            "image": {
                "@type": "ImageObject",
                "url": article.image,
                "width": 1200,
                "height": 630
            },
            "datePublished": article.publishedAt,
            "dateModified": article.updatedAt || article.publishedAt,
            "author": {
                "@type": "Person",
                "name": article.author || "Redação Bola na Rede",
                "url": `${this.siteUrl}/autor/${this.slugify(article.author || 'redacao')}`
            },
            "publisher": {
                "@type": "Organization",
                "name": this.siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${this.siteUrl}/images/logo.png`,
                    "width": 600,
                    "height": 60
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${this.siteUrl}/artigo/${article.id}`
            },
            "articleSection": article.section || "Futebol",
            "keywords": this.extractKeywords(article),
            "wordCount": this.estimateWordCount(article.content),
            "inLanguage": "pt-BR",
            "isAccessibleForFree": true,
            "hasPart": {
                "@type": "WebPageElement",
                "isAccessibleForFree": true,
                "cssSelector": ".article-content"
            }
        };

        // Adiciona breadcrumb
        schema.breadcrumb = this.generateBreadcrumbSchema(article);

        return schema;
    }

    /**
     * Gera Breadcrumb Schema
     */
    generateBreadcrumbSchema(article) {
        return {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": this.siteUrl
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": article.section || "Notícias",
                    "item": `${this.siteUrl}/${this.slugify(article.section || 'noticias')}`
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": article.title,
                    "item": `${this.siteUrl}/artigo/${article.id}`
                }
            ]
        };
    }

    /**
     * Gera SportsOrganization Schema (para times)
     */
    generateSportsTeamSchema(teamName) {
        return {
            "@context": "https://schema.org",
            "@type": "SportsOrganization",
            "name": teamName,
            "sport": "Futebol",
            "logo": `${this.siteUrl}/images/escudos/${this.slugify(teamName)}.png`,
            "location": {
                "@type": "Place",
                "addressCountry": "BR"
            }
        };
    }

    /**
     * Gera meta tags Open Graph
     */
    generateOpenGraphTags(article) {
        return `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${this.siteUrl}/artigo/${article.id}">
    <meta property="og:title" content="${this.escapeHtml(article.title)}">
    <meta property="og:description" content="${this.escapeHtml(article.excerpt || article.subtitle)}">
    <meta property="og:image" content="${article.image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="${this.siteName}">
    <meta property="og:locale" content="pt_BR">
    <meta property="article:published_time" content="${article.publishedAt}">
    <meta property="article:modified_time" content="${article.updatedAt || article.publishedAt}">
    <meta property="article:author" content="${article.author || 'Redação Bola na Rede'}">
    <meta property="article:section" content="${article.section || 'Futebol'}">
    ${article.tags ? article.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n    ') : ''}
    ${this.facebookAppId ? `<meta property="fb:app_id" content="${this.facebookAppId}">` : ''}`;
    }

    /**
     * Gera meta tags Twitter Card
     */
    generateTwitterCardTags(article) {
        return `
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="${this.twitterHandle}">
    <meta name="twitter:creator" content="${this.twitterHandle}">
    <meta name="twitter:title" content="${this.escapeHtml(article.title)}">
    <meta name="twitter:description" content="${this.escapeHtml(article.excerpt || article.subtitle)}">
    <meta name="twitter:image" content="${article.image}">
    <meta name="twitter:image:alt" content="${this.escapeHtml(article.title)}">`;
    }

    /**
     * Gera meta tags básicas
     */
    generateBasicMetaTags(article) {
        const keywords = this.extractKeywords(article);

        return `
    <!-- Meta Tags Básicas -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${this.escapeHtml(article.excerpt || article.subtitle)}">
    <meta name="keywords" content="${keywords.join(', ')}">
    <meta name="author" content="${article.author || 'Redação Bola na Rede'}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow">
    <meta name="language" content="Portuguese">
    <meta name="revisit-after" content="1 days">
    <link rel="canonical" href="${this.siteUrl}/artigo/${article.id}">`;
    }

    /**
     * Gera meta tags de aplicativo
     */
    generateAppMetaTags() {
        return `
    <!-- PWA / Mobile App -->
    <meta name="theme-color" content="#1a472a">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Bola na Rede">
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/images/icon-192.png">`;
    }

    /**
     * Gera TODAS as meta tags de uma vez
     */
    generateAllMetaTags(article) {
        return `${this.generateBasicMetaTags(article)}
${this.generateOpenGraphTags(article)}
${this.generateTwitterCardTags(article)}
${this.generateAppMetaTags()}`;
    }

    /**
     * Gera script de Schema.org
     */
    generateSchemaScript(article) {
        const schema = this.generateNewsArticleSchema(article);

        return `
    <!-- Schema.org NewsArticle -->
    <script type="application/ld+json">
    ${JSON.stringify(schema, null, 2)}
    </script>`;
    }

    /**
     * Extrai keywords do artigo
     */
    extractKeywords(article) {
        const keywords = new Set(['futebol', 'brasil']);

        // Adiciona seção
        if (article.section) {
            keywords.add(article.section.toLowerCase());
        }

        // Adiciona tags se existirem
        if (article.tags) {
            article.tags.forEach(tag => keywords.add(tag.toLowerCase()));
        }

        // Extrai palavras-chave do título
        const titleWords = article.title
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 4 && !this.isStopWord(w));

        titleWords.slice(0, 5).forEach(w => keywords.add(w));

        // Adiciona times se detectados
        const teams = this.detectTeams(article.title);
        teams.forEach(team => keywords.add(team.toLowerCase()));

        return Array.from(keywords).slice(0, 15);
    }

    /**
     * Detecta nomes de times
     */
    detectTeams(text) {
        const teams = [
            'Flamengo', 'Corinthians', 'Palmeiras', 'São Paulo',
            'Santos', 'Vasco', 'Botafogo', 'Fluminense',
            'Grêmio', 'Internacional', 'Atlético-MG', 'Cruzeiro',
            'Athletico', 'Bahia', 'Fortaleza'
        ];

        return teams.filter(team => text.includes(team));
    }

    /**
     * Verifica se é stop word
     */
    isStopWord(word) {
        const stopWords = [
            'para', 'com', 'sem', 'por', 'mais', 'sobre',
            'após', 'ante', 'contra', 'desde', 'entre'
        ];
        return stopWords.includes(word);
    }

    /**
     * Estima contagem de palavras
     */
    estimateWordCount(content) {
        if (!content) return 0;
        return content.split(/\s+/).length;
    }

    /**
     * Cria slug
     */
    slugify(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Escapa HTML
     */
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
}

module.exports = { SEOGenerator };
