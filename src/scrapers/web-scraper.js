/**
 * WEB SCRAPER ÉTICO
 *
 * Sistema de scraping que:
 * - Respeita robots.txt
 * - Usa rate limiting
 * - User-agent identificado
 * - Apenas sites que permitem
 */

class WebScraper {
    constructor() {
        this.userAgent = 'NewsPortalBot/1.0 (+https://seudominio.com/bot)';
        this.minDelay = 2000; // 2 segundos entre requests
        this.lastRequest = {};

        // Sites que PERMITEM scraping (verificar robots.txt periodicamente)
        this.allowedSites = {
            // Exemplo de sites que geralmente permitem com moderação
            // SEMPRE verifique os Termos de Uso antes!
            tecnologia: [
                {
                    name: 'TecMundo',
                    url: 'https://www.tecmundo.com.br/',
                    allowed: true, // Verificar robots.txt
                    selectors: {
                        articles: 'article',
                        title: 'h2',
                        link: 'a',
                        excerpt: 'p',
                        image: 'img'
                    }
                }
                // Adicione mais sites APENAS se verificar que permitem
            ]
        };
    }

    /**
     * Verifica se pode fazer scraping de um site
     */
    async checkRobotsTxt(baseUrl) {
        try {
            const robotsUrl = new URL('/robots.txt', baseUrl).href;
            const response = await fetch(robotsUrl);

            if (!response.ok) {
                return { allowed: false, reason: 'No robots.txt' };
            }

            const robotsTxt = await response.text();

            // Parse simples do robots.txt
            const userAgentSection = this.parseRobotsTxt(robotsTxt);

            return userAgentSection;

        } catch (error) {
            console.error('Error checking robots.txt:', error);
            return { allowed: false, reason: 'Error reading robots.txt' };
        }
    }

    /**
     * Parse robots.txt
     */
    parseRobotsTxt(robotsTxt) {
        const lines = robotsTxt.split('\n');
        let currentUserAgent = null;
        const rules = {
            allowed: [],
            disallowed: []
        };

        for (const line of lines) {
            const trimmed = line.trim().toLowerCase();

            if (trimmed.startsWith('user-agent:')) {
                const agent = trimmed.split(':')[1].trim();
                if (agent === '*' || agent.includes('bot')) {
                    currentUserAgent = agent;
                }
            }

            if (currentUserAgent) {
                if (trimmed.startsWith('disallow:')) {
                    const path = trimmed.split(':')[1].trim();
                    rules.disallowed.push(path);
                }

                if (trimmed.startsWith('allow:')) {
                    const path = trimmed.split(':')[1].trim();
                    rules.allowed.push(path);
                }
            }
        }

        return {
            allowed: rules.disallowed.length === 0 || !rules.disallowed.includes('/'),
            rules: rules
        };
    }

    /**
     * Rate limiting - aguarda entre requests
     */
    async respectRateLimit(domain) {
        const now = Date.now();
        const lastReq = this.lastRequest[domain] || 0;
        const timeSinceLastReq = now - lastReq;

        if (timeSinceLastReq < this.minDelay) {
            const waitTime = this.minDelay - timeSinceLastReq;
            console.log(`⏳ Rate limiting: waiting ${waitTime}ms for ${domain}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequest[domain] = Date.now();
    }

    /**
     * Scrape de uma página (com respeito e ética)
     */
    async scrapePage(url, selectors) {
        try {
            const domain = new URL(url).hostname;

            // 1. Verifica robots.txt
            const robotsCheck = await this.checkRobotsTxt(url);
            if (!robotsCheck.allowed) {
                console.log(`🚫 Scraping not allowed for ${domain}: ${robotsCheck.reason}`);
                return [];
            }

            // 2. Rate limiting
            await this.respectRateLimit(domain);

            // 3. Faz o request
            console.log(`🕷️  Scraping ${url}...`);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();

            // 4. Parse HTML
            return this.parseHTML(html, selectors, url);

        } catch (error) {
            console.error(`Error scraping ${url}:`, error.message);
            return [];
        }
    }

    /**
     * Parse HTML simples (sem bibliotecas externas)
     */
    parseHTML(html, selectors, baseUrl) {
        const articles = [];

        // Regex para encontrar artigos
        // NOTA: Isso é uma simplificação. Para produção, use uma biblioteca como cheerio
        const articlePattern = new RegExp(`<${selectors.articles}[^>]*>([\\s\\S]*?)<\\/${selectors.articles}>`, 'gi');

        let match;
        while ((match = articlePattern.exec(html)) !== null) {
            const articleHTML = match[1];

            try {
                const article = {
                    title: this.extractWithSelector(articleHTML, selectors.title),
                    url: this.extractLink(articleHTML, selectors.link, baseUrl),
                    description: this.extractWithSelector(articleHTML, selectors.excerpt),
                    urlToImage: this.extractImage(articleHTML, selectors.image, baseUrl),
                    source: new URL(baseUrl).hostname,
                    publishedAt: new Date().toISOString()
                };

                // Limpa descrição
                if (article.description) {
                    article.description = this.stripHTML(article.description).substring(0, 300);
                }

                if (article.title && article.url) {
                    articles.push(article);
                }
            } catch (error) {
                // Ignora artigos com erro
                continue;
            }
        }

        return articles.slice(0, 10); // Máximo 10 artigos por página
    }

    /**
     * Extrai conteúdo com seletor
     */
    extractWithSelector(html, selector) {
        const regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'i');
        const match = html.match(regex);
        return match ? this.stripHTML(match[1]) : null;
    }

    /**
     * Extrai link
     */
    extractLink(html, selector, baseUrl) {
        const regex = new RegExp(`<${selector}[^>]*href=["']([^"']+)["']`, 'i');
        const match = html.match(regex);

        if (match) {
            const href = match[1];
            // Converte link relativo para absoluto
            if (href.startsWith('/')) {
                return new URL(href, baseUrl).href;
            }
            return href;
        }

        return null;
    }

    /**
     * Extrai imagem
     */
    extractImage(html, selector, baseUrl) {
        const regex = new RegExp(`<${selector}[^>]*src=["']([^"']+)["']`, 'i');
        const match = html.match(regex);

        if (match) {
            const src = match[1];
            if (src.startsWith('/')) {
                return new URL(src, baseUrl).href;
            }
            return src;
        }

        return null;
    }

    /**
     * Remove HTML tags
     */
    stripHTML(html) {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Scrape com lista de sites permitidos
     */
    async scrapeCategory(category, limit = 10) {
        const sites = this.allowedSites[category] || [];

        if (sites.length === 0) {
            console.log(`⚠️  No sites configured for scraping in category: ${category}`);
            return [];
        }

        const allArticles = [];

        for (const site of sites) {
            if (!site.allowed) {
                console.log(`⏭️  Skipping ${site.name} (not allowed)`);
                continue;
            }

            try {
                const articles = await this.scrapePage(site.url, site.selectors);
                allArticles.push(...articles);

                console.log(`✅ Scraped ${articles.length} articles from ${site.name}`);

                // Aguarda entre sites
                await new Promise(resolve => setTimeout(resolve, 3000));

            } catch (error) {
                console.error(`❌ Error scraping ${site.name}:`, error.message);
            }
        }

        return allArticles.slice(0, limit);
    }

    /**
     * Adiciona site permitido (use com responsabilidade!)
     */
    addAllowedSite(category, siteConfig) {
        if (!this.allowedSites[category]) {
            this.allowedSites[category] = [];
        }

        console.log(`⚠️  WARNING: Only add sites that explicitly allow scraping!`);
        console.log(`Check: ${siteConfig.url}/robots.txt`);

        this.allowedSites[category].push(siteConfig);
    }

    /**
     * Lista sites permitidos
     */
    listAllowedSites() {
        console.log('🕷️  Allowed Sites for Scraping:\n');

        for (const [category, sites] of Object.entries(this.allowedSites)) {
            console.log(`\n${category}:`);
            sites.forEach(site => {
                console.log(`  - ${site.name} (${site.allowed ? '✅ Allowed' : '❌ Not allowed'})`);
            });
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WebScraper };
}
