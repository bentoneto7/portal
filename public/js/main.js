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
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error(`Expected JSON but got ${contentType}`);
                }
                this.articlesData = await response.json();
            } catch (error) {
                console.error('❌ Erro ao carregar artigos:', error);
                // Show error in UI instead of silent fail
                document.querySelectorAll('.loading').forEach(el => {
                    el.textContent = 'Erro ao carregar notícias. Tente recarregar a página.';
                });
                return;
            }
        }

        // Filter by language (pt-BR apenas)
        const articles = this.articlesData.filter(a => a.language === config.language);

        console.log(`⚽ ${articles.length} artigos carregados`);

        // Load featured story (first article)
        this.loadFeaturedStory(articles);

        // Load category news - TODAS AS CATEGORIAS
        this.loadCategoryNews('brasileirao', articles); // Brasileirão Série A
        this.loadCategoryNews('neymar', articles);      // Neymar Jr
        this.loadCategoryNews('copa', articles);        // Copa do Mundo 2026
        this.loadCategoryNews('mercado', articles);     // Mercado da Bola
        this.loadCategoryNews('opiniao', articles);     // Opinião
        this.loadCategoryNews('taticas', articles);     // Táticas e Dados

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
            'brasileirao': 'brasileirao',
            'neymar': 'neymar',
            'copa': 'copa',
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
            'champions': 'Champions League',
            'estaduais': 'Estaduais',
            'neymar': 'Neymar Jr',
            'messi': 'Lionel Messi',
            'cr7': 'Cristiano Ronaldo',
            'copa': 'Copa 2026',
            'brasileirao': 'Brasileirão',
            'mercado': 'Mercado da Bola',
            'opiniao': 'Opinião',
            'taticas': 'Táticas e Dados'
        };
        return labels[category] || category;
    },

    formatDate(dateString) {
        const date = new Date(dateString);

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return date.toLocaleDateString(config.language, options);
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

// Tabela de Classificação Série A (Mock Data)
const tabelaSerieA = {
    data: [
        { pos: 1, time: 'Palmeiras', pontos: 6, jogos: 2, zona: 'libertadores' },
        { pos: 2, time: 'Flamengo', pontos: 6, jogos: 2, zona: 'libertadores' },
        { pos: 3, time: 'Atlético-MG', pontos: 4, jogos: 2, zona: 'libertadores' },
        { pos: 4, time: 'São Paulo', pontos: 4, jogos: 2, zona: 'libertadores' },
        { pos: 5, time: 'Fluminense', pontos: 3, jogos: 2, zona: '' },
        { pos: 6, time: 'Botafogo', pontos: 3, jogos: 2, zona: '' },
        { pos: 7, time: 'Santos', pontos: 3, jogos: 2, zona: '' },
        { pos: 8, time: 'Corinthians', pontos: 1, jogos: 2, zona: '' },
        { pos: 9, time: 'Grêmio', pontos: 1, jogos: 2, zona: '' },
        { pos: 10, time: 'Bahia', pontos: 1, jogos: 2, zona: '' }
    ],

    render() {
        const container = document.getElementById('tabela-serie-a');
        if (!container) return;

        container.innerHTML = `
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
                <thead>
                    <tr style="background:#1a472a; color:white;">
                        <th style="padding:6px 4px; text-align:left;">#</th>
                        <th style="padding:6px 4px; text-align:left;">Time</th>
                        <th style="padding:6px 4px; text-align:center;">J</th>
                        <th style="padding:6px 4px; text-align:center; font-weight:800;">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.map(t => `
                        <tr style="border-bottom:1px solid #eee; ${t.zona === 'libertadores' ? 'border-left:3px solid #1a472a;' : ''}">
                            <td style="padding:5px 4px; color:${t.zona === 'libertadores' ? '#1a472a' : '#666'}; font-weight:${t.zona === 'libertadores' ? '700' : '400'};">${t.pos}</td>
                            <td style="padding:5px 4px; font-weight:600;">${t.time}</td>
                            <td style="padding:5px 4px; text-align:center; color:#666;">${t.jogos}</td>
                            <td style="padding:5px 4px; text-align:center; font-weight:800; color:#1a472a;">${t.pontos}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <small style="display:block; padding:6px 4px; color:#999; font-size:10px;">* 2 rodadas disputadas. Atualizado em 17/02/2026</small>
        `;
    }
};

// Enquete da Semana (Mock Data)
const enquete = {
    question: 'Neymar vai ser convocado para a Copa 2026?',
    options: [
        { id: 1, text: 'Sim, ele merece ir!', votes: 687 },
        { id: 2, text: 'Não, é risco demais', votes: 312 },
        { id: 3, text: 'Depende da saúde dele', votes: 523 },
        { id: 4, text: 'Ancelotti que decide', votes: 198 }
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

// Copa 2026 Countdown
const copaCountdown = {
    // Copa 2026 starts June 11, 2026
    targetDate: new Date('2026-06-11T18:00:00Z'),

    init() {
        this.update();
        setInterval(() => this.update(), 1000);
    },

    update() {
        const now = new Date();
        const diff = this.targetDate - now;

        if (diff <= 0) {
            document.getElementById('countdown-days').textContent = '0';
            document.getElementById('countdown-hours').textContent = '00';
            document.getElementById('countdown-minutes').textContent = '00';
            document.getElementById('countdown-seconds').textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('countdown-days').textContent = days;
        document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('countdown-minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('countdown-seconds').textContent = String(seconds).padStart(2, '0');
    }
};

// Matches Widget
const matchesWidget = {
    teamLogos: {
        'Real Madrid': '🇪🇸',
        'Man City': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        'Barcelona': '🇪🇸',
        'PSG': '🇫🇷',
        'Bayern': '🇩🇪',
        'Arsenal': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        'Inter Miami': '🇺🇸',
        'Al Nassr': '🇸🇦',
        'Santos': '🇧🇷',
        'Palmeiras': '🇧🇷',
        'Corinthians': '🇧🇷',
        'Flamengo': '🇧🇷',
        'Fluminense': '🇧🇷',
        'Brasil': '🇧🇷',
        'França': '🇫🇷',
        'Croácia': '🇭🇷'
    },

    matches: [
        { league: 'Champions League', home: 'Real Madrid', away: 'Man City', score: '2 x 1', status: 'finished', time: '11/03 - 17h00' },
        { league: 'Champions League', home: 'Barcelona', away: 'PSG', score: '3 x 2', status: 'finished', time: '12/03 - 17h00' },
        { league: 'Champions League', home: 'Bayern', away: 'Arsenal', score: '1 x 1', status: 'finished', time: '11/03 - 17h00' },
        { league: 'Paulistão', home: 'Palmeiras', away: 'Corinthians', score: '19/02', status: 'upcoming', time: 'Allianz Parque - 21h30' },
        { league: 'Carioca', home: 'Flamengo', away: 'Fluminense', score: '20/02', status: 'upcoming', time: 'Maracanã - 21h00' },
        { league: 'MLS', home: 'Inter Miami', away: 'LAFC', score: '01/03', status: 'upcoming', time: 'Miami - 20h00' },
        { league: 'Amistoso', home: 'Brasil', away: 'França', score: '26/03', status: 'upcoming', time: 'Boston - 16h00' },
    ],

    getShield(team) {
        const logo = this.teamLogos[team];
        if (!logo) return '⚽';

        // Se for URL (logo real), retorna img tag
        if (logo.startsWith('http')) {
            return `<img src="${logo}" alt="${team}" class="team-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" /><span style="display:none;">⚽</span>`;
        }

        // Se for emoji, retorna direto
        return logo;
    },

    render() {
        const track = document.getElementById('matches-track');
        if (!track) return;

        track.innerHTML = this.matches.map(m => `
            <div class="match-card">
                <div class="match-league">${m.league}</div>
                <div class="match-teams">
                    <div class="match-team">
                        <span class="match-team-shield">${this.getShield(m.home)}</span>
                        <span class="match-team-name">${m.home}</span>
                    </div>
                    <div class="match-score ${m.status === 'live' ? 'live' : ''}">${m.score}</div>
                    <div class="match-team">
                        <span class="match-team-shield">${this.getShield(m.away)}</span>
                        <span class="match-team-name">${m.away}</span>
                    </div>
                </div>
                <div class="match-time">${m.time}</div>
                <span class="match-status ${m.status}">${m.status === 'finished' ? 'Encerrado' : m.status === 'live' ? 'AO VIVO' : 'Em Breve'}</span>
            </div>
        `).join('');

        // Carousel controls
        const prev = document.querySelector('.carousel-prev');
        const next = document.querySelector('.carousel-next');
        if (prev && next) {
            prev.addEventListener('click', () => track.scrollBy({ left: -220, behavior: 'smooth' }));
            next.addEventListener('click', () => track.scrollBy({ left: 220, behavior: 'smooth' }));
        }
    }
};

// Mobile Menu
const mobileMenu = {
    init() {
        const btn = document.getElementById('mobile-menu-btn');
        const nav = document.getElementById('main-nav');
        if (btn && nav) {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                nav.classList.toggle('active');
            });
        }
    }
};

// News Ticker - duplicate content for seamless loop
const newsTicker = {
    init() {
        const content = document.getElementById('ticker-content');
        if (content) {
            content.innerHTML += content.innerHTML;
        }
    }
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Carregadores principais
    newsLoader.loadAllNews();
    newsletter.init();
    smoothScroll.init();
    analytics.init();
    imageLazyLoad.init();

    // Novos widgets
    tabelaSerieA.render();
    enquete.render();

    // Novas funcionalidades
    copaCountdown.init();
    matchesWidget.render();
    mobileMenu.init();
    newsTicker.init();
});

// Refresh news every 5 minutes (for dynamic content updates)
setInterval(() => {
    newsLoader.articlesData = null; // Force reload
    newsLoader.loadAllNews();
}, 5 * 60 * 1000);
