// Bola na Rede - Main JavaScript
// Blog 100% focado em futebol brasileiro

// Configuração
const config = {
    language: 'pt-BR', // Fixo em português
    apiUrl: '/data/articles-index.json'
};

// News Loader - Static Version
const newsLoader = {
    articlesData: null,

    async loadAllNews() {
        // Load articles index
        if (!this.articlesData) {
            try {
                const response = await fetch(config.apiUrl);
                this.articlesData = await response.json();
            } catch (error) {
                console.error('❌ Erro ao carregar artigos:', error);
                return;
            }
        }

        // Filter by language (pt-BR apenas)
        const articles = this.articlesData.filter(a => a.language === config.language);

        console.log(`⚽ ${articles.length} artigos carregados`);

        // Load featured story (first article)
        this.loadFeaturedStory(articles);

        // Load category news - NOVAS CATEGORIAS
        this.loadCategoryNews('serie-a', articles); // Série A (Brasileirão)
        this.loadCategoryNews('mercado', articles); // Mercado da Bola
        this.loadCategoryNews('opiniao', articles); // Opinião
        this.loadCategoryNews('taticas', articles); // Táticas e Dados

        // Load trending (top 5 most recent)
        this.loadTrending(articles);
    },

    loadFeaturedStory(articles) {
        if (!articles || articles.length === 0) return;

        // Get the most recent article
        const featured = articles[0];

        const mainStory = document.querySelector('.main-story');
        if (!mainStory) return;

        const imgElement = mainStory.querySelector('.article-image img');
        if (imgElement) {
            imgElement.src = featured.image;
            imgElement.alt = featured.title;
            imgElement.onerror = function() {
                this.src = '/images/placeholder-main.jpg';
            };
        }

        const titleLink = mainStory.querySelector('h2 a');
        if (titleLink) {
            titleLink.textContent = featured.title;
            titleLink.href = featured.url;
        }

        const excerpt = mainStory.querySelector('.article-excerpt');
        if (excerpt) {
            excerpt.textContent = featured.excerpt;
        }

        const dateElement = mainStory.querySelector('.date time');
        if (dateElement) {
            dateElement.textContent = this.formatDate(featured.publishedAt);
            dateElement.setAttribute('datetime', featured.publishedAt);
        }

        const readingTime = mainStory.querySelector('.reading-time');
        if (readingTime) {
            readingTime.textContent = `${featured.readingTime || 5} min de leitura`;
        }

        const categoryBadge = mainStory.querySelector('.category-badge');
        if (categoryBadge) {
            categoryBadge.textContent = this.getCategoryLabel(featured.category);
        }
    },

    loadCategoryNews(category, articles) {
        const container = document.getElementById(`news-${category}`);
        if (!container) {
            console.warn(`⚠️ Container #news-${category} não encontrado`);
            return;
        }

        // Map de categorias do site para categorias dos artigos
        const categoryMap = {
            'serie-a': 'brasileirao',
            'mercado': 'mercado',
            'opiniao': 'opiniao',
            'taticas': 'taticas'
        };

        const actualCategory = categoryMap[category] || category;

        // Filter articles by category
        const categoryArticles = articles.filter(a => a.category === actualCategory);

        if (!categoryArticles || categoryArticles.length === 0) {
            container.innerHTML = '<div class="loading">Nenhuma notícia disponível no momento.</div>';
            return;
        }

        container.innerHTML = categoryArticles.map(article => `
            <article class="news-card" itemscope itemtype="https://schema.org/NewsArticle">
                <div class="news-card-image">
                    <img
                        src="${article.image}"
                        alt="${this.escapeHtml(article.title)}"
                        itemprop="image"
                        onerror="this.src='/images/placeholder.jpg'"
                        loading="lazy"
                    >
                    <span class="news-card-category">${this.getCategoryLabel(article.category)}</span>
                </div>
                <div class="news-card-content">
                    <meta itemprop="datePublished" content="${article.publishedAt}">
                    <h3 itemprop="headline">
                        <a href="${article.url}">${this.escapeHtml(article.title)}</a>
                    </h3>
                    <p class="news-card-excerpt" itemprop="description">${this.escapeHtml(article.excerpt)}</p>
                    <div class="news-card-meta">
                        <span class="date">
                            <time datetime="${article.publishedAt}">${this.formatDate(article.publishedAt)}</time>
                        </span>
                        <span class="reading-time">${article.readingTime || 5} min</span>
                    </div>
                </div>
            </article>
        `).join('');
    },

    loadTrending(articles) {
        const container = document.getElementById('trending-list');
        if (!container) return;

        if (!articles || articles.length === 0) {
            container.innerHTML = '<div class="loading">Nenhuma notícia disponível.</div>';
            return;
        }

        // Get top 5 most recent articles
        const trending = articles.slice(0, 5);

        container.innerHTML = trending.map((article, index) => `
            <div class="trending-item">
                <div class="trending-number">${index + 1}</div>
                <div class="trending-content">
                    <h4><a href="${article.url}">${this.escapeHtml(article.title)}</a></h4>
                    <div class="trending-meta">
                        <time datetime="${article.publishedAt}">${this.formatDate(article.publishedAt)}</time>
                    </div>
                </div>
            </div>
        `).join('');
    },

    getCategoryLabel(category) {
        const labels = {
            'brasileirao': 'Brasileirão',
            'mercado': 'Mercado da Bola',
            'opiniao': 'Opinião',
            'taticas': 'Táticas e Dados',
            'copa': 'Copa do Mundo',
            'libertadores': 'Libertadores',
            'internacional': 'Internacional'
        };
        return labels[category] || category;
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const lang = languageSelector.currentLang;

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return date.toLocaleDateString(lang, options);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Newsletter Form
const newsletter = {
    init() {
        const form = document.querySelector('.newsletter-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    },

    handleSubmit(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;

        // For static site, just show success message
        // In production, you would integrate with a newsletter service
        alert('✅ Inscrição realizada com sucesso!\n\n' +
              'Você receberá as melhores notícias de futebol no email: ' + email);
        e.target.reset();
    }
};

// Smooth Scroll
const smoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();

                    // Scroll with offset for fixed header
                    const headerHeight = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

// Analytics
const analytics = {
    init() {
        // Track page view
        this.trackPageView();

        // Track article clicks
        this.trackArticleClicks();
    },

    trackPageView() {
        console.log('📊 Page view tracked:', window.location.pathname);
        // Implement your analytics tracking here
        // Example: gtag('event', 'page_view', { page_path: window.location.pathname });
    },

    trackArticleClicks() {
        document.addEventListener('click', (e) => {
            const articleLink = e.target.closest('article a, .trending-item a');
            if (articleLink) {
                const title = articleLink.textContent.trim();
                const href = articleLink.getAttribute('href');
                console.log('📰 Article clicked:', { title, href });
                // Send to analytics platform
                // Example: gtag('event', 'article_click', { article_title: title, article_url: href });
            }
        });
    }
};

// Image lazy loading fallback (for older browsers)
const imageLazyLoad = {
    init() {
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            return;
        }

        // Fallback for older browsers
        const images = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
};

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Tabela de Classificação (Mock Data)
const tabelaSerieA = {
    data: [
        { pos: 1, time: 'Botafogo', pontos: 52, jogos: 28, zona: 'libertadores' },
        { pos: 2, time: 'Palmeiras', pontos: 50, jogos: 28, zona: 'libertadores' },
        { pos: 3, time: 'Flamengo', pontos: 48, jogos: 28, zona: 'libertadores' },
        { pos: 4, time: 'Fluminense', pontos: 45, jogos: 28, zona: 'libertadores' },
        { pos: 5, time: 'São Paulo', pontos: 43, jogos: 28, zona: '' },
        { pos: 6, time: 'Grêmio', pontos: 42, jogos: 28, zona: '' },
        { pos: 7, time: 'Internacional', pontos: 40, jogos: 28, zona: '' },
        { pos: 8, time: 'Atlético-MG', pontos: 38, jogos: 28, zona: '' },
        { pos: 17, time: 'Cuiabá', pontos: 28, jogos: 28, zona: 'rebaixamento' },
        { pos: 18, time: 'Coritiba', pontos: 26, jogos: 28, zona: 'rebaixamento' },
        { pos: 19, time: 'Goiás', pontos: 24, jogos: 28, zona: 'rebaixamento' },
        { pos: 20, time: 'América-MG', pontos: 22, jogos: 28, zona: 'rebaixamento' }
    ],

    render() {
        const container = document.getElementById('tabela-serie-a');
        if (!container) return;

        const top8 = this.data.slice(0, 8);
        const bottom4 = this.data.slice(-4);
        const display = [...top8, ...bottom4];

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Time</th>
                        <th>PTS</th>
                    </tr>
                </thead>
                <tbody>
                    ${display.map(team => `
                        <tr class="${team.zona}">
                            <td class="pos">${team.pos}</td>
                            <td class="time">${team.time}</td>
                            <td class="pontos">${team.pontos}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
};

// Enquete da Semana (Mock Data)
const enquete = {
    question: 'Quem leva o Brasileirão 2026?',
    options: [
        { id: 1, text: 'Botafogo', votes: 342 },
        { id: 2, text: 'Palmeiras', votes: 298 },
        { id: 3, text: 'Flamengo', votes: 456 },
        { id: 4, text: 'Outro time', votes: 124 }
    ],
    voted: false,

    render() {
        const container = document.getElementById('poll-container');
        if (!container) return;

        if (!this.voted) {
            container.innerHTML = `
                <div class="poll-question">${this.question}</div>
                <form id="poll-form">
                    ${this.options.map(opt => `
                        <div class="poll-option">
                            <input type="radio" name="poll" id="opt${opt.id}" value="${opt.id}">
                            <label for="opt${opt.id}">${opt.text}</label>
                        </div>
                    `).join('')}
                    <button type="submit" class="poll-btn">🗳️ Votar</button>
                </form>
            `;

            document.getElementById('poll-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.vote();
            });
        } else {
            this.showResults();
        }
    },

    vote() {
        this.voted = true;
        this.showResults();
    },

    showResults() {
        const container = document.getElementById('poll-container');
        const total = this.options.reduce((sum, opt) => sum + opt.votes, 0);

        container.innerHTML = `
            <div class="poll-question">${this.question}</div>
            <div class="poll-results">
                ${this.options.map(opt => {
                    const percentage = ((opt.votes / total) * 100).toFixed(1);
                    return `
                        <div class="poll-result-item">
                            <div class="poll-result-label">
                                <span>${opt.text}</span>
                                <span><strong>${percentage}%</strong></span>
                            </div>
                            <div class="poll-result-bar">
                                <div class="poll-result-fill" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <small style="display: block; margin-top: 10px; color: var(--text-light);">
                Total de votos: ${total.toLocaleString()}
            </small>
        `;
    }
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('⚽ Bola na Rede iniciado!');

    // Carregadores principais
    newsLoader.loadAllNews();
    newsletter.init();
    smoothScroll.init();
    analytics.init();
    imageLazyLoad.init();

    // Novos widgets
    tabelaSerieA.render();
    enquete.render();
});

// Refresh news every 5 minutes (for dynamic content updates)
setInterval(() => {
    console.log('🔄 Atualizando notícias...');
    newsLoader.articlesData = null; // Force reload
    newsLoader.loadAllNews();
}, 5 * 60 * 1000);

// Service Worker registration (for PWA - optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable PWA features
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('✅ Service Worker registered'))
        //     .catch(err => console.error('❌ Service Worker registration failed:', err));
    });
}
