#!/usr/bin/env node

/**
 * SCRIPT PRINCIPAL - Execução Diária do Agente Bola na Rede
 *
 * Este script é chamado pelo GitHub Actions 1x por dia.
 * Pipeline: Coletar → Gerar Artigos → Publicar → Commit & Push
 */

require('dotenv').config();

const FutebolScraper = require('../src/scrapers/futebol-scraper');
const FutebolAgent = require('../src/agents/futebol-agent');
const DailyPublisher = require('../src/publisher/daily-publisher');

const MAX_ARTIGOS_POR_DIA = parseInt(process.env.MAX_ARTIGOS || '8');
const MIN_FONTES = parseInt(process.env.MIN_SOURCES || '1');

async function main() {
    const inicio = Date.now();

    console.log('╔══════════════════════════════════════════╗');
    console.log('║   ⚽ BOLA NA REDE - Edição Diária       ║');
    console.log('║   Agente Jornalista de Futebol AI        ║');
    console.log(`║   ${new Date().toLocaleString('pt-BR')}     ║`);
    console.log('╚══════════════════════════════════════════╝\n');

    // Validação de ambiente
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ ANTHROPIC_API_KEY não configurada!');
        process.exit(1);
    }

    try {
        // FASE 1: Coleta de notícias
        console.log('═══ FASE 1: COLETA DE NOTÍCIAS ═══\n');
        const scraper = new FutebolScraper();
        const noticias = await scraper.coletarNoticias();

        if (noticias.length < MIN_FONTES) {
            console.warn(`⚠️ Poucas fontes encontradas (${noticias.length}). Mínimo: ${MIN_FONTES}`);
            if (noticias.length === 0) {
                console.log('❌ Nenhuma notícia coletada. Encerrando.');
                process.exit(0);
            }
        }

        // FASE 2: Geração de artigos via IA
        console.log('\n═══ FASE 2: GERAÇÃO DE ARTIGOS (CLAUDE AI) ═══\n');
        const agent = new FutebolAgent(process.env.ANTHROPIC_API_KEY);
        const artigos = await agent.gerarEdicaoDiaria(noticias);

        if (artigos.length === 0) {
            console.log('⚠️ Nenhum artigo gerado. Encerrando.');
            process.exit(0);
        }

        // Limita quantidade de artigos por dia
        const artigosFinais = artigos.slice(0, MAX_ARTIGOS_POR_DIA);
        console.log(`\n📝 ${artigosFinais.length} artigos gerados (limite: ${MAX_ARTIGOS_POR_DIA})\n`);

        // FASE 3: Publicação
        console.log('═══ FASE 3: PUBLICAÇÃO ═══\n');
        const publisher = new DailyPublisher(process.cwd());
        const publicados = await publisher.publicarEdicao(artigosFinais);

        // FASE 4: Commit e Push (se executando no CI)
        if (process.env.CI || process.env.GITHUB_ACTIONS) {
            console.log('\n═══ FASE 4: GIT COMMIT & PUSH ═══\n');
            await publisher.commitEPush();
        } else {
            console.log('\n⏭️ Ambiente local - pulando git push (use --push para forçar)');
            if (process.argv.includes('--push')) {
                await publisher.commitEPush();
            }
        }

        // Resumo final
        const duracao = ((Date.now() - inicio) / 1000).toFixed(1);
        console.log('\n╔══════════════════════════════════════════╗');
        console.log(`║   ✅ EDIÇÃO DIÁRIA CONCLUÍDA             ║`);
        console.log(`║   📰 ${publicados.length} artigos publicados             ║`);
        console.log(`║   ⏱️  Duração: ${duracao}s                       ║`);
        console.log('╚══════════════════════════════════════════╝\n');

        // Log das categorias
        const porCategoria = {};
        for (const p of publicados) {
            porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + 1;
        }
        console.log('Distribuição por categoria:');
        for (const [cat, qtd] of Object.entries(porCategoria)) {
            console.log(`   ${cat}: ${qtd} artigo(s)`);
        }

    } catch (error) {
        console.error('\n💥 Erro fatal:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
