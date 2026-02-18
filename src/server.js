/**
 * NEWS PORTAL SERVER
 *
 * Servidor Express que serve o portal e API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
// Serve data directory for JSON files
app.use('/data', express.static(path.join(__dirname, '../data')));

// Data paths
const DATA_DIR = path.join(__dirname, '../data');
const ARTICLES_INDEX = path.join(DATA_DIR, 'articles-index.json');

/**
 * Health Check Helper
 */
async function getHealthData() {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',

        // Verifica arquivos essenciais
        files: {
            articlesIndex: await fs.access(ARTICLES_INDEX).then(() => true).catch(() => false)
        },

        // APIs configuradas
        apis: {
            anthropic: !!process.env.ANTHROPIC_API_KEY,
            newsApi: !!process.env.NEWS_API_KEY,
            apiFootball: !!process.env.API_FOOTBALL_KEY
        },

        // Estatísticas
        stats: {}
    };

    // Conta artigos
    try {
        const data = await fs.readFile(ARTICLES_INDEX, 'utf8');
        const articles = JSON.parse(data);
        health.stats.totalArticles = articles.length;
        health.stats.latestArticle = articles[0]?.publishedAt || null;
    } catch (error) {
        health.stats.totalArticles = 0;
    }

    // Tamanho do cache
    try {
        const cacheDir = path.join(__dirname, '../data/cache');
        const files = await fs.readdir(cacheDir, { recursive: true });
        health.stats.cacheFiles = files.length;
    } catch (error) {
        health.stats.cacheFiles = 0;
    }

    // Memória
    const memUsage = process.memoryUsage();
    health.memory = {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
    };

    return health;
}

/**
 * API Routes
 */

// Get featured article
app.get('/api/featured', async (req, res) => {
    try {
        const lang = req.query.lang || 'pt-BR';
        const data = await fs.readFile(ARTICLES_INDEX, 'utf8');
        const articles = JSON.parse(data);

        const featured = articles.find(a => a.language === lang) || articles[0];

        res.json(featured);
    } catch (error) {
        console.error('Error getting featured:', error);
        res.status(500).json({ error: 'Failed to load featured article' });
    }
});

// Get news by category
app.get('/api/news', async (req, res) => {
    try {
        const { category, lang = 'pt-BR', page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const data = await fs.readFile(ARTICLES_INDEX, 'utf8');
        const allArticles = JSON.parse(data);

        let filtered = allArticles.filter(a => a.language === lang);
        if (category) {
            filtered = filtered.filter(a => a.category === category);
        }

        const total = filtered.length;
        const start = (pageNum - 1) * limitNum;
        const articles = filtered.slice(start, start + limitNum);

        res.json({ articles, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    } catch (error) {
        console.error('Error getting news:', error);
        res.status(500).json({ error: 'Failed to load news' });
    }
});

// Get trending articles
app.get('/api/trending', async (req, res) => {
    try {
        const lang = req.query.lang || 'pt-BR';
        const data = await fs.readFile(ARTICLES_INDEX, 'utf8');
        const articles = JSON.parse(data);

        const trending = articles
            .filter(a => a.language === lang)
            .slice(0, 5);

        res.json(trending);
    } catch (error) {
        console.error('Error getting trending:', error);
        res.status(500).json({ error: 'Failed to load trending' });
    }
});

// Newsletter subscription
app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email' });
        }

        // Save to newsletter list
        const newsletterPath = path.join(DATA_DIR, 'newsletter.json');

        let subscribers = [];
        try {
            const data = await fs.readFile(newsletterPath, 'utf8');
            subscribers = JSON.parse(data);
        } catch (error) {
            // File doesn't exist
        }

        if (!subscribers.includes(email)) {
            subscribers.push(email);
            await fs.writeFile(newsletterPath, JSON.stringify(subscribers, null, 2));
        }

        res.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Newsletter error:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// Sitemap
app.get('/sitemap.xml', async (req, res) => {
    try {
        const data = await fs.readFile(ARTICLES_INDEX, 'utf8');
        const articles = JSON.parse(data);

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://bolanarede.com.br/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>hourly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://bolanarede.com.br/regionais.html</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
`;

        articles.slice(0, 500).forEach(article => {
            sitemap += `
    <url>
        <loc>https://bolanarede.com.br${article.url}</loc>
        <lastmod>${article.publishedAt}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>`;
        });

        sitemap += '\n</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Sitemap error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// RSS Feed
app.get('/rss.xml', async (req, res) => {
    try {
        const lang = req.query.lang || 'pt-BR';
        const data = await fs.readFile(ARTICLES_INDEX, 'utf8');
        const articles = JSON.parse(data);

        const filtered = articles.filter(a => a.language === lang).slice(0, 20);

        let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Bola na Rede - Futebol Brasileiro Sem Filtro</title>
        <link>https://bolanarede.com.br</link>
        <description>O maior portal de futebol do Brasil. Brasileirão, Neymar, Copa 2026, Mercado da Bola e análises táticas exclusivas.</description>
        <language>${lang}</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="https://bolanarede.com.br/rss.xml" rel="self" type="application/rss+xml"/>
`;

        filtered.forEach(article => {
            rss += `
        <item>
            <title>${escapeXml(article.title)}</title>
            <link>https://bolanarede.com.br${article.url}</link>
            <description>${escapeXml(article.excerpt)}</description>
            <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
            <guid>https://bolanarede.com.br${article.url}</guid>
        </item>`;
        });

        rss += `
    </channel>
</rss>`;

        res.header('Content-Type', 'application/xml');
        res.send(rss);
    } catch (error) {
        console.error('RSS error:', error);
        res.status(500).send('Error generating RSS feed');
    }
});

// Health check endpoints
app.get('/health', async (req, res) => {
    try {
        const healthData = await getHealthData();
        res.json(healthData);
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Readiness check (para K8s/Docker)
app.get('/ready', async (req, res) => {
    try {
        // Verifica se arquivos essenciais existem
        await fs.access(ARTICLES_INDEX);
        res.status(200).send('Ready');
    } catch (error) {
        res.status(503).send('Not Ready');
    }
});

// Liveness check (para K8s/Docker)
app.get('/live', (req, res) => {
    res.status(200).send('Alive');
});

// Serve article pages
app.get('/articles/:lang/:category/:slug.html', async (req, res) => {
    const filePath = path.join(
        __dirname,
        '../public/articles',
        req.params.lang,
        req.params.category,
        `${req.params.slug}.html`
    );

    try {
        await fs.access(filePath);
        res.sendFile(filePath);
    } catch (error) {
        res.status(404).send('Article not found');
    }
});

// Fallback to index.html only for HTML page requests (not API/data/assets)
app.get('*', (req, res) => {
    // Don't serve index.html for requests that look like files (with extensions)
    if (req.path.match(/\.\w+$/) && !req.path.endsWith('.html')) {
        return res.status(404).json({ error: 'File not found' });
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 News Portal running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`🗺️  Sitemap: http://localhost:${PORT}/sitemap.xml`);
    console.log(`📡 RSS Feed: http://localhost:${PORT}/rss.xml`);
});

// Utility
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

module.exports = app;
