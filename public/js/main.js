// News Portal - Main JavaScript (Static Version)
// Carrega artigos diretamente do articles-index.json

// Language Management
const languageSelector = {
    currentLang: 'pt-BR',

    init() {
        const buttons = document.querySelectorAll('.language-selector button');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchLanguage(e.target.dataset.lang);
            });
        });
    },

    switchLanguage(lang) {
        this.currentLang = lang;

        // Update active button
        document.querySelectorAll('.language-selector button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Reload news in new language
        newsLoader.loadAllNews();
    }
};

// News Loader - Static Version
const newsLoader = {
    articlesData: null,

    async loadAllNews() {
        const lang = languageSelector.currentLang;

        // Load articles index
        if (!this.articlesData) {
            try {
                const response = await fetch('/data/articles-index.json');
                this.articlesData = await response.json();
            } catch (error) {
                console.error('Error loading articles:', error);
                return;
            }
        }

        // Filter by language
        const articles = this.articlesData.filter(a => a.language === lang);

        // Load featured story (first article)
        this.loadFeaturedStory(articles);

        // Load category news
        this.loadCategoryNews('brasileirao', articles);
        this.loadCategoryNews('copa', articles);
        this.loadCategoryNews('libertadores', articles);
        this.loadCategoryNews('internacional', articles);

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
        if (!container) return;

        // Filter articles by category
        const categoryArticles = articles.filter(a => a.category === category);

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

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Portal de Notícias de Futebol iniciado!');

    languageSelector.init();
    newsLoader.loadAllNews();
    newsletter.init();
    smoothScroll.init();
    analytics.init();
    imageLazyLoad.init();
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
