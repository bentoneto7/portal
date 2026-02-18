/**
 * TEAM LOGO SCRAPER
 *
 * Busca logos oficiais dos times brasileiros de múltiplas fontes:
 * 1. Wikimedia Commons (legal, livre)
 * 2. API-Football (se configurado)
 * 3. Cache local
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class TeamLogoScraper {
    constructor() {
        this.cacheDir = path.join(__dirname, '../../data/cache/logos');
        this.cacheFile = path.join(this.cacheDir, 'team-logos.json');
        this.cache = {};

        // Mapeamento de times brasileiros para Wikimedia Commons
        this.wikimediaLogos = {
            'Palmeiras': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/200px-Palmeiras_logo.svg.png',
            'Flamengo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Flamengo-RJ_%28BRA%29.png/200px-Flamengo-RJ_%28BRA%29.png',
            'São Paulo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg/200px-Brasao_do_Sao_Paulo_Futebol_Clube.svg.png',
            'Corinthians': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Sport_Club_Corinthians_Paulista_crest.svg/200px-Sport_Club_Corinthians_Paulista_crest.svg.png',
            'Fluminense': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Fluminense_FC_escudo.svg/200px-Fluminense_FC_escudo.svg.png',
            'Atlético-MG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Atletico_mineiro_galo.png/200px-Atletico_mineiro_galo.png',
            'Grêmio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Gremio.svg/200px-Gremio.svg.png',
            'Internacional': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Escudo_do_Sport_Club_Internacional.svg/200px-Escudo_do_Sport_Club_Internacional.svg.png',
            'Santos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Santos_logo.svg/200px-Santos_logo.svg.png',
            'Botafogo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Botafogo_de_Futebol_e_Regatas_logo.svg/200px-Botafogo_de_Futebol_e_Regatas_logo.svg.png',
            'Vasco': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Vasco_da_Gama.svg/200px-Vasco_da_Gama.svg.png',
            'Cruzeiro': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Cruzeiro_Esporte_Clube_%28logo%29.svg/200px-Cruzeiro_Esporte_Clube_%28logo%29.svg.png',
            'Bahia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Escudo_do_Esporte_Clube_Bahia.svg/200px-Escudo_do_Esporte_Clube_Bahia.svg.png',
            'Vitória': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Vit%C3%B3ria_logo.svg/200px-Vit%C3%B3ria_logo.svg.png',
            'Athletico-PR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Athletico_Paranaense.svg/200px-Athletico_Paranaense.svg.png',
            'Coritiba': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Coritiba_logo.svg/200px-Coritiba_logo.svg.png',
            'Fortaleza': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/FortalezaEsporteClube.svg/200px-FortalezaEsporteClube.svg.png',
            'Ceará': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Cear%C3%A1_Sporting_Club_%28logo%29.svg/200px-Cear%C3%A1_Sporting_Club_%28logo%29.svg.png',
            'Bragantino': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/RedBullBragantino.svg/200px-RedBullBragantino.svg.png',
            'Goiás': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Goi%C3%A1s_Esporte_Clube.svg/200px-Goi%C3%A1s_Esporte_Clube.svg.png',
            'Cuiabá': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Cuiab%C3%A1_Esporte_Clube_logo.svg/200px-Cuiab%C3%A1_Esporte_Clube_logo.svg.png',
            'Remo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Clube_do_Remo.svg/200px-Clube_do_Remo.svg.png',
            'Novorizontino': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gremio_Novorizontino.png/200px-Gremio_Novorizontino.png',
            'Mirassol': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Mirassol_Futebol_Clube-SP.png/200px-Mirassol_Futebol_Clube-SP.png'
        };

        // Emojis de escudos como fallback
        this.emojiShields = {
            'Palmeiras': '🟢',
            'Flamengo': '🔴⚫',
            'São Paulo': '🔴⚪⚫',
            'Corinthians': '⚪⚫',
            'Fluminense': '🟢🔴⚪',
            'Atlético-MG': '⚫⚪',
            'Grêmio': '🔵⚫⚪',
            'Internacional': '🔴',
            'Santos': '⚪⚫',
            'Botafogo': '⚫⚪',
            'Vasco': '⚫⚪',
            'Bahia': '🔵🔴⚪',
            'Vitória': '🔴⚫',
            'Bragantino': '⚪🔴',
            'Remo': '🔵',
            'Novorizontino': '🟡',
            'Mirassol': '🟡'
        };
    }

    /**
     * Inicializa o scraper e carrega cache
     */
    async init() {
        await this.ensureCacheDir();
        await this.loadCache();
        console.log('✅ Team Logo Scraper initialized');
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
     * Carrega cache de logos
     */
    async loadCache() {
        try {
            const data = await fs.readFile(this.cacheFile, 'utf8');
            this.cache = JSON.parse(data);
            console.log(`📦 Loaded ${Object.keys(this.cache).length} logos from cache`);
        } catch (error) {
            console.log('📦 No cache found, starting fresh');
            this.cache = {};
        }
    }

    /**
     * Salva cache de logos
     */
    async saveCache() {
        try {
            await fs.writeFile(this.cacheFile, JSON.stringify(this.cache, null, 2), 'utf8');
            console.log('💾 Cache saved');
        } catch (error) {
            console.error('Error saving cache:', error);
        }
    }

    /**
     * Busca logo de um time
     */
    async getTeamLogo(teamName) {
        // 1. Verifica cache
        if (this.cache[teamName]) {
            return this.cache[teamName];
        }

        // 2. Busca no Wikimedia
        if (this.wikimediaLogos[teamName]) {
            const logo = {
                url: this.wikimediaLogos[teamName],
                emoji: this.emojiShields[teamName] || '⚽',
                source: 'wikimedia',
                cached: new Date().toISOString()
            };

            this.cache[teamName] = logo;
            await this.saveCache();
            return logo;
        }

        // 3. Fallback: emoji
        return {
            url: null,
            emoji: this.emojiShields[teamName] || '⚽',
            source: 'emoji',
            cached: new Date().toISOString()
        };
    }

    /**
     * Busca logos de múltiplos times
     */
    async getMultipleLogos(teamNames) {
        const results = {};

        for (const team of teamNames) {
            results[team] = await this.getTeamLogo(team);
        }

        return results;
    }

    /**
     * Atualiza logo de um time manualmente
     */
    async updateTeamLogo(teamName, logoUrl, emoji) {
        this.cache[teamName] = {
            url: logoUrl,
            emoji: emoji || this.emojiShields[teamName] || '⚽',
            source: 'manual',
            cached: new Date().toISOString()
        };

        await this.saveCache();
        console.log(`✅ Updated logo for ${teamName}`);
    }

    /**
     * Lista todos os times no cache
     */
    listCachedTeams() {
        return Object.keys(this.cache);
    }

    /**
     * Limpa cache
     */
    async clearCache() {
        this.cache = {};
        await this.saveCache();
        console.log('🗑️  Cache cleared');
    }
}

module.exports = { TeamLogoScraper };
