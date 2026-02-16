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
        const { category = 'brasil', lang = 'pt-BR' } = req.query;

        const indexPath = path.join(DATA_DIR, 'indices', `${lang}-${category}.json`);

        try {
            const data = await fs.readFile(indexPath, 'utf8');
            const articles = JSON.parse(data);
            res.json(articles);
        } catch (error) {
            // Fallback to main index
            const data = await fs.readFile(ARTICLES_INDEX, 'utf8');
            const allArticles = JSON.parse(data);

            const filtered = allArticles
                .filter(a => a.language === lang && a.category === category)
                .slice(0, 20);

            res.json(filtered);
        }
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
        <loc>https://seudominio.com/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>hourly</changefreq>
        <priority>1.0</priority>
    </url>
`;

        articles.slice(0, 500).forEach(article => {
            sitemap += `
    <url>
        <loc>https://seudominio.com${article.url}</loc>
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
        <title>News Portal</title>
        <link>https://seudominio.com</link>
        <description>Notícias em tempo real do Brasil e mundo</description>
        <language>${lang}</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="https://seudominio.com/rss.xml" rel="self" type="application/rss+xml"/>
`;

        filtered.forEach(article => {
            rss += `
        <item>
            <title>${escapeXml(article.title)}</title>
            <link>https://seudominio.com${article.url}</link>
            <description>${escapeXml(article.excerpt)}</description>
            <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
            <guid>https://seudominio.com${article.url}</guid>
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

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
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
