/**
 * NEWS AGGREGATOR
 *
 * Coleta notícias de múltiplas fontes usando APIs públicas
 * Fontes principais: NewsAPI, NewsData.io, Currents API
 */

class NewsAggregator {
    constructor(config = {}) {
        this.newsApiKey = config.newsApiKey || process.env.NEWS_API_KEY;
        this.newsDataApiKey = config.newsDataApiKey || process.env.NEWSDATA_API_KEY;
        this.currentsApiKey = config.currentsApiKey || process.env.CURRENTS_API_KEY;

        this.sources = {
            newsapi: 'https://newsapi.org/v2',
            newsdata: 'https://newsdata.io/api/1',
            currents: 'https://api.currentsapi.services/v1'
        };

        this.countryMappings = {
            'pt-BR': {
                country: 'br',
                language: 'pt',
                sources: ['globo', 'folha', 'estadao', 'uol', 'g1']
            },
            'en-US': {
                country: 'us',
                language: 'en',
                sources: ['cnn', 'bbc-news', 'reuters', 'associated-press']
            },
            'es': {
                country: 'mx',
                language: 'es',
                sources: ['el-universal', 'excelsior', 'milenio']
            }
        };

        this.categoryMappings = {
            'brasil': 'general',
            'mundo': 'world',
            'economia': 'business',
            'tecnologia': 'technology',
            'esportes': 'sports',
            'entretenimento': 'entertainment',
            'saude': 'health',
            'ciencia': 'science'
        };
    }

    /**
     * Agrega notícias de múltiplas fontes sobre um tópico
     */
    async aggregateNews(options = {}) {
        const {
            category = 'general',
            language = 'pt-BR',
            limit = 10,
            groupSimilar = true
        } = options;

        const allNews = [];

        // Coleta de múltiplas APIs em paralelo
        const promises = [];

        if (this.newsApiKey) {
            promises.push(this.fetchFromNewsAPI(category, language, limit));
        }

        if (this.newsDataApiKey) {
            promises.push(this.fetchFromNewsData(category, language, limit));
        }

        if (this.currentsApiKey) {
            promises.push(this.fetchFromCurrents(category, language, limit));
        }

        // Aguarda todas as respostas
        const results = await Promise.allSettled(promises);

        // Consolida resultados
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                allNews.push(...result.value);
            }
        });

        // Normaliza e deduplica
        const normalized = this.normalizeArticles(allNews);

        // Agrupa artigos similares
        if (groupSimilar) {
            return this.groupSimilarArticles(normalized, limit);
        }

        return normalized.slice(0, limit);
    }

    /**
     * NewsAPI - Fonte principal
     */
    async fetchFromNewsAPI(category, language, limit) {
        if (!this.newsApiKey) return [];

        const config = this.countryMappings[language];
        const mappedCategory = this.categoryMappings[category] || category;

        const params = new URLSearchParams({
            country: config.country,
            category: mappedCategory,
            pageSize: limit,
            apiKey: this.newsApiKey
        });

        try {
            const response = await fetch(`${this.sources.newsapi}/top-headlines?${params}`);

            if (!response.ok) {
                throw new Error(`NewsAPI error: ${response.status}`);
            }

            const data = await response.json();

            return data.articles || [];
        } catch (error) {
            console.error('NewsAPI fetch error:', error);
            return [];
        }
    }

    /**
     * NewsData.io - Fonte secundária
     */
    async fetchFromNewsData(category, language, limit) {
        if (!this.newsDataApiKey) return [];

        const config = this.countryMappings[language];
        const mappedCategory = this.categoryMappings[category] || category;

        const params = new URLSearchParams({
            country: config.country,
            language: config.language,
            category: mappedCategory,
            apikey: this.newsDataApiKey
        });

        try {
            const response = await fetch(`${this.sources.newsdata}/news?${params}`);

            if (!response.ok) {
                throw new Error(`NewsData error: ${response.status}`);
            }

            const data = await response.json();

            return data.results || [];
        } catch (error) {
            console.error('NewsData fetch error:', error);
            return [];
        }
    }

    /**
     * Currents API - Fonte terciária
     */
    async fetchFromCurrents(category, language, limit) {
        if (!this.currentsApiKey) return [];

        const config = this.countryMappings[language];

        const params = new URLSearchParams({
            language: config.language,
            apiKey: this.currentsApiKey
        });

        try {
            const response = await fetch(`${this.sources.currents}/latest-news?${params}`);

            if (!response.ok) {
                throw new Error(`Currents error: ${response.status}`);
            }

            const data = await response.json();

            return data.news || [];
        } catch (error) {
            console.error('Currents fetch error:', error);
            return [];
        }
    }

    /**
     * Normaliza artigos de diferentes APIs para um formato padrão
     */
    normalizeArticles(articles) {
        return articles.map(article => ({
            title: article.title,
            description: article.description || article.content?.substring(0, 200),
            content: article.content,
            url: article.url || article.link,
            urlToImage: article.urlToImage || article.image_url || article.image,
            publishedAt: article.publishedAt || article.pubDate || article.published,
            source: article.source?.name || article.source_id || 'Unknown',
            author: article.author,
            category: article.category
        })).filter(article =>
            article.title &&
            article.url &&
            article.title !== '[Removed]'
        );
    }

    /**
     * Agrupa artigos similares sobre o mesmo tema
     */
    groupSimilarArticles(articles, targetCount) {
        const groups = [];

        // Algoritmo simples de similaridade baseado em palavras-chave
        articles.forEach(article => {
            const titleWords = this.extractKeywords(article.title);

            // Procura grupo similar existente
            let foundGroup = false;

            for (const group of groups) {
                const groupWords = this.extractKeywords(group[0].title);
                const similarity = this.calculateSimilarity(titleWords, groupWords);

                if (similarity > 0.4) { // 40% de similaridade
                    group.push(article);
                    foundGroup = true;
                    break;
                }
            }

            // Cria novo grupo se não encontrou similar
            if (!foundGroup) {
                groups.push([article]);
            }
        });

        // Ordena grupos por tamanho (mais artigos = mais importante)
        groups.sort((a, b) => b.length - a.length);

        // Retorna os grupos principais
        return groups.slice(0, targetCount);
    }

    /**
     * Extrai palavras-chave do texto
     */
    extractKeywords(text) {
        const stopWords = new Set([
            'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'em', 'no', 'na',
            'para', 'por', 'com', 'sem', 'sob', 'sobre', 'the', 'a', 'an', 'and',
            'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
        ]);

        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));
    }

    /**
     * Calcula similaridade entre dois conjuntos de palavras
     */
    calculateSimilarity(words1, words2) {
        const set1 = new Set(words1);
        const set2 = new Set(words2);

        const intersection = [...set1].filter(x => set2.has(x)).length;
        const union = new Set([...set1, ...set2]).size;

        return union === 0 ? 0 : intersection / union;
    }

    /**
     * Busca notícias por palavra-chave específica
     */
    async searchNews(query, language = 'pt-BR', limit = 20) {
        const allNews = [];

        // NewsAPI Search
        if (this.newsApiKey) {
            const params = new URLSearchParams({
                q: query,
                language: this.countryMappings[language].language,
                pageSize: limit,
                sortBy: 'publishedAt',
                apiKey: this.newsApiKey
            });

            try {
                const response = await fetch(`${this.sources.newsapi}/everything?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    allNews.push(...(data.articles || []));
                }
            } catch (error) {
                console.error('Search error:', error);
            }
        }

        return this.normalizeArticles(allNews);
    }

    /**
     * Monitora tópicos em tempo real
     */
    async monitorTopics(topics, language = 'pt-BR', callback) {
        console.log(`Monitoring topics: ${topics.join(', ')}`);

        const interval = setInterval(async () => {
            for (const topic of topics) {
                try {
                    const news = await this.searchNews(topic, language, 5);

                    if (news.length > 0) {
                        callback(topic, news);
                    }
                } catch (error) {
                    console.error(`Error monitoring ${topic}:`, error);
                }
            }
        }, 5 * 60 * 1000); // A cada 5 minutos

        return interval;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NewsAggregator };
}
