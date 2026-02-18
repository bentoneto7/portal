/**
 * UPDATE ARTICLE IMAGES
 *
 * Script para atualizar imagens dos artigos com:
 * 1. Logos reais dos times
 * 2. Imagens reais de notícias do Lance
 * 3. Fallback para Unsplash temático
 */

const { TeamLogoScraper } = require('../scrapers/team-logo-scraper');
const { LanceImageScraper } = require('../scrapers/lance-image-scraper');
const fs = require('fs').promises;
const path = require('path');

class ArticleImageUpdater {
    constructor() {
        this.articlesIndexPath = path.join(__dirname, '../../data/articles-index.json');
        this.publicArticlesIndexPath = path.join(__dirname, '../../public/data/articles-index.json');
        this.teamLogoScraper = new TeamLogoScraper();
        this.lanceImageScraper = new LanceImageScraper();

        // Mapeamento de artigos para times/keywords
        this.articleImageMap = {
            'palmeiras-flamengo-luiz-henrique': {
                keywords: 'Palmeiras Flamengo Luiz Henrique transferência',
                teams: ['Palmeiras', 'Flamengo'],
                type: 'mercado'
            },
            'jhon-arias-palmeiras-flamengo': {
                keywords: 'Jhon Arias Fluminense recusa',
                teams: ['Fluminense'],
                type: 'mercado'
            },
            'santos-investimento-bilionario-neymar': {
                keywords: 'Santos estádio Vila Belmiro investimento',
                teams: ['Santos'],
                type: 'estadio'
            },
            'var-polemica-brasileirao-2026': {
                keywords: 'VAR árbitro polêmica Brasileirão',
                teams: [],
                type: 'var'
            },
            'cbf-iphone-var-tecnologia': {
                keywords: 'CBF VAR tecnologia árbitro',
                teams: [],
                type: 'tecnologia'
            },
            'palmeiras-elenco-mais-valioso': {
                keywords: 'Palmeiras elenco jogadores',
                teams: ['Palmeiras'],
                type: 'time'
            },
            'pressing-revolucao-brasileirao': {
                keywords: 'futebol tática pressing Brasileirão',
                teams: [],
                type: 'tatica'
            },
            'xg-data-analytics-brasileirao': {
                keywords: 'estatísticas analytics dados futebol',
                teams: [],
                type: 'dados'
            },
            'palmeiras-melhor-ataque-brasileirao': {
                keywords: 'Palmeiras ataque gols artilharia',
                teams: ['Palmeiras'],
                type: 'gols'
            },
            'neymar-retorno-santos-assist': {
                keywords: 'Neymar Santos retorno gol',
                teams: ['Santos'],
                type: 'jogador'
            },
            'ancelotti-18-jogadores-copa-2026': {
                keywords: 'Carlo Ancelotti Seleção Brasileira técnico',
                teams: [],
                type: 'selecao'
            },
            'brasil-amistosos-franca-croacia': {
                keywords: 'Seleção Brasileira amistoso França Croácia',
                teams: [],
                type: 'selecao'
            },
            'brasileirao-pausa-carnaval-2026': {
                keywords: 'Carnaval Brasil futebol festa',
                teams: [],
                type: 'cultura'
            },
            'janela-transferencias-fecha-marco': {
                keywords: 'janela transferências mercado bola',
                teams: [],
                type: 'mercado'
            },
            'neymar-ancelotti-condicoes-selecao': {
                keywords: 'Neymar Ancelotti Seleção Brasileira',
                teams: [],
                type: 'selecao'
            },
            'neymar-joelho-santos-cuidado': {
                keywords: 'Neymar lesão joelho recuperação',
                teams: ['Santos'],
                type: 'lesao'
            },
            'resultados-rodada-12-fevereiro': {
                keywords: 'Brasileirão rodada resultados jogos',
                teams: [],
                type: 'resultados'
            },
            'arbitragem-profissional-cbf': {
                keywords: 'árbitro CBF profissional apito',
                teams: [],
                type: 'arbitragem'
            },
            'copa-mundo-estadios-brasil-fifa': {
                keywords: 'Copa do Mundo 2026 estádio FIFA',
                teams: [],
                type: 'copa'
            }
        };
    }

    /**
     * Inicializa scrapers
     */
    async init() {
        console.log('\n🚀 Initializing Article Image Updater...\n');
        await this.teamLogoScraper.init();
        await this.lanceImageScraper.init();
    }

    /**
     * Atualiza todas as imagens dos artigos
     */
    async updateAllImages() {
        try {
            // Lê articles-index.json
            const articlesData = await fs.readFile(this.articlesIndexPath, 'utf8');
            const articles = JSON.parse(articlesData);

            console.log(`\n📰 Updating images for ${articles.length} articles...\n`);

            let updated = 0;
            let failed = 0;

            for (const article of articles) {
                const mapping = this.articleImageMap[article.id];

                if (!mapping) {
                    console.log(`⚠️  [${article.id}] No mapping found, skipping`);
                    continue;
                }

                try {
                    console.log(`\n🔄 Processing: ${article.id}`);
                    console.log(`   Keywords: ${mapping.keywords}`);

                    // Tenta buscar imagem do Lance
                    const lanceImage = await this.lanceImageScraper.searchNewsImage(mapping.keywords);

                    if (lanceImage && lanceImage.url) {
                        article.image = lanceImage.url;
                        console.log(`   ✅ Updated with Lance image: ${lanceImage.url.substring(0, 60)}...`);
                        updated++;
                    } else {
                        // Fallback: mantém Unsplash atual ou usa imagem temática
                        console.log(`   ⚠️  No Lance image found, keeping current`);
                        failed++;
                    }

                } catch (error) {
                    console.error(`   ❌ Error: ${error.message}`);
                    failed++;
                }

                // Delay entre artigos
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            // Salva articles-index atualizado
            await fs.writeFile(
                this.articlesIndexPath,
                JSON.stringify(articles, null, 2),
                'utf8'
            );

            await fs.writeFile(
                this.publicArticlesIndexPath,
                JSON.stringify(articles, null, 2),
                'utf8'
            );

            console.log('\n📊 SUMMARY:');
            console.log(`   ✅ Updated: ${updated}`);
            console.log(`   ⚠️  Failed: ${failed}`);
            console.log(`   📝 Total: ${articles.length}`);
            console.log('\n✅ Articles index saved!\n');

        } catch (error) {
            console.error('❌ Error updating images:', error);
            throw error;
        }
    }

    /**
     * Atualiza logos no widget de jogos
     */
    async updateMatchLogos() {
        console.log('\n⚽ Updating match widget logos...\n');

        const teams = [
            'Santos', 'Novorizontino', 'São Paulo', 'Grêmio',
            'Vitória', 'Flamengo', 'Atlético-MG', 'Remo',
            'Vasco', 'Bahia'
        ];

        const logos = await this.teamLogoScraper.getMultipleLogos(teams);

        console.log('\n📊 Logos found:');
        for (const [team, logo] of Object.entries(logos)) {
            console.log(`   ${logo.emoji} ${team}: ${logo.url ? '✅' : '⚠️  emoji only'}`);
        }

        return logos;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    (async () => {
        const updater = new ArticleImageUpdater();
        await updater.init();
        await updater.updateAllImages();
        await updater.updateMatchLogos();
        console.log('\n🎉 Done!\n');
    })().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { ArticleImageUpdater };
