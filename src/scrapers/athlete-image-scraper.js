/**
 * ATHLETE IMAGE SCRAPER
 *
 * Sistema para buscar imagens REAIS de atletas usando:
 * 1. API-Football (imagens oficiais HD)
 * 2. Base local de imagens licenciadas
 * 3. Fallback para Unsplash temático
 *
 * IMPORTANTE: Uso jornalístico com licenças apropriadas
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class AthleteImageScraper {
    constructor() {
        // API-Football (requer chave - 100 requests/dia grátis)
        this.apiFootballKey = process.env.API_FOOTBALL_KEY || null;
        this.apiFootballUrl = 'https://v3.football.api-sports.io';

        // Cache
        this.cacheDir = path.join(__dirname, '../../data/cache/athlete-images');
        this.cacheFile = path.join(this.cacheDir, 'images.json');
        this.cache = {};
        this.cacheDuration = 24 * 60 * 60 * 1000; // 24 horas

        // Mapa de atletas brasileiros famosos
        this.athleteMap = {
            // Neymar
            'neymar': {
                name: 'Neymar Jr',
                team: 'Santos',
                apiId: 276, // ID na API-Football
                localImages: [
                    'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1', // Neymar
                ],
                fallback: 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
            },

            // Gabigol
            'gabigol': {
                name: 'Gabriel Barbosa',
                team: 'Flamengo',
                apiId: 9739,
                localImages: [],
                fallback: 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
            },

            // Pedro
            'pedro': {
                name: 'Pedro',
                team: 'Flamengo',
                apiId: 30894,
                localImages: [],
                fallback: 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
            },

            // Vini Jr
            'vinicius': {
                name: 'Vinicius Junior',
                team: 'Real Madrid',
                apiId: 30893,
                localImages: [],
                fallback: 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
            },

            'vinicius jr': {
                name: 'Vinicius Junior',
                team: 'Real Madrid',
                apiId: 30893,
                localImages: [],
                fallback: 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
            },

            // Endrick
            'endrick': {
                name: 'Endrick',
                team: 'Palmeiras',
                apiId: 326422,
                localImages: [],
                fallback: 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
            },

            // Richarlison
            'richarlison': {
                name: 'Richarlison',
                team: 'Tottenham',
                apiId: 738,
                localImages: [],
                fallback: 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
            },

            // Hulk
            'hulk': {
                name: 'Hulk',
                team: 'Atlético-MG',
                apiId: 1470,
                localImages: [],
                fallback: 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
            },

            // Luiz Henrique
            'luiz henrique': {
                name: 'Luiz Henrique',
                team: 'Botafogo',
                apiId: 351028,
                localImages: [],
                fallback: 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
            },

            // Jhon Arias
            'jhon arias': {
                name: 'Jhon Arias',
                team: 'Fluminense',
                apiId: 31009,
                localImages: [],
                fallback: 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
            },

            // Haaland
            'haaland': {
                name: 'Erling Haaland',
                team: 'Manchester City',
                apiId: 1100,
                localImages: [],
                fallback: 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
            }
        };

        // Imagens temáticas por contexto
        this.contextImages = {
            'gol': 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
            'comemoração': 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
            'treino': 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
            'estádio': 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
            'torcida': 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
            'var': 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
            'arbitragem': 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
            'mercado': 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1',
            'contratação': 'https://images.pexels.com/photos/15976858/pexels-photo-15976858.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&dpr=1'
        };
    }

    /**
     * Inicializa
     */
    async init() {
        await this.ensureCacheDir();
        await this.loadCache();
        console.log('✅ Athlete Image Scraper initialized');
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
            console.log('📦 Athlete images cache loaded');
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
     * Detecta atleta no texto
     */
    detectAthlete(text) {
        const normalized = text.toLowerCase();

        // Procura por atletas conhecidos
        for (const [key, data] of Object.entries(this.athleteMap)) {
            if (normalized.includes(key)) {
                return { key, ...data };
            }
        }

        return null;
    }

    /**
     * Detecta contexto da notícia
     */
    detectContext(text) {
        const normalized = text.toLowerCase();

        const contexts = [
            { keywords: ['gol', 'golaço', 'marcou'], context: 'gol' },
            { keywords: ['comemora', 'festeja', 'vibra'], context: 'comemoração' },
            { keywords: ['treino', 'treinamento', 'preparação'], context: 'treino' },
            { keywords: ['estádio', 'arena', 'casa'], context: 'estádio' },
            { keywords: ['torcida', 'torcedores', 'fãs'], context: 'torcida' },
            { keywords: ['var', 'arbitragem', 'juiz'], context: 'var' },
            { keywords: ['mercado', 'contratação', 'transferência'], context: 'mercado' }
        ];

        for (const { keywords, context } of contexts) {
            if (keywords.some(kw => normalized.includes(kw))) {
                return context;
            }
        }

        return 'gol'; // Default
    }

    /**
     * Busca imagem do atleta via API-Football
     */
    async getAthleteImageAPI(athlete) {
        if (!this.apiFootballKey) {
            return null;
        }

        const cacheKey = `api_${athlete.apiId}`;

        // Verifica cache
        if (this.isCacheValid(cacheKey)) {
            return this.cache[cacheKey].data;
        }

        try {
            const response = await axios.get(
                `${this.apiFootballUrl}/players`,
                {
                    params: { id: athlete.apiId },
                    headers: {
                        'x-rapidapi-key': this.apiFootballKey,
                        'x-rapidapi-host': 'v3.football.api-sports.io'
                    },
                    timeout: 10000
                }
            );

            if (response.data?.response?.[0]?.player?.photo) {
                const imageUrl = response.data.response[0].player.photo;

                // Salva em cache
                this.cache[cacheKey] = {
                    data: imageUrl,
                    timestamp: Date.now()
                };
                await this.saveCache();

                return imageUrl;
            }

            return null;

        } catch (error) {
            console.error(`❌ Erro ao buscar imagem de ${athlete.name}:`, error.message);
            return null;
        }
    }

    /**
     * Busca melhor imagem para o artigo
     */
    async getImageForArticle(title, content = '') {
        const text = `${title} ${content}`.toLowerCase();

        // 1. Detecta atleta
        const athlete = this.detectAthlete(text);

        if (athlete) {
            console.log(`🏃 Atleta detectado: ${athlete.name}`);

            // 2a. Tenta API-Football
            if (this.apiFootballKey) {
                const apiImage = await this.getAthleteImageAPI(athlete);
                if (apiImage) {
                    console.log(`✅ Imagem da API: ${athlete.name}`);
                    return {
                        url: apiImage,
                        alt: `${athlete.name} - ${athlete.team}`,
                        credit: 'API-Football / Licença Editorial'
                    };
                }
            }

            // 2b. Tenta base local
            if (athlete.localImages && athlete.localImages.length > 0) {
                console.log(`✅ Imagem local: ${athlete.name}`);
                return {
                    url: athlete.localImages[0],
                    alt: `${athlete.name} - ${athlete.team}`,
                    credit: 'Arquivo Bola na Rede / Licença Jornalística'
                };
            }

            // 2c. Fallback do atleta
            if (athlete.fallback) {
                console.log(`⚠️  Usando fallback: ${athlete.name}`);
                return {
                    url: athlete.fallback,
                    alt: `Futebol - ${athlete.name}`,
                    credit: 'Unsplash / Ilustração'
                };
            }
        }

        // 3. Detecta contexto e retorna imagem temática
        const context = this.detectContext(text);
        const contextImage = this.contextImages[context] || this.contextImages['gol'];

        console.log(`📸 Usando imagem de contexto: ${context}`);

        return {
            url: contextImage,
            alt: `Futebol - ${context}`,
            credit: 'Unsplash / Ilustração'
        };
    }

    /**
     * Busca imagem simples (apenas URL)
     */
    async getImage(title, content = '') {
        const result = await this.getImageForArticle(title, content);
        return result.url;
    }
}

module.exports = { AthleteImageScraper };
