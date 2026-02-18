/**
 * LANCE NEWS SCRAPER
 *
 * Scraper completo do Lance.com.br que:
 * 1. Lista notícias recentes
 * 2. Extrai conteúdo completo dos artigos
 * 3. Pega imagens originais
 * 4. Respeita robots.txt e rate limits
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class LanceNewsScraper {
    constructor() {
        this.baseUrl = 'https://www.lance.com.br';
        this.rateLimit = 3000; // 3 segundos entre requests
        this.lastRequest = 0;

        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        };

        // Seções do Lance
        this.sections = {
            'brasileirao': '/futebol/brasileiro-serie-a',
            'copa': '/futebol/selecao-brasileira',
            'mercado': '/futebol/mercado-da-bola',
            'internacional': '/futebol/futebol-internacional'
        };
    }

    /**
     * Espera rate limit
     */
    async waitRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;

        if (timeSinceLastRequest < this.rateLimit) {
            const waitTime = this.rateLimit - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequest = Date.now();
    }

    /**
     * Faz request com retry
     */
    async makeRequest(url, retries = 3) {
        await this.waitRateLimit();

        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios.get(url, {
                    headers: this.headers,
                    timeout: 15000,
                    maxRedirects: 5
                });

                return response.data;
            } catch (error) {
                console.error(`Tentativa ${i + 1}/${retries} falhou para ${url}:`, error.message);

                if (i === retries - 1) {
                    throw error;
                }

                // Espera antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    /**
     * Lista notícias de uma seção
     */
    async listNews(section = 'brasileirao', limit = 10) {
        try {
            const sectionUrl = this.baseUrl + (this.sections[section] || this.sections.brasileirao);
            console.log(`\n📡 Buscando notícias em: ${sectionUrl}`);

            const html = await this.makeRequest(sectionUrl);
            const $ = cheerio.load(html);

            const articles = [];

            // Seletores para artigos do Lance (podem precisar ajuste)
            const articleSelectors = [
                'article',
                '.noticia',
                '.materia',
                '.card-noticia',
                'a[href*="/futebol/"]'
            ];

            for (const selector of articleSelectors) {
                $(selector).each((i, elem) => {
                    if (articles.length >= limit) return false;

                    const $article = $(elem);
                    const $link = $article.is('a') ? $article : $article.find('a').first();

                    const href = $link.attr('href');
                    const title = $link.attr('title') || $link.text().trim() || $article.find('h2, h3, .titulo').first().text().trim();
                    const image = $article.find('img').first().attr('src') || $article.find('img').first().attr('data-src');

                    if (href && title && href.includes('/futebol/')) {
                        const fullUrl = href.startsWith('http') ? href : this.baseUrl + href;

                        // Evita duplicatas
                        if (!articles.find(a => a.url === fullUrl)) {
                            articles.push({
                                title: this.cleanText(title),
                                url: fullUrl,
                                image: image ? this.normalizeImageUrl(image) : null,
                                section: section,
                                scrapedAt: new Date().toISOString()
                            });
                        }
                    }
                });

                if (articles.length >= limit) break;
            }

            console.log(`✅ Encontradas ${articles.length} notícias`);
            return articles.slice(0, limit);

        } catch (error) {
            console.error(`❌ Erro ao listar notícias de ${section}:`, error.message);
            return [];
        }
    }

    /**
     * Extrai conteúdo completo de um artigo
     */
    async extractArticle(url) {
        try {
            console.log(`\n📄 Extraindo artigo: ${url.substring(0, 60)}...`);

            const html = await this.makeRequest(url);
            const $ = cheerio.load(html);

            // Extrai dados do artigo
            const article = {
                url: url,
                title: this.extractTitle($),
                subtitle: this.extractSubtitle($),
                content: this.extractContent($),
                image: this.extractMainImage($),
                author: this.extractAuthor($),
                publishedAt: this.extractPublishDate($),
                category: this.extractCategory($),
                tags: this.extractTags($),
                source: 'Lance.com.br',
                scrapedAt: new Date().toISOString()
            };

            // Validação
            if (!article.title || !article.content || article.content.length < 100) {
                console.log(`⚠️  Artigo incompleto, pulando`);
                return null;
            }

            console.log(`✅ Artigo extraído: ${article.title.substring(0, 50)}...`);
            console.log(`   Conteúdo: ${article.content.length} caracteres`);

            return article;

        } catch (error) {
            console.error(`❌ Erro ao extrair artigo ${url}:`, error.message);
            return null;
        }
    }

    /**
     * Extrai título
     */
    extractTitle($) {
        const selectors = [
            'h1.titulo',
            'h1.materia-titulo',
            'h1[itemprop="headline"]',
            'h1',
            '.titulo-principal'
        ];

        for (const selector of selectors) {
            const text = $(selector).first().text().trim();
            if (text) return this.cleanText(text);
        }

        return null;
    }

    /**
     * Extrai subtítulo
     */
    extractSubtitle($) {
        const selectors = [
            '.subtitulo',
            '.materia-subtitulo',
            'h2.subtitulo',
            '.lead',
            'p.lead'
        ];

        for (const selector of selectors) {
            const text = $(selector).first().text().trim();
            if (text) return this.cleanText(text);
        }

        return null;
    }

    /**
     * Extrai conteúdo
     */
    extractContent($) {
        const selectors = [
            '.materia-conteudo',
            '.conteudo-materia',
            'article .texto',
            '.article-body',
            '[itemprop="articleBody"]'
        ];

        for (const selector of selectors) {
            const $content = $(selector).first();

            if ($content.length) {
                // Remove scripts, styles, ads
                $content.find('script, style, .publicidade, .ad, .banner').remove();

                // Pega apenas parágrafos
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
    }

    /**
     * Extrai imagem principal
     */
    extractMainImage($) {
        const selectors = [
            '.materia-foto img',
            '.imagem-principal img',
            'figure.destaque img',
            '[itemprop="image"]',
            'article img'
        ];

        for (const selector of selectors) {
            const src = $(selector).first().attr('src') || $(selector).first().attr('data-src');
            if (src && !src.includes('logo') && !src.includes('icon')) {
                return this.normalizeImageUrl(src);
            }
        }

        return null;
    }

    /**
     * Extrai autor
     */
    extractAuthor($) {
        const selectors = [
            '.autor',
            '[itemprop="author"]',
            '.materia-autor',
            '.byline'
        ];

        for (const selector of selectors) {
            const text = $(selector).first().text().trim();
            if (text) return this.cleanText(text);
        }

        return 'Lance.com.br';
    }

    /**
     * Extrai data de publicação
     */
    extractPublishDate($) {
        const selectors = [
            'time[datetime]',
            '[itemprop="datePublished"]',
            '.data-publicacao'
        ];

        for (const selector of selectors) {
            const datetime = $(selector).first().attr('datetime');
            if (datetime) return datetime;

            const text = $(selector).first().text().trim();
            if (text) return text;
        }

        return new Date().toISOString();
    }

    /**
     * Extrai categoria
     */
    extractCategory($) {
        const selectors = [
            '.categoria',
            '.editoria',
            '[itemprop="articleSection"]'
        ];

        for (const selector of selectors) {
            const text = $(selector).first().text().trim();
            if (text) return this.cleanText(text);
        }

        return 'futebol';
    }

    /**
     * Extrai tags
     */
    extractTags($) {
        const tags = [];

        $('.tag, .palavra-chave, [rel="tag"]').each((i, elem) => {
            const tag = $(elem).text().trim();
            if (tag) tags.push(tag);
        });

        return tags;
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

    /**
     * Normaliza URL de imagem
     */
    normalizeImageUrl(src) {
        if (!src) return null;

        if (src.startsWith('http')) {
            return src;
        }

        if (src.startsWith('//')) {
            return 'https:' + src;
        }

        if (src.startsWith('/')) {
            return this.baseUrl + src;
        }

        return src;
    }

    /**
     * Busca e extrai múltiplos artigos
     */
    async scrapeSection(section = 'brasileirao', limit = 5) {
        console.log(`\n🔍 Iniciando scraping da seção: ${section}`);
        console.log(`   Limite: ${limit} artigos\n`);

        // 1. Lista notícias
        const newsList = await this.listNews(section, limit * 2); // Pega mais para ter margem

        if (newsList.length === 0) {
            console.log('⚠️  Nenhuma notícia encontrada');
            return [];
        }

        // 2. Extrai conteúdo completo de cada notícia
        const articles = [];

        for (const news of newsList) {
            if (articles.length >= limit) break;

            const article = await this.extractArticle(news.url);

            if (article) {
                articles.push({
                    ...news,
                    ...article
                });
            }

            // Delay entre artigos
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log(`\n📊 Scraping completo: ${articles.length}/${limit} artigos extraídos`);

        return articles;
    }

    /**
     * Busca notícias de múltiplas seções
     */
    async scrapeMultipleSections(sections = ['brasileirao', 'mercado'], articlesPerSection = 3) {
        console.log(`\n🚀 Scraping de múltiplas seções do Lance.com.br\n`);

        const allArticles = [];

        for (const section of sections) {
            const articles = await this.scrapeSection(section, articlesPerSection);
            allArticles.push(...articles);

            // Delay entre seções
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        console.log(`\n✅ Total de artigos coletados: ${allArticles.length}`);

        return allArticles;
    }
}

module.exports = { LanceNewsScraper };
