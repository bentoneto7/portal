// News Portal - Main JavaScript

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

// News Loader
const newsLoader = {
    categories: {
        'pt-BR': {
            brasil: 'brazil',
            mundo: 'world',
            economia: 'business',
            tecnologia: 'technology'
        },
        'en-US': {
            brasil: 'us',
            mundo: 'world',
            economia: 'business',
            tecnologia: 'technology'
        },
        'es': {
            brasil: 'mexico',
            mundo: 'world',
            economia: 'business',
            tecnologia: 'technology'
        }
    },

    async loadAllNews() {
        const lang = languageSelector.currentLang;

        // Load featured story
        await this.loadFeaturedStory(lang);

        // Load category news
        for (const category in this.categories[lang]) {
            await this.loadCategoryNews(category, lang);
        }

        // Load trending
        await this.loadTrending(lang);
    },

    async loadFeaturedStory(lang) {
        try {
            // This will load from our generated articles
            const response = await fetch(`/api/featured?lang=${lang}`);
            if (response.ok) {
                const article = await response.json();
                this.renderFeaturedStory(article);
            }
        } catch (error) {
            console.error('Error loading featured story:', error);
            this.showPlaceholderFeatured();
        }
    },

    async loadCategoryNews(category, lang) {
        const container = document.getElementById(`news-${category}`);
        if (!container) return;

        container.innerHTML = '<div class="loading">Carregando notícias...</div>';

        try {
            const response = await fetch(`/api/news?category=${category}&lang=${lang}`);
            if (response.ok) {
                const articles = await response.json();
                this.renderNewsGrid(articles, container);
            }
        } catch (error) {
            console.error(`Error loading ${category} news:`, error);
            container.innerHTML = '<div class="loading">Erro ao carregar notícias. Tente novamente.</div>';
        }
    },

    async loadTrending(lang) {
        const container = document.getElementById('trending-list');
        if (!container) return;

        try {
            const response = await fetch(`/api/trending?lang=${lang}`);
            if (response.ok) {
                const articles = await response.json();
                this.renderTrending(articles, container);
            }
        } catch (error) {
            console.error('Error loading trending:', error);
            container.innerHTML = '<div class="loading">Erro ao carregar</div>';
        }
    },

    renderFeaturedStory(article) {
        const mainStory = document.querySelector('.main-story');
        if (!mainStory) return;

        mainStory.querySelector('.article-image img').src = article.image || '/images/placeholder-main.jpg';
        mainStory.querySelector('.article-image img').alt = article.title;
        mainStory.querySelector('h2 a').textContent = article.title;
        mainStory.querySelector('h2 a').href = article.url;
        mainStory.querySelector('.article-excerpt').textContent = article.excerpt;
        mainStory.querySelector('.date time').textContent = this.formatDate(article.publishedAt);
        mainStory.querySelector('.date time').setAttribute('datetime', article.publishedAt);
        mainStory.querySelector('.reading-time').textContent = `${article.readingTime || 5} min de leitura`;
    },

    renderNewsGrid(articles, container) {
        if (!articles || articles.length === 0) {
            container.innerHTML = '<div class="loading">Nenhuma notícia disponível no momento.</div>';
            return;
        }

        container.innerHTML = articles.map(article => `
            <article class="news-card" itemscope itemtype="https://schema.org/NewsArticle">
                <div class="news-card-image">
                    <img src="${article.image || '/images/placeholder.jpg'}" alt="${article.title}" itemprop="image">
                    <span class="news-card-category">${article.category || 'Notícias'}</span>
                </div>
                <div class="news-card-content">
                    <meta itemprop="datePublished" content="${article.publishedAt}">
                    <h3 itemprop="headline">
                        <a href="${article.url}">${article.title}</a>
                    </h3>
                    <p class="news-card-excerpt" itemprop="description">${article.excerpt}</p>
                    <div class="news-card-meta">
                        <span class="date"><time datetime="${article.publishedAt}">${this.formatDate(article.publishedAt)}</time></span>
                        <span class="reading-time">${article.readingTime || 3} min</span>
                    </div>
                </div>
            </article>
        `).join('');
    },

    renderTrending(articles, container) {
        if (!articles || articles.length === 0) {
            container.innerHTML = '<div class="loading">Nenhuma notícia disponível.</div>';
            return;
        }

        container.innerHTML = articles.slice(0, 5).map((article, index) => `
            <div class="trending-item">
                <div class="trending-number">${index + 1}</div>
                <div class="trending-content">
                    <h4><a href="${article.url}">${article.title}</a></h4>
                    <div class="trending-meta">
                        <time datetime="${article.publishedAt}">${this.formatDate(article.publishedAt)}</time>
                    </div>
                </div>
            </div>
        `).join('');
    },

    showPlaceholderFeatured() {
        // Keep the placeholder content from HTML
        console.log('Using placeholder featured story');
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

    async handleSubmit(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                alert('Inscrição realizada com sucesso!');
                e.target.reset();
            } else {
                alert('Erro ao realizar inscrição. Tente novamente.');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            alert('Erro ao realizar inscrição. Tente novamente.');
        }
    }
};

// Smooth Scroll
const smoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
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
        // Implement your analytics tracking here
        // Example: Google Analytics, Mixpanel, etc.
        console.log('Page view tracked');
    },

    trackArticleClicks() {
        document.addEventListener('click', (e) => {
            const articleLink = e.target.closest('article a');
            if (articleLink) {
                const title = articleLink.textContent;
                console.log('Article clicked:', title);
                // Send to analytics platform
            }
        });
    }
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    languageSelector.init();
    newsLoader.loadAllNews();
    newsletter.init();
    smoothScroll.init();
    analytics.init();
});

// Refresh news every 5 minutes
setInterval(() => {
    newsLoader.loadAllNews();
}, 5 * 60 * 1000);
