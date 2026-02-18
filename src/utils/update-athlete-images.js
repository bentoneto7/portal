#!/usr/bin/env node

/**
 * UPDATE ATHLETE IMAGES
 *
 * Atualiza artigos existentes com imagens REAIS de atletas
 * Usa licenças jornalísticas apropriadas
 */

const { AthleteImageScraper } = require('../scrapers/athlete-image-scraper');
const fs = require('fs').promises;
const path = require('path');

class AthleteImageUpdater {
    constructor() {
        this.athleteImages = new AthleteImageScraper();
        this.articlesIndexPath = path.join(__dirname, '../../data/articles-index.json');
        this.publicArticlesIndexPath = path.join(__dirname, '../../public/data/articles-index.json');
        this.updatedCount = 0;
    }

    /**
     * Inicializa
     */
    async init() {
        await this.athleteImages.init();
        console.log('✅ Athlete Image Updater initialized\n');
    }

    /**
     * Atualiza todas as imagens
     */
    async updateAllImages() {
        console.log('🖼️  ATUALIZANDO IMAGENS COM ATLETAS REAIS\n');

        try {
            // Lê índice de artigos
            const data = await fs.readFile(this.articlesIndexPath, 'utf8');
            const articles = JSON.parse(data);

            console.log(`📊 Total de artigos: ${articles.length}\n`);

            // Atualiza cada artigo
            for (const article of articles) {
                await this.updateArticleImage(article);
            }

            // Salva índice atualizado
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

            console.log(`\n✅ Atualização completa!`);
            console.log(`📈 ${this.updatedCount} artigos com novas imagens de atletas`);
            console.log(`📸 ${articles.length - this.updatedCount} artigos mantiveram imagens originais\n`);

        } catch (error) {
            console.error('❌ Erro ao atualizar imagens:', error);
            throw error;
        }
    }

    /**
     * Atualiza imagem de um artigo
     */
    async updateArticleImage(article) {
        console.log(`📝 ${article.title.substring(0, 60)}...`);

        try {
            // Busca imagem real do atleta
            const imageData = await this.athleteImages.getImageForArticle(
                article.title,
                article.excerpt || ''
            );

            const oldImage = article.image;
            const newImage = imageData.url;

            // Verifica se encontrou imagem melhor
            if (newImage !== oldImage) {
                article.image = newImage;

                // Adiciona créditos se tiver
                if (imageData.credit) {
                    article.imageCredit = imageData.credit;
                }

                console.log(`   ✅ Nova imagem: ${imageData.alt}`);
                console.log(`   📸 Crédito: ${imageData.credit}`);
                this.updatedCount++;
            } else {
                console.log(`   ⏭️  Imagem mantida`);
            }

        } catch (error) {
            console.error(`   ❌ Erro: ${error.message}`);
        }

        // Pequeno delay para não sobrecarregar APIs
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    (async () => {
        const updater = new AthleteImageUpdater();
        await updater.init();
        await updater.updateAllImages();

    })().catch(error => {
        console.error('\n💥 ERRO FATAL:', error);
        process.exit(1);
    });
}

module.exports = { AthleteImageUpdater };
