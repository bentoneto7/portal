/**
 * HYBRID NEWS AGGREGATOR
 *
 * Sistema inteligente em camadas que:
 * 1. Detecta trending topics (Twitter, Google Trends)
 * 2. Coleta de múltiplas fontes (APIs + RSS + Scraping)
 * 3. Prioriza tópicos de alto RPM ($$$ mais receita)
 * 4. Detecta notícias virais
 *
 * ESTRATÉGIA: Audiência + Grana = Sucesso
 */

const { NewsAggregator } = require('./news-aggregator');
const { RSSAggregator } = require('./rss-aggregator');
const { WebScraper } = require('./web-scraper');

class HybridAggregator {
    constructor(config = {}) {
        // Inicializa todos os agregadores
        this.newsAPI = new NewsAggregator(config);
        this.rssAggregator = new RSSAggregator();
        this.webScraper = new WebScraper();

        // Tópicos de ALTO RPM (geram mais receita com ads)
        this.highRPMTopics = {
            // Finance/Business - RPM mais alto (até $25-50)
            high: [
                'bitcoin', 'cripto', 'bolsa', 'dólar', 'investimentos',
                'nubank', 'b3', 'criptomoedas', 'forex', 'trading',
                'economia brasileira', 'juros', 'inflação'
            ],
            // Technology - RPM médio-alto ($10-30)
            medium: [
                'iphone', 'samsung', 'windows', 'chatgpt', 'inteligência artificial',
                'tesla', 'elon musk', 'apple', 'google', 'microsoft',
                'metaverso', 'tecnologia'
            ],
            // General news - RPM médio ($5-15)
            normal: [
                'brasil', 'política', 'eleições', 'copa do mundo',
                'celebridades', 'entretenimento'
            ]
        };

        // Trending detection cache
        this.trendingCache = {
            topics: [],
            lastUpdate: null,
            ttl: 15 * 60 * 1000 // 15 minutos
        };
    }

    /**
     * ESTRATÉGIA PRINCIPAL: Busca em camadas inteligente
     */
    async fetchNewsStrategic(options = {}) {
        const {
            category = 'brasil',
            language = 'pt-BR',
            limit = 20,
            focusOnRevenue = true // Prioriza alto RPM
        } = options;

        console.log('\n🎯 ESTRATÉGIA DE AGREGAÇÃO EM CAMADAS\n');

        const layers = [];

        // CAMADA 1: Detecta TRENDING (viral, alto engajamento)
        console.log('📈 Layer 1: Detectando trending topics...');
        const trending = await this.detectTrending(category, language);
        if (trending.length > 0) {
            layers.push({
                source: 'trending',
                priority: 10, // Máxima prioridade
                articles: trending,
                rpm: 'high'
            });
            console.log(`   ✅ ${trending.length} trending topics detectados`);
        }

        // CAMADA 2: RSS Feeds (rápido, gratuito, legal)
        console.log('📡 Layer 2: Buscando RSS feeds...');
        try {
            const rssArticles = await this.rssAggregator.fetchFromRSS(category, language, limit);
            if (rssArticles.length > 0) {
                layers.push({
                    source: 'rss',
                    priority: 8,
                    articles: rssArticles,
                    rpm: this.estimateRPM(rssArticles)
                });
                console.log(`   ✅ ${rssArticles.length} artigos de RSS`);
            }
        } catch (error) {
            console.log(`   ⚠️  RSS error: ${error.message}`);
        }

        // CAMADA 3: APIs (NewsAPI, etc)
        console.log('🔌 Layer 3: Buscando APIs...');
        try {
            const apiArticles = await this.newsAPI.aggregateNews({
                category,
                language,
                limit,
                groupSimilar: true
            });

            if (apiArticles && apiArticles.length > 0) {
                const flatArticles = apiArticles.flat();
                layers.push({
                    source: 'api',
                    priority: 7,
                    articles: flatArticles,
                    rpm: this.estimateRPM(flatArticles)
                });
                console.log(`   ✅ ${flatArticles.length} artigos de APIs`);
            }
        } catch (error) {
            console.log(`   ⚠️  API error: ${error.message}`);
        }

        // CAMADA 4: Web Scraping (backup, apenas se necessário)
        if (layers.length === 0 || layers.reduce((sum, l) => sum + l.articles.length, 0) < limit) {
            console.log('🕷️  Layer 4: Web scraping (backup)...');
            try {
                const scrapedArticles = await this.webScraper.scrapeCategory(category, 10);
                if (scrapedArticles.length > 0) {
                    layers.push({
                        source: 'scraping',
                        priority: 5,
                        articles: scrapedArticles,
                        rpm: 'medium'
                    });
                    console.log(`   ✅ ${scrapedArticles.length} artigos scraped`);
                }
            } catch (error) {
                console.log(`   ⚠️  Scraping error: ${error.message}`);
            }
        }

        // Consolida e prioriza
        return this.consolidateLayers(layers, limit, focusOnRevenue);
    }

    /**
     * Detecta trending topics (notícias virais)
     */
    async detectTrending(category, language) {
        // Usa cache se ainda válido
        if (this.trendingCache.lastUpdate &&
            Date.now() - this.trendingCache.lastUpdate < this.trendingCache.ttl) {
            return this.trendingCache.topics;
        }

        const trendingArticles = [];

        // Método 1: Busca por keywords de alto engajamento
        const viralKeywords = this.getViralKeywords(category);

        for (const keyword of viralKeywords) {
            try {
                // Busca notícias sobre o keyword
                const articles = await this.newsAPI.searchNews(keyword, language, 5);

                // Marca como trending
                articles.forEach(article => {
                    article.isTrending = true;
                    article.trendingScore = this.calculateTrendingScore(article, keyword);
                    article.rpm = 'high';
                });

                trendingArticles.push(...articles);

            } catch (error) {
                console.log(`   ⚠️  Trending search error for "${keyword}"`);
            }
        }

        // Ordena por trending score
        trendingArticles.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));

        // Atualiza cache
        this.trendingCache.topics = trendingArticles.slice(0, 10);
        this.trendingCache.lastUpdate = Date.now();

        return this.trendingCache.topics;
    }

    /**
     * Keywords virais baseados em categoria
     */
    getViralKeywords(category) {
        const viralMap = {
            'economia': [
                'bitcoin sobe', 'dólar dispara', 'bolsa cai',
                'nubank anuncia', 'cripto crash', 'mercado reage'
            ],
            'tecnologia': [
                'iphone lançamento', 'chatgpt novidade', 'vazamento',
                'apple anuncia', 'tesla', 'inteligência artificial'
            ],
            'brasil': [
                'breaking', 'urgente', 'última hora',
                'governo anuncia', 'decisão judicial'
            ],
            'mundo': [
                'guerra', 'tensão', 'ataque',
                'acordo histórico', 'eleições'
            ]
        };

        return viralMap[category] || ['breaking', 'urgente', 'última hora'];
    }

    /**
     * Calcula trending score
     */
    calculateTrendingScore(article, keyword) {
        let score = 0;

        // Título contém keyword urgente
        const urgentWords = ['urgente', 'breaking', 'agora', 'última hora', 'ao vivo'];
        const titleLower = article.title.toLowerCase();

        urgentWords.forEach(word => {
            if (titleLower.includes(word)) score += 5;
        });

        // Keyword no título
        if (titleLower.includes(keyword.toLowerCase())) {
            score += 10;
        }

        // Artigo recente (última hora)
        const publishedDate = new Date(article.publishedAt);
        const hoursAgo = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);

        if (hoursAgo < 1) score += 15; // Última hora
        else if (hoursAgo < 3) score += 10; // Últimas 3 horas
        else if (hoursAgo < 6) score += 5; // Últimas 6 horas

        // Fonte confiável
        const topSources = ['g1', 'folha', 'estadao', 'bbc', 'cnn', 'reuters'];
        if (topSources.some(s => article.source?.toLowerCase().includes(s))) {
            score += 5;
        }

        return score;
    }

    /**
     * Estima RPM (Revenue Per Mille) baseado no conteúdo
     */
    estimateRPM(articles) {
        if (!articles || articles.length === 0) return 'low';

        let totalScore = 0;

        articles.forEach(article => {
            const text = `${article.title} ${article.description || ''}`.toLowerCase();

            // High RPM keywords
            this.highRPMTopics.high.forEach(keyword => {
                if (text.includes(keyword)) totalScore += 3;
            });

            // Medium RPM keywords
            this.highRPMTopics.medium.forEach(keyword => {
                if (text.includes(keyword)) totalScore += 2;
            });

            // Normal RPM keywords
            this.highRPMTopics.normal.forEach(keyword => {
                if (text.includes(keyword)) totalScore += 1;
            });
        });

        const avgScore = totalScore / articles.length;

        if (avgScore >= 2.5) return 'high';
        if (avgScore >= 1.5) return 'medium';
        return 'low';
    }

    /**
     * Consolida camadas priorizando receita e trending
     */
    consolidateLayers(layers, limit, focusOnRevenue) {
        console.log('\n💰 CONSOLIDANDO CAMADAS (Foco em receita):\n');

        // Ordena layers por prioridade
        layers.sort((a, b) => b.priority - a.priority);

        const consolidated = [];
        const seenTitles = new Set();

        // Se foco em receita, prioriza high RPM
        if (focusOnRevenue) {
            layers.sort((a, b) => {
                const rpmOrder = { high: 3, medium: 2, low: 1 };
                return (rpmOrder[b.rpm] || 0) - (rpmOrder[a.rpm] || 0);
            });
        }

        layers.forEach(layer => {
            console.log(`📊 ${layer.source.toUpperCase()}: ${layer.articles.length} artigos (RPM: ${layer.rpm})`);

            layer.articles.forEach(article => {
                // Deduplica por título similar
                const titleKey = article.title.toLowerCase().substring(0, 50);

                if (!seenTitles.has(titleKey) && consolidated.length < limit) {
                    article.aggregationSource = layer.source;
                    article.estimatedRPM = layer.rpm;
                    consolidated.push(article);
                    seenTitles.add(titleKey);
                }
            });
        });

        console.log(`\n✅ Total consolidado: ${consolidated.length} artigos únicos`);
        console.log(`💵 Distribuição RPM:`);
        console.log(`   High: ${consolidated.filter(a => a.estimatedRPM === 'high').length}`);
        console.log(`   Medium: ${consolidated.filter(a => a.estimatedRPM === 'medium').length}`);
        console.log(`   Low: ${consolidated.filter(a => a.estimatedRPM === 'low').length}\n`);

        return consolidated;
    }

    /**
     * Busca focada em alto RPM (Finanças, Crypto, Tech)
     */
    async fetchHighRPMNews(language = 'pt-BR', limit = 20) {
        console.log('\n💎 MODO HIGH RPM: Buscando notícias de alto valor\n');

        const allArticles = [];

        // Busca todos os tópicos de alto RPM
        for (const keyword of this.highRPMTopics.high) {
            try {
                const articles = await this.newsAPI.searchNews(keyword, language, 5);
                articles.forEach(a => {
                    a.estimatedRPM = 'high';
                    a.rpmKeyword = keyword;
                });
                allArticles.push(...articles);
            } catch (error) {
                // Continua com próximo keyword
            }
        }

        // Remove duplicatas e limita
        const unique = this.deduplicateArticles(allArticles);
        return unique.slice(0, limit);
    }

    /**
     * Remove duplicatas
     */
    deduplicateArticles(articles) {
        const seen = new Set();
        return articles.filter(article => {
            const key = article.title.toLowerCase().substring(0, 50);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    /**
     * Relatório de performance
     */
    async generatePerformanceReport() {
        console.log('\n📊 RELATÓRIO DE PERFORMANCE\n');
        console.log('='.repeat(50));

        console.log('\n✅ Fontes Disponíveis:');
        console.log(`   APIs: ${this.newsAPI.newsApiKey ? 'Sim' : 'Não'}`);
        console.log(`   RSS: Sim (sempre disponível)`);
        console.log(`   Scraping: Sim (backup)`);

        console.log('\n💰 Tópicos de Alto RPM:');
        console.log(`   High RPM: ${this.highRPMTopics.high.length} keywords`);
        console.log(`   Medium RPM: ${this.highRPMTopics.medium.length} keywords`);

        console.log('\n📈 Cache de Trending:');
        if (this.trendingCache.lastUpdate) {
            const age = Math.floor((Date.now() - this.trendingCache.lastUpdate) / 1000);
            console.log(`   Último update: ${age}s atrás`);
            console.log(`   Topics em cache: ${this.trendingCache.topics.length}`);
        } else {
            console.log(`   Cache vazio`);
        }

        console.log('\n' + '='.repeat(50) + '\n');
    }
}

// Export
module.exports = { HybridAggregator };
