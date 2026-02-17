/**
 * INFINITE FEED
 *
 * Sistema de feed infinito após ler um artigo
 * Carrega próximos artigos automaticamente (scroll infinito)
 * Tecnologia 2026 com PWA + Analytics integrado
 */

class InfiniteFeed {
    constructor() {
        this.currentArticleId = null;
        this.loadedArticles = new Set();
        this.allArticles = [];
        this.isLoading = false;
        this.observer = null;
        this.feedContainer = null;
        this.articlesPerLoad = 3;
        this.currentIndex = 0;
    }

    /**
     * Inicializa feed infinito
     */
    async init() {
        // Detecta se está na página de artigo
        const match = window.location.pathname.match(/\/artigo\/([^\/]+)/);
        if (!match) return;

        this.currentArticleId = match[1].replace('.html', '');

        // Carrega artigos
        await this.loadArticles();

        // Cria container do feed
        this.createFeedContainer();

        // Carrega primeiros artigos
        this.loadNextArticles();

        // Configura Intersection Observer
        this.setupIntersectionObserver();

        // Tracking
        this.trackFeedView();

        console.log('📰 Infinite Feed initialized');
    }

    /**
     * Carrega lista de artigos
     */
    async loadArticles() {
        try {
            const response = await fetch('/data/articles-index.json');
            this.allArticles = await response.json();

            // Remove artigo atual
            this.allArticles = this.allArticles.filter(
                a => a.id !== this.currentArticleId
            );

            // Marca artigo atual como lido
            this.loadedArticles.add(this.currentArticleId);

            console.log(`📚 ${this.allArticles.length} artigos disponíveis`);

        } catch (error) {
            console.error('Erro ao carregar artigos:', error);
            this.allArticles = [];
        }
    }

    /**
     * Cria container do feed
     */
    createFeedContainer() {
        // Encontra final do artigo
        const articleContent = document.querySelector('.article-content');
        if (!articleContent) return;

        // Cria seção de feed
        const feedSection = document.createElement('div');
        feedSection.id = 'infinite-feed';
        feedSection.className = 'infinite-feed';
        feedSection.innerHTML = `
            <div class="feed-cta-banner">
                <h2>🔥 NÃO PARE AGORA!</h2>
                <p>Continue lendo as melhores notícias de futebol do Brasil</p>
                <div class="cta-stats">
                    <span>📰 Mais de 100 notícias</span>
                    <span>⚡ Atualizações em tempo real</span>
                    <span>🏆 Análises exclusivas</span>
                </div>
            </div>
            <div class="feed-header">
                <h2>📰 Recomendado para Você</h2>
                <p>Matérias selecionadas especialmente para continuar sua leitura</p>
            </div>
            <div id="feed-articles" class="feed-articles"></div>
            <div id="feed-loader" class="feed-loader" style="display: none;">
                <div class="loader-spinner"></div>
                <p>Carregando mais notícias incríveis...</p>
            </div>
            <div id="feed-end" class="feed-end" style="display: none;">
                <p>🎉 Você leu todas as notícias disponíveis!</p>
                <p class="feed-end-secondary">Você é um verdadeiro fanático por futebol! ⚽</p>
                <a href="/" class="btn-home">Ver Mais Notícias</a>
            </div>
        `;

        // Insere após o artigo
        articleContent.parentElement.appendChild(feedSection);

        this.feedContainer = document.getElementById('feed-articles');
        this.loaderElement = document.getElementById('feed-loader');
        this.endElement = document.getElementById('feed-end');
    }

    /**
     * Configura Intersection Observer
     */
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '200px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading) {
                    this.loadNextArticles();
                }
            });
        }, options);

        // Observa loader
        this.observer.observe(this.loaderElement);
    }

    /**
     * Carrega próximos artigos
     */
    async loadNextArticles() {
        if (this.isLoading) return;

        // Verifica se ainda tem artigos
        if (this.currentIndex >= this.allArticles.length) {
            this.showEnd();
            return;
        }

        this.isLoading = true;
        this.showLoader();

        // Simula delay de rede (para UX)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Pega próximos artigos
        const nextArticles = this.allArticles.slice(
            this.currentIndex,
            this.currentIndex + this.articlesPerLoad
        );

        // Renderiza artigos
        nextArticles.forEach(article => {
            this.renderArticle(article);
            this.loadedArticles.add(article.id);
        });

        this.currentIndex += this.articlesPerLoad;
        this.hideLoader();
        this.isLoading = false;

        // Tracking
        this.trackArticlesLoaded(nextArticles.length);
    }

    /**
     * Renderiza artigo no feed
     */
    renderArticle(article) {
        const articleCard = document.createElement('article');
        articleCard.className = 'feed-article-card';
        articleCard.dataset.articleId = article.id;

        // Formata data
        const publishedDate = new Date(article.publishedAt);
        const timeAgo = this.getTimeAgo(publishedDate);

        articleCard.innerHTML = `
            <a href="${article.url || '/artigo/' + article.id + '.html'}" class="feed-article-link" data-article-id="${article.id}">
                <div class="feed-article-image">
                    <img
                        src="${article.image}"
                        alt="${article.title}"
                        loading="lazy"
                    >
                    <span class="feed-article-category">${this.getCategoryLabel(article.category) || 'Notícias'}</span>
                </div>
                <div class="feed-article-content">
                    <h3>${article.title}</h3>
                    <p>${article.excerpt || article.subtitle || ''}</p>
                    <div class="feed-article-meta">
                        <span class="feed-article-source">${article.source || 'Bola na Rede'}</span>
                        <span class="feed-article-time">${timeAgo}</span>
                    </div>
                </div>
            </a>
        `;

        // Adiciona ao feed
        this.feedContainer.appendChild(articleCard);

        // Event listener para tracking
        const link = articleCard.querySelector('.feed-article-link');
        link.addEventListener('click', (e) => {
            this.trackArticleClick(article);
        });

        // Anima entrada
        setTimeout(() => {
            articleCard.classList.add('visible');
        }, 50);
    }

    /**
     * Mostra loader
     */
    showLoader() {
        this.loaderElement.style.display = 'block';
    }

    /**
     * Esconde loader
     */
    hideLoader() {
        this.loaderElement.style.display = 'none';
    }

    /**
     * Mostra final do feed
     */
    showEnd() {
        this.loaderElement.style.display = 'none';
        this.endElement.style.display = 'block';

        // Para de observar
        if (this.observer) {
            this.observer.disconnect();
        }

        // Tracking
        if (typeof analytics !== 'undefined') {
            analytics.sendEvent('feed_end_reached', {
                articles_viewed: this.loadedArticles.size,
                from_article: this.currentArticleId
            });
        }
    }

    /**
     * Calcula tempo atrás
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins} min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;

        return date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short'
        });
    }

    /**
     * Retorna label da categoria
     */
    getCategoryLabel(category) {
        const labels = {
            'brasileirao': 'Brasileirão',
            'copa': 'Copa 2026',
            'neymar': 'Neymar Jr',
            'mercado': 'Mercado',
            'opiniao': 'Opinião',
            'taticas': 'Táticas',
            'regionais': 'Regionais',
            'champions': 'Champions League',
            'estaduais': 'Estaduais'
        };
        return labels[category] || category || 'Notícias';
    }

    /**
     * Tracking de visualização do feed
     */
    trackFeedView() {
        if (typeof analytics !== 'undefined') {
            analytics.sendEvent('infinite_feed_viewed', {
                article_id: this.currentArticleId,
                total_articles_available: this.allArticles.length
            });
        }
    }

    /**
     * Tracking de artigos carregados
     */
    trackArticlesLoaded(count) {
        if (typeof analytics !== 'undefined') {
            analytics.sendEvent('feed_articles_loaded', {
                count: count,
                total_loaded: this.loadedArticles.size,
                from_article: this.currentArticleId
            });
        }
    }

    /**
     * Tracking de clique em artigo
     */
    trackArticleClick(article) {
        if (typeof analytics !== 'undefined') {
            analytics.sendEvent('feed_article_click', {
                from_article: this.currentArticleId,
                to_article: article.id,
                position: Array.from(this.loadedArticles).indexOf(article.id),
                category: article.section
            });
        }
    }
}

// Instância global
const infiniteFeed = new InfiniteFeed();

// Inicializa quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => infiniteFeed.init());
} else {
    infiniteFeed.init();
}

// Expõe globalmente
window.infiniteFeed = infiniteFeed;
