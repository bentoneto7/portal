/**
 * RSS NEWS SCRAPER
 *
 * Scraper usando RSS feeds públicos de portais esportivos brasileiros
 * Solução legal, ética e sem risco de bloqueio (403)
 *
 * Fontes:
 * - GE Globo (ge.globo.com)
 * - UOL Esporte (esporte.uol.com.br)
 * - ESPN Brasil (espn.com.br)
 * - Fox Sports (foxsports.com.br)
 */

const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { AthleteImageScraper } = require('./athlete-image-scraper');

class RSSNewsScraper {
    constructor() {
        this.athleteImages = new AthleteImageScraper();

        this.parser = new Parser({
            customFields: {
                item: [
                    ['media:content', 'media'],
                    ['media:thumbnail', 'thumbnail'],
                    ['description', 'description'],
                    ['content:encoded', 'contentEncoded']
                ]
            }
        });

        // RSS Feeds públicos de futebol brasileiro
        this.feeds = {
            'ge': 'https://ge.globo.com/rss/futebol/',
            'uol': 'https://esporte.uol.com.br/futebol/index.xml',
            'espn': 'https://www.espn.com.br/espn/rss/news',
            'lance': 'https://www.lance.com.br/feed/rss', // RSS funciona mesmo com scraping bloqueado
        };

        // Cache
        this.cacheDir = path.join(__dirname, '../../data/cache/rss');
        this.cacheFile = path.join(this.cacheDir, 'rss-articles.json');
        this.cache = {};
        this.cacheDuration = 30 * 60 * 1000; // 30 minutos

        // Mapa de categorias
        this.categoryMap = {
            'brasileirao': ['brasileirão', 'brasileiro', 'série a'],
            'copa': ['copa', 'seleção', 'seleção brasileira'],
            'mercado': ['mercado', 'contratação', 'transferência'],
            'internacional': ['champions', 'europa', 'premier league', 'la liga']
        };
    }

    /**
     * Inicializa
     */
    async init() {
        await this.ensureCacheDir();
        await this.loadCache();
        await this.athleteImages.init();
        console.log('✅ RSS News Scraper initialized');
    }

    /**
     * Garante diretório de cache
     */
    async ensureCacheDir() {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
        } catch (error) {
            console.error('Error creating cache dir:', error);
        }
    }

    /**
     * Carrega cache
     */
    async loadCache() {
        try {
            const data = await fs.readFile(this.cacheFile, 'utf8');
            this.cache = JSON.parse(data);
            console.log('📦 RSS cache loaded');
        } catch (error) {
            this.cache = {};
        }
    }

    /**
     * Salva cache
     */
    async saveCache() {
        try {
            await fs.writeFile(this.cacheFile, JSON.stringify(this.cache, null, 2), 'utf8');
        } catch (error) {
            console.error('Error saving cache:', error);
        }
    }

    /**
     * Verifica se cache é válido
     */
    isCacheValid(key) {
        if (!this.cache[key]) return false;

        const age = Date.now() - this.cache[key].timestamp;
        return age < this.cacheDuration;
    }

    /**
     * Busca notícias de um feed RSS
     */
    async fetchFeed(feedName, feedUrl) {
        const cacheKey = `feed_${feedName}`;

        // Verifica cache
        if (this.isCacheValid(cacheKey)) {
            console.log(`📦 Usando feed ${feedName} em cache`);
            return this.cache[cacheKey].data;
        }

        try {
            console.log(`📡 Buscando feed RSS: ${feedName} (${feedUrl})`);

            const feed = await this.parser.parseURL(feedUrl);
            const articles = [];

            for (const item of feed.items) {
                // Filtra apenas notícias de futebol
                if (!this.isFootballNews(item)) {
                    continue;
                }

                const article = {
                    title: this.cleanText(item.title),
                    url: item.link,
                    subtitle: this.extractSubtitle(item),
                    image: await this.extractImage(item), // ← AWAIT para buscar imagem real
                    publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
                    source: feedName.toUpperCase(),
                    section: this.detectCategory(item),
                    scrapedAt: new Date().toISOString()
                };

                articles.push(article);
            }

            // Salva em cache
            this.cache[cacheKey] = {
                data: articles,
                timestamp: Date.now()
            };
            await this.saveCache();

            console.log(`✅ ${articles.length} artigos de futebol encontrados em ${feedName}`);

            return articles;

        } catch (error) {
            console.error(`❌ Erro ao buscar feed ${feedName}:`, error.message);
            return [];
        }
    }

    /**
     * Verifica se é notícia de futebol
     */
    isFootballNews(item) {
        const text = (item.title + ' ' + (item.description || '')).toLowerCase();

        const footballKeywords = [
            'futebol', 'brasileirão', 'brasileiro', 'série a',
            'flamengo', 'palmeiras', 'santos', 'corinthians',
            'são paulo', 'vasco', 'botafogo', 'fluminense',
            'neymar', 'gabigol', 'gol', 'copa', 'seleção',
            'champions', 'libertadores', 'mercado', 'contratação'
        ];

        return footballKeywords.some(keyword => text.includes(keyword));
    }

    /**
     * Detecta categoria do artigo
     */
    detectCategory(item) {
        const text = (item.title + ' ' + (item.description || '')).toLowerCase();

        for (const [category, keywords] of Object.entries(this.categoryMap)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }

        return 'brasileirao'; // Categoria padrão
    }

    /**
     * Extrai subtítulo/descrição
     */
    extractSubtitle(item) {
        if (item.contentSnippet) {
            return this.cleanText(item.contentSnippet).substring(0, 200);
        }

        if (item.description) {
            // Remove tags HTML da descrição
            const $ = cheerio.load(item.description);
            return this.cleanText($.text()).substring(0, 200);
        }

        return null;
    }

    /**
     * Extrai imagem (ATUALIZADO com imagens reais de atletas)
     */
    async extractImage(item) {
        // 1. PRIMEIRO: Busca imagem REAL do atleta
        const athleteImage = await this.athleteImages.getImage(
            item.title,
            item.description || item.contentSnippet || ''
        );

        if (athleteImage && !athleteImage.includes('unsplash')) {
            // Encontrou imagem real do atleta!
            return athleteImage;
        }

        // 2. Tenta media:content do feed
        if (item.media && item.media.$) {
            return item.media.$.url;
        }

        // 3. Tenta media:thumbnail
        if (item.thumbnail && item.thumbnail.$) {
            return item.thumbnail.$.url;
        }

        // 4. Tenta enclosure
        if (item.enclosure && item.enclosure.url) {
            return item.enclosure.url;
        }

        // 5. Tenta extrair da descrição HTML
        if (item.description) {
            const $ = cheerio.load(item.description);
            const img = $('img').first().attr('src');
            if (img) return img;
        }

        // 6. Fallback final (imagem temática do atleta ou contexto)
        return athleteImage || 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1';
    }

    /**
     * Extrai conteúdo completo do artigo (se necessário)
     */
    async fetchFullArticle(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);

            // Tenta extrair conteúdo de vários seletores comuns
            const selectors = [
                'article .content',
                'article .texto',
                '.article-body',
                '.materia-conteudo',
                '[itemprop="articleBody"]',
                '.entry-content'
            ];

            for (const selector of selectors) {
                const $content = $(selector).first();

                if ($content.length) {
                    // Remove scripts, styles, ads
                    $content.find('script, style, .publicidade, .ad').remove();

                    const paragraphs = [];
                    $content.find('p').each((i, elem) => {
                        const text = $(elem).text().trim();
                        if (text && text.length > 30) {
                            paragraphs.push(text);
                        }
                    });

                    if (paragraphs.length > 0) {
                        return paragraphs.join('\n\n');
                    }
                }
            }

            return null;

        } catch (error) {
            console.error(`❌ Erro ao buscar conteúdo completo de ${url}:`, error.message);
            return null;
        }
    }

    /**
     * Busca notícias de múltiplos feeds
     */
    async scrapeMultipleSections(sections = ['brasileirao', 'mercado'], articlesPerSection = 3) {
        console.log('\n🚀 RSS Scraping de múltiplos feeds\n');

        const allArticles = [];

        // Busca de todos os feeds
        for (const [feedName, feedUrl] of Object.entries(this.feeds)) {
            const articles = await this.fetchFeed(feedName, feedUrl);
            allArticles.push(...articles);

            // Delay entre feeds
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log(`\n✅ Total de artigos coletados: ${allArticles.length}`);

        // Filtra por seções solicitadas
        const filteredArticles = [];
        const articlesPerSectionMap = {};

        for (const section of sections) {
            articlesPerSectionMap[section] = 0;
        }

        for (const article of allArticles) {
            if (sections.includes(article.section)) {
                if (articlesPerSectionMap[article.section] < articlesPerSection) {
                    filteredArticles.push(article);
                    articlesPerSectionMap[article.section]++;
                }
            }
        }

        console.log(`📊 Artigos filtrados por seção:`);
        for (const [section, count] of Object.entries(articlesPerSectionMap)) {
            console.log(`   ${section}: ${count} artigos`);
        }

        return filteredArticles;
    }

    /**
     * Busca e extrai artigos com conteúdo completo
     */
    async scrapeSection(section = 'brasileirao', limit = 5) {
        console.log(`\n🔍 Scraping RSS da seção: ${section}`);

        // Busca todos os feeds
        const allArticles = [];

        for (const [feedName, feedUrl] of Object.entries(this.feeds)) {
            const articles = await this.fetchFeed(feedName, feedUrl);

            // Filtra por seção
            const sectionArticles = articles.filter(a => a.section === section);
            allArticles.push(...sectionArticles);

            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Pega os mais recentes
        const recentArticles = allArticles
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, limit);

        // Busca conteúdo completo (opcional)
        for (const article of recentArticles) {
            if (!article.content) {
                article.content = await this.fetchFullArticle(article.url);

                // Usa subtítulo se não conseguir conteúdo
                if (!article.content && article.subtitle) {
                    article.content = article.subtitle;
                }

                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log(`✅ ${recentArticles.length} artigos completos de ${section}`);

        return recentArticles;
    }

    /**
     * Limpa texto
     */
    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, ' ')
            .trim();
    }
}

module.exports = { RSSNewsScraper };
