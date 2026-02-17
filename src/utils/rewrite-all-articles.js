#!/usr/bin/env node

/**
 * REWRITE ALL ARTICLES
 *
 * Reescreve TODAS as matérias com:
 * - Conteúdo jornalístico profissional (800-1200 palavras)
 * - Imagens reais de atletas
 * - SEO otimizado
 * - Estrutura moderna
 * - Análises táticas
 * - Citações de especialistas
 */

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const { AthleteImageScraper } = require('../scrapers/athlete-image-scraper');
const { SEOGenerator } = require('./seo-generator');

class ArticleRewriter {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
        this.athleteImages = new AthleteImageScraper();
        this.seo = new SEOGenerator();
        this.articlesIndexPath = path.join(__dirname, '../../data/articles-index.json');
        this.publicDir = path.join(__dirname, '../../public');
        this.rewrittenCount = 0;
    }

    /**
     * Inicializa
     */
    async init() {
        await this.athleteImages.init();
        console.log('✅ Article Rewriter initialized\n');
    }

    /**
     * Reescreve todos os artigos
     */
    async rewriteAllArticles() {
        console.log('📝 REESCREVENDO TODAS AS MATÉRIAS COM IA\n');
        console.log('━'.repeat(60));

        try {
            // Lê índice
            const data = await fs.readFile(this.articlesIndexPath, 'utf8');
            const articles = JSON.parse(data);

            console.log(`\n📊 Total de artigos: ${articles.length}\n`);

            // Reescreve cada artigo
            for (let i = 0; i < articles.length; i++) {
                const article = articles[i];
                console.log(`\n[${i + 1}/${articles.length}] 📰 ${article.title}`);

                await this.rewriteArticle(article);

                // Delay para não sobrecarregar API
                if (i < articles.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            // Salva índice atualizado
            await fs.writeFile(
                this.articlesIndexPath,
                JSON.stringify(articles, null, 2),
                'utf8'
            );

            await fs.writeFile(
                path.join(this.publicDir, 'data/articles-index.json'),
                JSON.stringify(articles, null, 2),
                'utf8'
            );

            console.log('\n━'.repeat(60));
            console.log(`\n✅ REESCRITA COMPLETA!`);
            console.log(`📈 ${this.rewrittenCount} artigos reescritos com sucesso\n`);

        } catch (error) {
            console.error('❌ Erro ao reescrever artigos:', error);
            throw error;
        }
    }

    /**
     * Reescreve um artigo
     */
    async rewriteArticle(article) {
        try {
            const htmlPath = path.join(this.publicDir, 'artigo', `${article.id}.html`);

            // Verifica se arquivo existe
            try {
                await fs.access(htmlPath);
            } catch {
                console.log('   ⚠️  Arquivo não existe, pulando...');
                return;
            }

            // Lê HTML atual
            const html = await fs.readFile(htmlPath, 'utf8');
            const $ = cheerio.load(html);

            const currentTitle = $('.article-title').text() || article.title;
            const currentContent = $('.article-text').text() || '';

            // Gera novo conteúdo com IA
            console.log('   🤖 Gerando conteúdo com Claude Sonnet 4.5...');
            const newContent = await this.generateArticleContent(currentTitle, article);

            // Atualiza imagem
            console.log('   📸 Buscando imagem real...');
            const newImage = await this.athleteImages.getImage(currentTitle);
            article.image = newImage;

            // Atualiza HTML
            $('.article-text').html(newContent.html);
            article.excerpt = newContent.excerpt;
            article.content = newContent.text;
            article.updatedAt = new Date().toISOString();

            // Adiciona meta tags SEO
            const metaTags = this.seo.generateAllMetaTags(article);
            const schemaScript = this.seo.generateSchemaScript(article);

            $('head meta[property]').remove();
            $('head meta[name]:not([name="viewport"])').remove();
            $('head script[type="application/ld+json"]').remove();

            $('head').append(metaTags);
            $('head').append(schemaScript);

            // Atualiza imagem principal
            $('.article-image img').attr('src', newImage);

            // Adiciona scripts modernos se não existir
            if (!$('script[src="/js/infinite-feed.js"]').length) {
                $('body').append('<script src="/js/infinite-feed.js"></script>');
                $('head').append('<link rel="stylesheet" href="/css/infinite-feed.css">');
            }

            // Salva HTML
            await fs.writeFile(htmlPath, $.html(), 'utf8');

            console.log('   ✅ Artigo reescrito com sucesso!');
            console.log(`   📊 Tamanho: ${newContent.wordCount} palavras`);

            this.rewrittenCount++;

        } catch (error) {
            console.error(`   ❌ Erro: ${error.message}`);
        }
    }

    /**
     * Gera conteúdo do artigo com IA
     */
    async generateArticleContent(title, article) {
        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: `Você é um jornalista esportivo profissional brasileiro especializado em futebol.

Reescreva esta notícia de futebol de forma COMPLETA e PROFISSIONAL:

TÍTULO: ${title}
CATEGORIA: ${article.section || 'Futebol'}

INSTRUÇÕES:

1. ESTRUTURA (800-1200 palavras):
   - Lead forte (primeiro parágrafo resumindo tudo)
   - Desenvolvimento detalhado (3-4 parágrafos)
   - Análise tática ou contexto (2-3 parágrafos)
   - Citações fictícias de especialistas (1-2)
   - Conclusão/Perspectivas

2. ESTILO:
   - Jornalismo esportivo brasileiro (estilo GloboEsporte/ESPN)
   - Tom profissional mas envolvente
   - Dados e estatísticas quando relevante
   - Nomes completos na primeira menção
   - Use aspas para citações

3. CONTEÚDO:
   - Expanda com contexto histórico
   - Análise tática detalhada
   - Impacto no campeonato/time
   - Comparações com outros jogadores/momentos
   - Números e estatísticas

4. SEO:
   - Use palavras-chave naturalmente
   - Títulos de seção descritivos
   - Fatos e números específicos

Retorne APENAS o HTML do conteúdo (sem <html>, <head>, <body>), formatado com:
- <h2> para seções
- <p> para parágrafos
- <blockquote> para citações
- <strong> para destaques
- <ul><li> para listas quando apropriado

IMPORTANTE: O texto deve ser COMPLETO, DETALHADO e PROFISSIONAL. Mínimo 800 palavras.`
                }]
            });

            const htmlContent = response.content[0].text;

            // Extrai texto puro para excerpt e contagem
            const $ = cheerio.load(htmlContent);
            const text = $.text();
            const wordCount = text.split(/\s+/).length;

            // Gera excerpt (primeiros 160 caracteres)
            const excerpt = text.substring(0, 160).trim() + '...';

            return {
                html: htmlContent,
                text: text,
                excerpt: excerpt,
                wordCount: wordCount
            };

        } catch (error) {
            console.error('Erro ao gerar conteúdo:', error);

            // Fallback: conteúdo básico
            return {
                html: `<p>${article.excerpt || article.subtitle || 'Conteúdo em desenvolvimento.'}</p>`,
                text: article.excerpt || article.subtitle || '',
                excerpt: article.excerpt || article.subtitle || '',
                wordCount: 0
            };
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    (async () => {
        const rewriter = new ArticleRewriter();
        await rewriter.init();
        await rewriter.rewriteAllArticles();

    })().catch(error => {
        console.error('\n💥 ERRO FATAL:', error);
        process.exit(1);
    });
}

module.exports = { ArticleRewriter };
