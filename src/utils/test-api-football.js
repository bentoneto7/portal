#!/usr/bin/env node

/**
 * TEST API-FOOTBALL
 *
 * Script para testar integração com API-Football
 * Verifica se API key está funcionando e mostra dados disponíveis
 */

require('dotenv').config();
const axios = require('axios');

class APIFootballTester {
    constructor() {
        this.apiKey = process.env.API_FOOTBALL_KEY;
        this.apiHost = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io';
        this.baseUrl = `https://${this.apiHost}`;
    }

    /**
     * Executa todos os testes
     */
    async runAllTests() {
        console.log('🧪 TESTANDO API-FOOTBALL\n');
        console.log('━'.repeat(60));

        // Verifica se API key está configurada
        if (!this.apiKey) {
            console.log('\n❌ API_FOOTBALL_KEY não configurada!');
            console.log('\n📝 Adicione no arquivo .env:');
            console.log('   API_FOOTBALL_KEY=sua_chave_aqui\n');
            process.exit(1);
        }

        console.log(`\n✅ API Key encontrada: ${this.apiKey.substring(0, 10)}...`);
        console.log(`🌐 Host: ${this.apiHost}\n`);
        console.log('━'.repeat(60));

        try {
            // Teste 1: Status da API
            await this.testAPIStatus();

            // Teste 2: Buscar jogador (Neymar)
            await this.testPlayerSearch('Neymar', 276);

            // Teste 3: Buscar time (Flamengo)
            await this.testTeamSearch('Flamengo', 127);

            // Teste 4: Verificar quota
            await this.checkQuota();

            console.log('\n━'.repeat(60));
            console.log('✅ TODOS OS TESTES PASSARAM!');
            console.log('🎉 API-Football está configurada corretamente!\n');

        } catch (error) {
            console.log('\n━'.repeat(60));
            console.log('❌ ERRO NOS TESTES:', error.message);
            console.log('\n💡 Possíveis causas:');
            console.log('   1. API key inválida ou expirada');
            console.log('   2. Limite de requests atingido (100/dia no plano free)');
            console.log('   3. Sem conexão com internet');
            console.log('   4. API-Football fora do ar\n');
            process.exit(1);
        }
    }

    /**
     * Testa status da API
     */
    async testAPIStatus() {
        console.log('\n📡 Teste 1: Verificando conexão com API...');

        try {
            const response = await axios.get(`${this.baseUrl}/status`, {
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': this.apiHost
                },
                timeout: 10000
            });

            console.log('   ✅ API está online');
            console.log(`   📊 Versão: ${response.data.response.version || 'v3'}`);

        } catch (error) {
            throw new Error('Falha ao conectar com API-Football');
        }
    }

    /**
     * Testa busca de jogador
     */
    async testPlayerSearch(playerName, playerId) {
        console.log(`\n⚽ Teste 2: Buscando jogador "${playerName}" (ID: ${playerId})...`);

        try {
            const response = await axios.get(`${this.baseUrl}/players`, {
                params: { id: playerId },
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': this.apiHost
                },
                timeout: 10000
            });

            if (!response.data || !response.data.response || response.data.response.length === 0) {
                throw new Error('Nenhum dado retornado');
            }

            const player = response.data.response[0].player;

            console.log('   ✅ Jogador encontrado:');
            console.log(`   📝 Nome: ${player.name}`);
            console.log(`   📅 Nascimento: ${player.birth.date} (${player.birth.place}, ${player.birth.country})`);
            console.log(`   🎂 Idade: ${player.age} anos`);
            console.log(`   🇧🇷 Nacionalidade: ${player.nationality}`);
            console.log(`   📏 Altura: ${player.height}`);
            console.log(`   ⚖️  Peso: ${player.weight}`);
            console.log(`   📸 Foto: ${player.photo}`);

            // Testa se a imagem existe
            const imageExists = await this.checkImageExists(player.photo);
            console.log(`   ${imageExists ? '✅' : '❌'} Foto acessível: ${imageExists ? 'Sim' : 'Não'}`);

        } catch (error) {
            throw new Error(`Falha ao buscar jogador: ${error.message}`);
        }
    }

    /**
     * Testa busca de time
     */
    async testTeamSearch(teamName, teamId) {
        console.log(`\n🏆 Teste 3: Buscando time "${teamName}" (ID: ${teamId})...`);

        try {
            const response = await axios.get(`${this.baseUrl}/teams`, {
                params: { id: teamId },
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': this.apiHost
                },
                timeout: 10000
            });

            if (!response.data || !response.data.response || response.data.response.length === 0) {
                throw new Error('Nenhum dado retornado');
            }

            const team = response.data.response[0].team;

            console.log('   ✅ Time encontrado:');
            console.log(`   📝 Nome: ${team.name}`);
            console.log(`   🔤 Código: ${team.code}`);
            console.log(`   🌍 País: ${team.country}`);
            console.log(`   📅 Fundado: ${team.founded}`);
            console.log(`   🏟️  Estádio: ${team.venue?.name || 'N/A'}`);
            console.log(`   📸 Logo: ${team.logo}`);

            // Testa se o logo existe
            const logoExists = await this.checkImageExists(team.logo);
            console.log(`   ${logoExists ? '✅' : '❌'} Logo acessível: ${logoExists ? 'Sim' : 'Não'}`);

        } catch (error) {
            throw new Error(`Falha ao buscar time: ${error.message}`);
        }
    }

    /**
     * Verifica quota de requests
     */
    async checkQuota() {
        console.log('\n📊 Teste 4: Verificando quota de requests...');

        try {
            // A quota vem no header das respostas
            const response = await axios.get(`${this.baseUrl}/status`, {
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': this.apiHost
                },
                timeout: 10000
            });

            const headers = response.headers;
            const requestsLimit = headers['x-ratelimit-requests-limit'] || 'N/A';
            const requestsRemaining = headers['x-ratelimit-requests-remaining'] || 'N/A';

            console.log('   ✅ Quota verificada:');
            console.log(`   🎯 Limite diário: ${requestsLimit} requests`);
            console.log(`   ⏳ Restantes hoje: ${requestsRemaining} requests`);

            if (requestsRemaining !== 'N/A' && parseInt(requestsRemaining) < 20) {
                console.log('   ⚠️  ATENÇÃO: Poucos requests restantes!');
            }

        } catch (error) {
            console.log('   ⚠️  Não foi possível verificar quota');
        }
    }

    /**
     * Verifica se imagem existe
     */
    async checkImageExists(url) {
        try {
            const response = await axios.head(url, { timeout: 5000 });
            return response.status === 200;
        } catch {
            return false;
        }
    }
}

// Executar testes
if (require.main === module) {
    const tester = new APIFootballTester();
    tester.runAllTests().catch(error => {
        console.error('\n💥 ERRO:', error.message);
        process.exit(1);
    });
}

module.exports = { APIFootballTester };
