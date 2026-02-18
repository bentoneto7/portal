#!/usr/bin/env node

/**
 * ADD SEO TO ARTICLES
 *
 * Adiciona meta tags avançadas, Schema.org, Open Graph e Twitter Cards
 * a todos os artigos existentes
 */

const { SEOGenerator } = require('./seo-generator');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

class SEOArticleUpdater {
    constructor() {
        this.seo = new SEOGenerator();
        this.articlesIndexPath = path.join(__dirname, '../../data/articles-index.json');
        this.publicDir = path.join(__dirname, '../../public');
        this.updatedCount = 0;
    }

    /**
     * Atualiza todos os artigos com SEO avançado
     */
    async updateAllArticles() {
        console.log('🎯 ADICIONANDO SEO AVANÇADO A TODOS OS ARTIGOS\n');

        try {
            // Lê índice
            const data = await fs.readFile(this.articlesIndexPath, 'utf8');
            const articles = JSON.parse(data);

            console.log(`📊 Total de artigos: ${articles.length}\n`);

            // Atualiza cada artigo
            for (const article of articles) {
                await this.updateArticleSEO(article);
            }

            console.log(`\n✅ SEO atualizado com sucesso!`);
            console.log(`📈 ${this.updatedCount} artigos otimizados para Google e redes sociais\n`);

        } catch (error) {
            console.error('❌ Erro ao atualizar SEO:', error);
            throw error;
        }
    }

    /**
     * Atualiza SEO de um artigo
     */
    async updateArticleSEO(article) {
        console.log(`📝 ${article.title.substring(0, 60)}...`);

        try {
            const htmlPath = path.join(this.publicDir, 'artigo', `${article.id}.html`);

            // Verifica se arquivo existe
            try {
                await fs.access(htmlPath);
            } catch {
                console.log(`   ⚠️  Arquivo HTML não encontrado, pulando...`);
                return;
            }

            // Lê HTML
            const html = await fs.readFile(htmlPath, 'utf8');
            const $ = cheerio.load(html);

            // Remove meta tags antigas (exceto charset e viewport)
            $('meta[name]:not([name="viewport"])').remove();
            $('meta[property]').remove();
            $('link[rel="canonical"]').remove();
            $('script[type="application/ld+json"]').remove();

            // Gera novas meta tags
            const metaTags = this.seo.generateAllMetaTags(article);
            const schemaScript = this.seo.generateSchemaScript(article);

            // Adiciona no <head>
            $('head').append(metaTags);
            $('head').append(schemaScript);

            // Adiciona breadcrumb visual se não existir
            if (!$('.breadcrumb').length) {
                const breadcrumb = this.generateBreadcrumbHTML(article);
                $('.article-header').prepend(breadcrumb);
            }

            // Salva HTML atualizado
            await fs.writeFile(htmlPath, $.html(), 'utf8');

            console.log(`   ✅ SEO otimizado: Schema.org + Open Graph + Twitter Card`);
            this.updatedCount++;

        } catch (error) {
            console.error(`   ❌ Erro: ${error.message}`);
        }
    }

    /**
     * Gera breadcrumb HTML
     */
    generateBreadcrumbHTML(article) {
        return `
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol>
                <li><a href="/">Home</a></li>
                <li><a href="/${this.seo.slugify(article.section || 'noticias')}">${article.section || 'Notícias'}</a></li>
                <li aria-current="page">${article.title}</li>
            </ol>
        </nav>`;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    (async () => {
        const updater = new SEOArticleUpdater();
        await updater.updateAllArticles();

    })().catch(error => {
        console.error('\n💥 ERRO FATAL:', error);
        process.exit(1);
    });
}

module.exports = { SEOArticleUpdater };
