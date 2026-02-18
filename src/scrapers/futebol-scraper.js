/**
 * SCRAPER DE NOTÍCIAS DE FUTEBOL
 *
 * Fontes:
 * 1. NewsAPI - busca por termos de futebol
 * 2. RSS Feeds - Globo Esporte, Lance, ESPN Brasil, UOL Esporte
 * 3. Currents API - notícias esportivas
 *
 * Filtros: Somente futebol. Descarta outros esportes.
 */

const RSSParser = require('rss-parser');

const RSS_FEEDS = [
    { url: 'https://ge.globo.com/rss/futebol/', nome: 'Globo Esporte' },
    { url: 'https://www.lance.com.br/feed/', nome: 'Lance!' },
    { url: 'https://www.espn.com.br/espn/rss/futebol/news', nome: 'ESPN Brasil' },
    { url: 'https://www.uol.com.br/esporte/futebol/ultimas/index.xml', nome: 'UOL Esporte' },
    { url: 'https://www.gazetaesportiva.com/feed/', nome: 'Gazeta Esportiva' },
    { url: 'https://www.goal.com/br/feeds/news', nome: 'Goal Brasil' },
    { url: 'https://www.terra.com.br/esportes/futebol/rss.xml', nome: 'Terra Esportes' },
];

// Termos para filtrar apenas futebol
const FUTEBOL_KEYWORDS = [
    'futebol', 'gol', 'brasileirão', 'série a', 'série b', 'libertadores',
    'champions', 'copa do mundo', 'seleção', 'campeonato', 'rodada',
    'escalação', 'transferência', 'contratação', 'técnico', 'treinador',
    'artilheiro', 'zagueiro', 'atacante', 'meio-campo', 'goleiro',
    'pênalti', 'escanteio', 'impedimento', 'var', 'arbitragem',
    'flamengo', 'palmeiras', 'corinthians', 'são paulo', 'santos',
    'grêmio', 'internacional', 'cruzeiro', 'atlético', 'vasco',
    'botafogo', 'fluminense', 'bahia', 'fortaleza', 'real madrid',
    'barcelona', 'manchester', 'liverpool', 'psg', 'bayern',
    'neymar', 'vinicius', 'endrick', 'copa 2026', 'eliminatórias',
    'mercado da bola', 'empréstimo', 'clausula', 'premier league',
    'la liga', 'serie a', 'bundesliga', 'ligue 1',
    'soccer', 'football', 'goal', 'match', 'league', 'transfer',
];

// Termos para EXCLUIR (outros esportes)
const EXCLUIR_KEYWORDS = [
    'fórmula 1', 'f1', 'nba', 'basquete', 'tênis', 'vôlei',
    'mma', 'ufc', 'boxe', 'natação', 'atletismo', 'rugby',
    'nfl', 'beisebol', 'cricket', 'surf', 'skate', 'ciclismo',
    'handebol', 'futsal', 'beach tennis', 'padel'
];

class FutebolScraper {
    constructor() {
        this.rssParser = new RSSParser({
            timeout: 15000,
            headers: {
                'User-Agent': 'BolaNaRede/1.0 (News Aggregator)',
                'Accept': 'application/rss+xml, application/xml, text/xml'
            }
        });
    }

    /**
     * Coleta notícias de todas as fontes
     */
    async coletarNoticias() {
        console.log('⚽ Iniciando coleta de notícias de futebol...\n');

        const resultados = await Promise.allSettled([
            this.coletarRSS(),
            this.coletarNewsAPI(),
            this.coletarCurrentsAPI()
        ]);

        let todasNoticias = [];

        for (const resultado of resultados) {
            if (resultado.status === 'fulfilled' && resultado.value) {
                todasNoticias = todasNoticias.concat(resultado.value);
            }
        }

        // Filtra apenas futebol
        const futebol = this.filtrarFutebol(todasNoticias);

        // Remove duplicatas
        const unicas = this.removerDuplicatas(futebol);

        // Ordena por relevância e data
        unicas.sort((a, b) => {
            const dataA = new Date(a.publishedAt || 0);
            const dataB = new Date(b.publishedAt || 0);
            return dataB - dataA;
        });

        console.log(`\n📊 Resultado: ${todasNoticias.length} coletadas → ${futebol.length} sobre futebol → ${unicas.length} únicas\n`);
        return unicas;
    }

    /**
     * Coleta via RSS Feeds
     */
    async coletarRSS() {
        const noticias = [];

        for (const feed of RSS_FEEDS) {
            try {
                console.log(`📡 RSS: ${feed.nome}...`);
                const resultado = await this.rssParser.parseURL(feed.url);

                const items = (resultado.items || []).slice(0, 15).map(item => ({
                    title: item.title || '',
                    description: item.contentSnippet || item.content || '',
                    content: item.content || item.contentSnippet || '',
                    url: item.link || '',
                    publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
                    source: feed.nome
                }));

                noticias.push(...items);
                console.log(`   ✅ ${items.length} itens`);
                await this.delay(1000);
            } catch (err) {
                console.log(`   ⚠️ Falha: ${err.message}`);
            }
        }

        return noticias;
    }

    /**
     * Coleta via NewsAPI
     */
    async coletarNewsAPI() {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) {
            console.log('📡 NewsAPI: Sem chave configurada, pulando...');
            return [];
        }

        const queries = [
            'futebol brasileiro',
            'Brasileirão 2026',
            'Copa do Mundo 2026',
            'mercado da bola',
            'Champions League',
            'Libertadores'
        ];

        const noticias = [];

        for (const q of queries) {
            try {
                console.log(`📡 NewsAPI: "${q}"...`);
                const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=pt&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

                const response = await fetch(url);
                const data = await response.json();

                if (data.articles) {
                    const items = data.articles.map(a => ({
                        title: a.title || '',
                        description: a.description || '',
                        content: a.content || '',
                        url: a.url || '',
                        publishedAt: a.publishedAt || new Date().toISOString(),
                        source: a.source?.name || 'NewsAPI'
                    }));
                    noticias.push(...items);
                    console.log(`   ✅ ${items.length} itens`);
                }

                await this.delay(1500);
            } catch (err) {
                console.log(`   ⚠️ NewsAPI "${q}": ${err.message}`);
            }
        }

        return noticias;
    }

    /**
     * Coleta via Currents API
     */
    async coletarCurrentsAPI() {
        const apiKey = process.env.CURRENTS_API_KEY;
        if (!apiKey) {
            console.log('📡 Currents API: Sem chave configurada, pulando...');
            return [];
        }

        try {
            console.log('📡 Currents API: Buscando...');
            const url = `https://api.currentsapi.services/v1/search?keywords=futebol+soccer+brasil&language=pt&category=sports&apiKey=${apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.news) {
                const items = data.news.map(n => ({
                    title: n.title || '',
                    description: n.description || '',
                    content: n.description || '',
                    url: n.url || '',
                    publishedAt: n.published || new Date().toISOString(),
                    source: 'Currents API'
                }));
                console.log(`   ✅ ${items.length} itens`);
                return items;
            }
        } catch (err) {
            console.log(`   ⚠️ Currents API: ${err.message}`);
        }

        return [];
    }

    /**
     * Filtra apenas notícias de futebol
     */
    filtrarFutebol(noticias) {
        return noticias.filter(n => {
            const texto = `${n.title} ${n.description || ''} ${n.content || ''}`.toLowerCase();

            // Exclui outros esportes
            for (const excluir of EXCLUIR_KEYWORDS) {
                if (texto.includes(excluir)) return false;
            }

            // Verifica se é sobre futebol
            for (const keyword of FUTEBOL_KEYWORDS) {
                if (texto.includes(keyword)) return true;
            }

            return false;
        });
    }

    /**
     * Remove notícias duplicadas por similaridade de título
     */
    removerDuplicatas(noticias) {
        const unicas = [];
        const titulosVistos = [];

        for (const noticia of noticias) {
            const tituloNorm = noticia.title.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúçñ0-9\s]/g, '');

            const duplicata = titulosVistos.some(t => {
                return this.similaridade(t, tituloNorm) > 0.6;
            });

            if (!duplicata && noticia.title.length > 10) {
                unicas.push(noticia);
                titulosVistos.push(tituloNorm);
            }
        }

        return unicas;
    }

    /**
     * Calcula similaridade entre duas strings (Jaccard)
     */
    similaridade(a, b) {
        const setA = new Set(a.split(/\s+/).filter(p => p.length > 2));
        const setB = new Set(b.split(/\s+/).filter(p => p.length > 2));

        if (setA.size === 0 || setB.size === 0) return 0;

        let intersecao = 0;
        for (const p of setA) {
            if (setB.has(p)) intersecao++;
        }

        const uniao = setA.size + setB.size - intersecao;
        return intersecao / uniao;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = FutebolScraper;
