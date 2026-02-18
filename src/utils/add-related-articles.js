#!/usr/bin/env node

/**
 * ADD RELATED ARTICLES TO EXISTING ARTICLES
 *
 * Atualiza todos os HTMLs existentes para incluir:
 * - Container de artigos relacionados
 * - Sidebar com widget "Não Perca"
 * - Script related-articles.js
 */

const fs = require('fs').promises;
const path = require('path');

class RelatedArticlesUpdater {
    constructor() {
        this.articlesDir = path.join(__dirname, '../../public/articles/pt-BR');
        this.categories = ['brasileirao', 'copa', 'mercado', 'opiniao', 'taticas', 'internacional'];
        this.updatedCount = 0;
    }

    /**
     * Atualiza todos os artigos
     */
    async updateAllArticles() {
        console.log('\n🔧 ATUALIZANDO ARTIGOS COM SISTEMA DE RELACIONADOS\n');

        for (const category of this.categories) {
            const categoryDir = path.join(this.articlesDir, category);

            try {
                const files = await fs.readdir(categoryDir);
                const htmlFiles = files.filter(f => f.endsWith('.html'));

                console.log(`📁 Categoria: ${category} (${htmlFiles.length} artigos)`);

                for (const file of htmlFiles) {
                    const filePath = path.join(categoryDir, file);
                    await this.updateArticle(filePath);
                }

            } catch (error) {
                console.log(`   ⚠️  Pasta ${category} não encontrada, pulando...`);
            }
        }

        console.log(`\n✅ Atualização completa! ${this.updatedCount} artigos atualizados\n`);
    }

    /**
     * Atualiza um artigo
     */
    async updateArticle(filePath) {
        try {
            let html = await fs.readFile(filePath, 'utf8');

            // Verifica se já tem o sistema de relacionados
            if (html.includes('related-articles-container')) {
                console.log(`   ⏭️  ${path.basename(filePath)} - Já atualizado`);
                return;
            }

            // 1. Adiciona container de artigos relacionados antes de fechar </article>
            html = html.replace(
                /<p class="article-source">.*?<\/p>\s*<\/article>/s,
                `<p class="article-source">Baseado em reportagem do Lance.com.br</p>

            <!-- Continue Lendo: Artigos Relacionados -->
            <div class="related-articles-container"></div>
        </article>`
            );

            // 2. Adiciona sidebar se não existir
            if (!html.includes('article-sidebar')) {
                html = html.replace(
                    /<\/article>\s*<\/main>/s,
                    `</article>

        <!-- Sidebar com "Não Perca" -->
        <aside class="article-sidebar">
            <div class="sidebar-widget">
                <h3>⚽ Sobre o Bola na Rede</h3>
                <p>Portal de notícias esportivas com cobertura completa do futebol brasileiro e internacional.</p>
            </div>
        </aside>
    </main>`
                );
            }

            // 3. Atualiza estrutura do container para grid (2 colunas)
            if (!html.includes('grid-template-columns')) {
                html = html.replace(
                    /<main class="article-container">/,
                    `<main class="article-container" style="display: grid; grid-template-columns: 1fr 300px; gap: 40px; max-width: 1400px; margin: 40px auto; padding: 0 20px;">`
                );
            }

            // 4. Adiciona script related-articles.js antes de </body>
            if (!html.includes('related-articles.js')) {
                html = html.replace(
                    /<script src="\/js\/main.js"><\/script>/,
                    `<script src="/js/main.js"></script>
    <script src="/js/related-articles.js"></script>`
                );
            }

            // 5. Corrige footer class
            html = html.replace(
                /<footer class="article-footer">/g,
                '<footer class="site-footer">'
            );

            // Salva
            await fs.writeFile(filePath, html, 'utf8');

            this.updatedCount++;
            console.log(`   ✅ ${path.basename(filePath)}`);

        } catch (error) {
            console.error(`   ❌ Erro em ${path.basename(filePath)}:`, error.message);
        }
    }
}

// Executar
(async () => {
    const updater = new RelatedArticlesUpdater();
    await updater.updateAllArticles();
})().catch(error => {
    console.error('💥 ERRO FATAL:', error);
    process.exit(1);
});
