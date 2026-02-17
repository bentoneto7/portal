/**
 * RELATED ARTICLES SYSTEM
 *
 * Sistema de continuação de leitura similar ao Lance.com.br
 * - Busca artigos relacionados por categoria
 * - Usa imagens reais de atletas e escudos de clubes
 * - Widget "Continue Lendo" para manter leitor engajado
 */

class RelatedArticles {
    constructor() {
        this.articlesIndexUrl = '/data/articles-index.json';
        this.articles = [];
        this.currentArticleId = null;

        // Team logos (escudos dos clubes)
        this.teamLogos = {
            'Palmeiras': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/40px-Palmeiras_logo.svg.png',
            'Flamengo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Flamengo-RJ_%28BRA%29.png/40px-Flamengo-RJ_%28BRA%29.png',
            'Santos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Santos_logo.svg/40px-Santos_logo.svg.png',
            'Corinthians': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Corinthians_logo.svg/40px-Corinthians_logo.svg.png',
            'São Paulo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg/40px-Brasao_do_Sao_Paulo_Futebol_Clube.svg.png',
            'Fluminense': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Fluminense_fc_logo.svg/40px-Fluminense_fc_logo.svg.png',
            'Botafogo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Botafogo_de_Futebol_e_Regatas_logo.svg/40px-Botafogo_de_Futebol_e_Regatas_logo.svg.png',
            'Vasco': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Logo_cr_vasco_da_gama_01.svg/40px-Logo_cr_vasco_da_gama_01.svg.png',
            'Atlético-MG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Atletico_mineiro_galo.png/40px-Atletico_mineiro_galo.png',
            'Cruzeiro': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Cruzeiro_Esporte_Clube_%28logo%29.svg/40px-Cruzeiro_Esporte_Clube_%28logo%29.svg.png',
            'Grêmio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Gremio_logo.svg/40px-Gremio_logo.svg.png',
            'Internacional': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Escudo_do_Sport_Club_Internacional.svg/40px-Escudo_do_Sport_Club_Internacional.svg.png',
            'Athletico-PR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Athletico_Paranaense_logo.svg/40px-Athletico_Paranaense_logo.svg.png',
            'Bahia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Esporte_Clube_Bahia_logo.svg/40px-Esporte_Clube_Bahia_logo.svg.png',
            'Fortaleza': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/FortalezaEsporteClube.svg/40px-FortalezaEsporteClube.svg.png'
        };
    }

    /**
     * Inicializa sistema
     */
    async init() {
        try {
            // Carrega índice de artigos
            const response = await fetch(this.articlesIndexUrl);
            this.articles = await response.json();

            // Detecta artigo atual pela URL
            this.detectCurrentArticle();

            // Renderiza artigos relacionados
            this.renderRelatedArticles();

            // Renderiza widget "Continue Lendo" no sidebar
            this.renderContinueReading();

            console.log('✅ Sistema de artigos relacionados carregado');

        } catch (error) {
            console.error('❌ Erro ao carregar artigos relacionados:', error);
        }
    }

    /**
     * Detecta artigo atual pela URL
     */
    detectCurrentArticle() {
        const path = window.location.pathname;

        // Extrai ID do artigo da URL
        // Ex: /articles/pt-BR/brasileirao/palmeiras-vitoria.html → palmeiras-vitoria
        const match = path.match(/\/([^\/]+)\.html$/);
        if (match) {
            this.currentArticleId = match[1];
        }
    }

    /**
     * Busca artigos relacionados
     */
    getRelatedArticles(limit = 4) {
        if (!this.currentArticleId) {
            // Se não detectou artigo, retorna os mais recentes
            return this.articles.slice(0, limit);
        }

        // Encontra artigo atual
        const currentArticle = this.articles.find(a => a.id === this.currentArticleId);

        if (!currentArticle) {
            return this.articles.slice(0, limit);
        }

        // Busca artigos da mesma categoria
        const sameCategory = this.articles.filter(article =>
            article.id !== this.currentArticleId &&
            article.category === currentArticle.category
        );

        // Se não houver artigos suficientes da mesma categoria, pega de outras
        if (sameCategory.length < limit) {
            const otherArticles = this.articles.filter(article =>
                article.id !== this.currentArticleId &&
                article.category !== currentArticle.category
            );

            return [...sameCategory, ...otherArticles].slice(0, limit);
        }

        return sameCategory.slice(0, limit);
    }

    /**
     * Extrai nome do time do título (para adicionar escudo)
     */
    extractTeamFromTitle(title) {
        for (const team of Object.keys(this.teamLogos)) {
            if (title.includes(team)) {
                return team;
            }
        }
        return null;
    }

    /**
     * Renderiza artigos relacionados (fim do artigo)
     */
    renderRelatedArticles() {
        const container = document.querySelector('.related-articles-container');

        if (!container) return;

        const relatedArticles = this.getRelatedArticles(3);

        const html = `
            <div class="related-articles">
                <h3>📰 Continue Lendo</h3>
                <p style="color: #757575; margin-bottom: 25px;">Matérias que você não pode perder:</p>

                <div class="related-grid">
                    ${relatedArticles.map(article => this.renderRelatedCard(article)).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Renderiza card de artigo relacionado
     */
    renderRelatedCard(article) {
        const team = this.extractTeamFromTitle(article.title);
        const teamLogo = team ? this.teamLogos[team] : null;

        // Monta badge da categoria
        const categoryBadge = this.getCategoryBadge(article.category);

        return `
            <a href="${article.url}" class="related-card">
                <div class="related-card-image" style="position: relative;">
                    <img src="${article.image}" alt="${article.title}" loading="lazy">
                    ${teamLogo ? `
                        <div class="team-logo-overlay" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.95); padding: 8px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                            <img src="${teamLogo}" alt="${team}" style="width: 32px; height: 32px; display: block;">
                        </div>
                    ` : ''}
                    <div class="category-badge-overlay" style="position: absolute; bottom: 10px; left: 10px;">
                        ${categoryBadge}
                    </div>
                </div>
                <div class="related-card-content">
                    <h4>${article.title}</h4>
                    <p class="related-meta" style="font-size: 13px; color: #757575; margin-top: 10px;">
                        ⏱️ ${article.readingTime} min de leitura
                    </p>
                </div>
            </a>
        `;
    }

    /**
     * Renderiza widget "Continue Lendo" no sidebar
     */
    renderContinueReading() {
        const sidebar = document.querySelector('.article-sidebar');

        if (!sidebar) return;

        const relatedArticles = this.getRelatedArticles(5);

        const html = `
            <div class="sidebar-widget continue-reading-widget">
                <h3>🔥 Não Perca</h3>
                <ul class="continue-reading-list">
                    ${relatedArticles.map((article, index) => `
                        <li class="continue-reading-item">
                            <a href="${article.url}">
                                <div class="continue-reading-thumbnail">
                                    <img src="${article.image}" alt="${article.title}" loading="lazy">
                                    ${this.renderTeamBadge(article.title)}
                                </div>
                                <div class="continue-reading-content">
                                    <span class="continue-reading-number">${index + 1}</span>
                                    <h4>${this.truncateTitle(article.title, 60)}</h4>
                                    <span class="continue-reading-category">${article.category.toUpperCase()}</span>
                                </div>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        sidebar.insertAdjacentHTML('afterbegin', html);
    }

    /**
     * Renderiza badge do time (escudo)
     */
    renderTeamBadge(title) {
        const team = this.extractTeamFromTitle(title);

        if (!team || !this.teamLogos[team]) {
            return '';
        }

        return `
            <div class="team-badge-mini" style="position: absolute; bottom: 5px; right: 5px; background: rgba(255,255,255,0.95); padding: 4px; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.3);">
                <img src="${this.teamLogos[team]}" alt="${team}" style="width: 20px; height: 20px; display: block;">
            </div>
        `;
    }

    /**
     * Trunca título
     */
    truncateTitle(title, maxLength) {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    }

    /**
     * Badge de categoria
     */
    getCategoryBadge(category) {
        const colors = {
            'brasileirao': '#009739',
            'copa': '#FFDF00',
            'mercado': '#1e88e5',
            'opiniao': '#e53935',
            'taticas': '#6a1b9a',
            'internacional': '#ff6f00'
        };

        const color = colors[category] || '#009739';
        const textColor = category === 'copa' ? '#000' : '#fff';

        return `
            <span style="
                background: ${color};
                color: ${textColor};
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
                ${category}
            </span>
        `;
    }
}

// Auto-inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.relatedArticles = new RelatedArticles();
        window.relatedArticles.init();
    });
} else {
    window.relatedArticles = new RelatedArticles();
    window.relatedArticles.init();
}
