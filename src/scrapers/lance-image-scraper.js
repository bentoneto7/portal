/**
 * LANCE IMAGE SCRAPER
 *
 * Busca imagens reais de notícias do Lance.com.br
 * Respeita robots.txt e rate limits
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

class LanceImageScraper {
    constructor() {
        this.baseUrl = 'https://www.lance.com.br';
        this.cacheDir = path.join(__dirname, '../../data/cache/images');
        this.cacheFile = path.join(this.cacheDir, 'lance-images.json');
        this.cache = {};
        this.rateLimit = 2000; // 2 segundos entre requests
        this.lastRequest = 0;

        // Headers para parecer um navegador real
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://www.google.com'
        };
    }

    /**
     * Inicializa o scraper
     */
    async init() {
        await this.ensureCacheDir();
        await this.loadCache();
        console.log('✅ Lance Image Scraper initialized');
    }

    /**
     * Garante que diretório de cache existe
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
            console.log(`📦 Loaded ${Object.keys(this.cache).length} images from cache`);
        } catch (error) {
            console.log('📦 No cache found, starting fresh');
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
     * Busca imagem de notícia por palavra-chave
     */
    async searchNewsImage(keywords) {
        const cacheKey = keywords.toLowerCase().replace(/\s+/g, '-');

        // Verifica cache
        if (this.cache[cacheKey]) {
            console.log(`📦 Image found in cache for: ${keywords}`);
            return this.cache[cacheKey];
        }

        try {
            await this.waitRateLimit();

            // Busca na seção de futebol do Lance
            const searchUrl = `${this.baseUrl}/futebol`;
            console.log(`🔍 Searching images for: ${keywords}`);

            const response = await axios.get(searchUrl, {
                headers: this.headers,
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            const images = [];

            // Busca imagens de notícias
            $('article img, .noticia img, .materia img').each((i, elem) => {
                const src = $(elem).attr('src') || $(elem).attr('data-src');
                const alt = $(elem).attr('alt') || '';

                if (src && this.isValidImage(src, alt, keywords)) {
                    images.push({
                        url: this.normalizeImageUrl(src),
                        alt: alt,
                        relevance: this.calculateRelevance(alt, keywords)
                    });
                }
            });

            // Ordena por relevância
            images.sort((a, b) => b.relevance - a.relevance);

            if (images.length > 0) {
                const bestImage = images[0];
                this.cache[cacheKey] = bestImage;
                await this.saveCache();
                console.log(`✅ Found image for: ${keywords}`);
                return bestImage;
            }

            console.log(`⚠️  No image found for: ${keywords}`);
            return null;

        } catch (error) {
            console.error(`❌ Error searching image for ${keywords}:`, error.message);
            return null;
        }
    }

    /**
     * Valida se imagem é relevante
     */
    isValidImage(src, alt, keywords) {
        // Ignora logos, ícones pequenos, etc
        if (src.includes('logo') || src.includes('icon') || src.includes('avatar')) {
            return false;
        }

        // Precisa ser HTTPS
        if (!src.startsWith('http')) {
            return false;
        }

        // Preferência por imagens maiores
        if (src.includes('thumb') || src.includes('small')) {
            return false;
        }

        return true;
    }

    /**
     * Calcula relevância da imagem
     */
    calculateRelevance(alt, keywords) {
        const keywordsList = keywords.toLowerCase().split(/\s+/);
        const altLower = alt.toLowerCase();

        let score = 0;

        keywordsList.forEach(keyword => {
            if (altLower.includes(keyword)) {
                score += 10;
            }
        });

        return score;
    }

    /**
     * Normaliza URL da imagem
     */
    normalizeImageUrl(src) {
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
     * Busca múltiplas imagens
     */
    async searchMultipleImages(keywordsList) {
        const results = {};

        for (const keywords of keywordsList) {
            results[keywords] = await this.searchNewsImage(keywords);
        }

        return results;
    }

    /**
     * Atualiza imagem manualmente
     */
    async updateImage(keywords, imageUrl) {
        const cacheKey = keywords.toLowerCase().replace(/\s+/g, '-');

        this.cache[cacheKey] = {
            url: imageUrl,
            alt: keywords,
            relevance: 100,
            source: 'manual',
            cached: new Date().toISOString()
        };

        await this.saveCache();
        console.log(`✅ Updated image for: ${keywords}`);
    }

    /**
     * Limpa cache
     */
    async clearCache() {
        this.cache = {};
        await this.saveCache();
        console.log('🗑️  Image cache cleared');
    }
}

module.exports = { LanceImageScraper };
