/**
 * RSS FEED AGGREGATOR
 *
 * Coleta notícias de feeds RSS de portais brasileiros e internacionais
 * 100% LEGAL - RSS feeds são feitos para serem consumidos
 */

class RSSAggregator {
    constructor() {
        // Feeds RSS dos principais portais brasileiros
        this.brazilianFeeds = {
            brasil: [
                'https://g1.globo.com/rss/g1/',
                'https://www1.folha.uol.com.br/rss/ultimas.xml',
                'https://www.estadao.com.br/rss/ultimas.xml',
                'https://noticias.uol.com.br/ultimas/index.xml',
                'https://www.terra.com.br/rss/Controller?channelid=2',
                'https://www.r7.com/institucional/rss',
                'https://feeds.bbci.co.uk/portuguese/rss.xml',
                'https://g1.globo.com/rss/g1/brasil/'
            ],
            mundo: [
                'https://g1.globo.com/rss/g1/mundo/',
                'https://www1.folha.uol.com.br/rss/mundo.xml',
                'https://www.estadao.com.br/rss/internacional.xml',
                'https://feeds.bbci.co.uk/portuguese/internacional/rss.xml'
            ],
            economia: [
                'https://g1.globo.com/rss/g1/economia/',
                'https://www1.folha.uol.com.br/rss/mercado.xml',
                'https://www.estadao.com.br/rss/economia.xml',
                'https://www.infomoney.com.br/feed/',
                'https://feeds.bbci.co.uk/portuguese/topics/business/rss.xml'
            ],
            tecnologia: [
                'https://g1.globo.com/rss/g1/tecnologia/',
                'https://www1.folha.uol.com.br/rss/tec.xml',
                'https://www.estadao.com.br/rss/link.xml',
                'https://olhardigital.com.br/feed/',
                'https://tecnoblog.net/feed/'
            ],
            esportes: [
                'https://g1.globo.com/rss/g1/esportes/',
                'https://www1.folha.uol.com.br/rss/esporte.xml',
                'https://www.lance.com.br/rss.xml'
            ],
            entretenimento: [
                'https://g1.globo.com/rss/g1/pop-arte/',
                'https://www1.folha.uol.com.br/rss/ilustrada.xml',
                'https://www.estadao.com.br/rss/cultura.xml'
            ]
        };

        // Feeds internacionais (inglês)
        this.internationalFeeds = {
            world: [
                'http://feeds.bbci.co.uk/news/world/rss.xml',
                'http://rss.cnn.com/rss/edition_world.rss',
                'https://feeds.reuters.com/reuters/topNews',
                'https://feeds.a.dj.com/rss/RSSWorldNews.xml'
            ],
            business: [
                'http://feeds.bbci.co.uk/news/business/rss.xml',
                'http://rss.cnn.com/rss/money_latest.rss',
                'https://feeds.reuters.com/reuters/businessNews',
                'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml'
            ],
            technology: [
                'http://feeds.bbci.co.uk/news/technology/rss.xml',
                'http://rss.cnn.com/rss/edition_technology.rss',
                'https://feeds.reuters.com/reuters/technologyNews',
                'https://www.wired.com/feed/rss'
            ]
        };
    }

    /**
     * Busca notícias de RSS feeds
     */
    async fetchFromRSS(category, language = 'pt-BR', limit = 20) {
        const feeds = this.getFeedsForCategory(category, language);

        if (feeds.length === 0) {
            console.log(`No RSS feeds for ${category} in ${language}`);
            return [];
        }

        console.log(`📡 Fetching from ${feeds.length} RSS feeds...`);

        // Busca de todos os feeds em paralelo
        const promises = feeds.map(feedUrl => this.parseFeed(feedUrl));
        const results = await Promise.allSettled(promises);

        // Consolida resultados
        const allArticles = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                allArticles.push(...result.value);
            } else {
                console.log(`⚠️  Feed failed: ${feeds[index]}`);
            }
        });

        // Ordena por data (mais recentes primeiro)
        allArticles.sort((a, b) => {
            const dateA = new Date(a.publishedAt || 0);
            const dateB = new Date(b.publishedAt || 0);
            return dateB - dateA;
        });

        return allArticles.slice(0, limit);
    }

    /**
     * Retorna feeds para categoria e idioma
     */
    getFeedsForCategory(category, language) {
        if (language === 'pt-BR') {
            return this.brazilianFeeds[category] || [];
        } else {
            // Mapeia categoria PT para EN
            const mapping = {
                'brasil': 'world',
                'mundo': 'world',
                'economia': 'business',
                'tecnologia': 'technology'
            };
            const engCategory = mapping[category] || category;
            return this.internationalFeeds[engCategory] || [];
        }
    }

    /**
     * Faz parse de um feed RSS
     */
    async parseFeed(feedUrl) {
        try {
            const response = await fetch(feedUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NewsPortalBot/1.0)'
                },
                timeout: 10000
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const xmlText = await response.text();
            return this.parseXML(xmlText, feedUrl);

        } catch (error) {
            console.error(`Error fetching RSS feed ${feedUrl}:`, error.message);
            return [];
        }
    }

    /**
     * Parse XML manualmente (sem bibliotecas externas)
     */
    parseXML(xmlText, feedUrl) {
        const articles = [];

        // Detecta tipo de feed (RSS 2.0 ou Atom)
        const isAtom = xmlText.includes('<feed');

        if (isAtom) {
            return this.parseAtomFeed(xmlText, feedUrl);
        }

        // Parse RSS 2.0
        const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
        let match;

        while ((match = itemRegex.exec(xmlText)) !== null) {
            const itemXML = match[1];

            const article = {
                title: this.extractTag(itemXML, 'title'),
                description: this.extractTag(itemXML, 'description'),
                url: this.extractTag(itemXML, 'link'),
                publishedAt: this.extractTag(itemXML, 'pubDate'),
                source: this.extractSourceFromUrl(feedUrl),
                category: this.extractTag(itemXML, 'category'),
                content: this.extractCDATA(itemXML, 'description') || this.extractTag(itemXML, 'description')
            };

            // Tenta pegar imagem
            article.urlToImage = this.extractImage(itemXML);

            // Limpa HTML tags da descrição
            if (article.description) {
                article.description = this.stripHTML(article.description).substring(0, 300);
            }

            // Valida artigo
            if (article.title && article.url) {
                articles.push(article);
            }
        }

        return articles;
    }

    /**
     * Parse Atom feed
     */
    parseAtomFeed(xmlText, feedUrl) {
        const articles = [];
        const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
        let match;

        while ((match = entryRegex.exec(xmlText)) !== null) {
            const entryXML = match[1];

            const article = {
                title: this.extractTag(entryXML, 'title'),
                description: this.extractTag(entryXML, 'summary') || this.extractTag(entryXML, 'content'),
                url: this.extractAtomLink(entryXML),
                publishedAt: this.extractTag(entryXML, 'published') || this.extractTag(entryXML, 'updated'),
                source: this.extractSourceFromUrl(feedUrl)
            };

            if (article.description) {
                article.description = this.stripHTML(article.description).substring(0, 300);
            }

            if (article.title && article.url) {
                articles.push(article);
            }
        }

        return articles;
    }

    /**
     * Extrai conteúdo de uma tag XML
     */
    extractTag(xml, tagName) {
        const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
        const match = xml.match(regex);

        if (match) {
            return this.decodeHTML(match[1].trim());
        }

        return null;
    }

    /**
     * Extrai CDATA
     */
    extractCDATA(xml, tagName) {
        const regex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tagName}>`, 'i');
        const match = xml.match(regex);
        return match ? match[1].trim() : null;
    }

    /**
     * Extrai link do Atom feed
     */
    extractAtomLink(xml) {
        const regex = /<link[^>]*href=["']([^"']+)["'][^>]*>/i;
        const match = xml.match(regex);
        return match ? match[1] : null;
    }

    /**
     * Extrai imagem do item RSS
     */
    extractImage(xml) {
        // Tenta várias tags de imagem
        const patterns = [
            /<media:content[^>]*url=["']([^"']+)["']/i,
            /<media:thumbnail[^>]*url=["']([^"']+)["']/i,
            /<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i,
            /<img[^>]*src=["']([^"']+)["']/i
        ];

        for (const pattern of patterns) {
            const match = xml.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    }

    /**
     * Extrai nome da fonte pela URL
     */
    extractSourceFromUrl(url) {
        const domain = url.match(/https?:\/\/([^\/]+)/);
        if (domain) {
            const name = domain[1].replace('www.', '').replace('www1.', '').split('.')[0];
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
        return 'Unknown';
    }

    /**
     * Remove HTML tags
     */
    stripHTML(html) {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Decodifica entidades HTML
     */
    decodeHTML(text) {
        const entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#039;': "'",
            '&apos;': "'",
            '&nbsp;': ' '
        };

        return text.replace(/&[^;]+;/g, match => entities[match] || match);
    }

    /**
     * Lista todos os feeds disponíveis
     */
    listAllFeeds() {
        const allFeeds = {
            'pt-BR': this.brazilianFeeds,
            'en-US': this.internationalFeeds
        };

        console.log('📰 RSS Feeds Disponíveis:\n');

        for (const [lang, categories] of Object.entries(allFeeds)) {
            console.log(`\n${lang}:`);
            for (const [category, feeds] of Object.entries(categories)) {
                console.log(`  ${category}: ${feeds.length} feeds`);
            }
        }

        return allFeeds;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RSSAggregator };
}
