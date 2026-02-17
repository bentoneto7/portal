/**
 * ADVANCED SEARCH
 *
 * Sistema de busca instantânea com:
 * - Busca por título, conteúdo, tags
 * - Filtros por categoria, time, data
 * - Resultados instantâneos (debounced)
 * - Highlighting de matches
 * - Navegação por teclado (a11y)
 */

class AdvancedSearch {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.searchInput = null;
        this.resultsContainer = null;
        this.activeIndex = -1;
        this.debounceTimer = null;
    }

    /**
     * Inicializa busca
     */
    async init() {
        // Cria UI de busca
        this.createSearchUI();

        // Carrega artigos
        await this.loadArticles();

        // Event listeners
        this.attachEventListeners();

        console.log('🔍 Advanced Search initialized');
    }

    /**
     * Cria interface de busca
     */
    createSearchUI() {
        // Container principal
        const searchContainer = document.createElement('div');
        searchContainer.id = 'advanced-search';
        searchContainer.className = 'advanced-search';
        searchContainer.innerHTML = `
            <div class="search-overlay"></div>
            <div class="search-modal">
                <div class="search-header">
                    <input
                        type="search"
                        id="search-input"
                        class="search-input"
                        placeholder="Buscar notícias, times, jogadores..."
                        aria-label="Buscar artigos"
                        autocomplete="off"
                    >
                    <button class="search-close" aria-label="Fechar busca">✕</button>
                </div>

                <div class="search-filters">
                    <button class="filter-btn active" data-filter="all">Todos</button>
                    <button class="filter-btn" data-filter="brasileirao">Brasileirão</button>
                    <button class="filter-btn" data-filter="mercado">Mercado</button>
                    <button class="filter-btn" data-filter="selecao">Seleção</button>
                    <button class="filter-btn" data-filter="internacional">Internacional</button>
                </div>

                <div id="search-results" class="search-results">
                    <div class="search-placeholder">
                        <p>Digite para buscar...</p>
                    </div>
                </div>

                <div class="search-footer">
                    <span class="search-shortcuts">
                        <kbd>↑</kbd><kbd>↓</kbd> Navegar
                        <kbd>Enter</kbd> Selecionar
                        <kbd>Esc</kbd> Fechar
                    </span>
                </div>
            </div>
        `;

        document.body.appendChild(searchContainer);

        // Referências
        this.searchInput = document.getElementById('search-input');
        this.resultsContainer = document.getElementById('search-results');
        this.overlay = searchContainer.querySelector('.search-overlay');

        // Atalho de teclado (Ctrl/Cmd + K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }
        });

        // Botão de busca no header (se existir)
        const searchButton = document.querySelector('[data-search-toggle]');
        if (searchButton) {
            searchButton.addEventListener('click', () => this.open());
        }
    }

    /**
     * Carrega artigos
     */
    async loadArticles() {
        try {
            const response = await fetch('/data/articles-index.json');
            this.articles = await response.json();
            console.log(`📚 ${this.articles.length} artigos carregados`);
        } catch (error) {
            console.error('Erro ao carregar artigos:', error);
            this.articles = [];
        }
    }

    /**
     * Anexa event listeners
     */
    attachEventListeners() {
        // Input de busca
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.search(e.target.value);
            }, 300);
        });

        // Navegação por teclado
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });

        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Fechar busca
        document.querySelector('.search-close').addEventListener('click', () => {
            this.close();
        });

        this.overlay.addEventListener('click', () => {
            this.close();
        });

        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    /**
     * Abre busca
     */
    open() {
        const container = document.getElementById('advanced-search');
        container.classList.add('active');
        this.searchInput.focus();

        // Tracking
        if (typeof analytics !== 'undefined') {
            analytics.sendEvent('search_opened');
        }
    }

    /**
     * Fecha busca
     */
    close() {
        const container = document.getElementById('advanced-search');
        container.classList.remove('active');
        this.searchInput.value = '';
        this.resultsContainer.innerHTML = '<div class="search-placeholder"><p>Digite para buscar...</p></div>';
        this.activeIndex = -1;
    }

    /**
     * Verifica se está aberto
     */
    isOpen() {
        return document.getElementById('advanced-search').classList.contains('active');
    }

    /**
     * Define filtro ativo
     */
    setFilter(filter) {
        // Atualiza UI
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Refiltra resultados
        const query = this.searchInput.value;
        if (query) {
            this.search(query, filter);
        }
    }

    /**
     * Busca artigos
     */
    search(query, filter = 'all') {
        if (!query || query.length < 2) {
            this.resultsContainer.innerHTML = '<div class="search-placeholder"><p>Digite pelo menos 2 caracteres...</p></div>';
            return;
        }

        const normalizedQuery = this.normalizeText(query);
        const words = normalizedQuery.split(/\s+/);

        // Filtra e pontua resultados
        this.filteredArticles = this.articles
            .map(article => ({
                ...article,
                score: this.calculateRelevance(article, words, normalizedQuery)
            }))
            .filter(article => {
                // Filtra por relevância
                if (article.score === 0) return false;

                // Filtra por categoria
                if (filter !== 'all') {
                    const category = (article.section || '').toLowerCase();
                    return category.includes(filter);
                }

                return true;
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        this.renderResults(query);

        // Tracking
        if (typeof analytics !== 'undefined') {
            analytics.sendEvent('search', {
                query,
                results_count: this.filteredArticles.length
            });
        }
    }

    /**
     * Calcula relevância do artigo
     */
    calculateRelevance(article, words, query) {
        let score = 0;

        const title = this.normalizeText(article.title);
        const excerpt = this.normalizeText(article.excerpt || article.subtitle || '');
        const section = this.normalizeText(article.section || '');

        // Match exato no título (peso 10)
        if (title.includes(query)) {
            score += 10;
        }

        // Palavras no título (peso 5 cada)
        words.forEach(word => {
            if (title.includes(word)) {
                score += 5;
            }
        });

        // Match exato no resumo (peso 3)
        if (excerpt.includes(query)) {
            score += 3;
        }

        // Palavras no resumo (peso 2 cada)
        words.forEach(word => {
            if (excerpt.includes(word)) {
                score += 2;
            }
        });

        // Match na categoria (peso 2)
        if (section.includes(query)) {
            score += 2;
        }

        // Boost para artigos recentes
        const daysOld = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60 * 24);
        if (daysOld < 7) {
            score += 2;
        }

        return score;
    }

    /**
     * Renderiza resultados
     */
    renderResults(query) {
        if (this.filteredArticles.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <p>Nenhum resultado para "${query}"</p>
                    <small>Tente usar termos diferentes</small>
                </div>
            `;
            return;
        }

        const html = this.filteredArticles.map((article, index) => `
            <a
                href="/artigo/${article.id}.html"
                class="search-result-item ${index === this.activeIndex ? 'active' : ''}"
                data-index="${index}"
            >
                <div class="search-result-image">
                    <img src="${article.image}" alt="${article.title}" loading="lazy">
                </div>
                <div class="search-result-content">
                    <h3>${this.highlightMatches(article.title, query)}</h3>
                    <p>${this.highlightMatches(article.excerpt || article.subtitle || '', query)}</p>
                    <div class="search-result-meta">
                        <span class="category">${article.section || 'Notícias'}</span>
                        <span class="date">${this.formatDate(article.publishedAt)}</span>
                    </div>
                </div>
            </a>
        `).join('');

        this.resultsContainer.innerHTML = html;

        // Event listeners nos resultados
        this.resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.activeIndex = parseInt(item.dataset.index);
                this.updateActiveResult();
            });
        });
    }

    /**
     * Destaca matches
     */
    highlightMatches(text, query) {
        if (!text) return '';

        const normalizedText = this.normalizeText(text);
        const normalizedQuery = this.normalizeText(query);
        const words = normalizedQuery.split(/\s+/);

        let highlighted = text;

        words.forEach(word => {
            if (word.length < 2) return;

            const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });

        return highlighted;
    }

    /**
     * Navegação por teclado
     */
    handleKeyNavigation(e) {
        if (this.filteredArticles.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.activeIndex = Math.min(this.activeIndex + 1, this.filteredArticles.length - 1);
                this.updateActiveResult();
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.activeIndex = Math.max(this.activeIndex - 1, 0);
                this.updateActiveResult();
                break;

            case 'Enter':
                e.preventDefault();
                if (this.activeIndex >= 0) {
                    const article = this.filteredArticles[this.activeIndex];
                    window.location.href = `/artigo/${article.id}.html`;
                }
                break;
        }
    }

    /**
     * Atualiza resultado ativo
     */
    updateActiveResult() {
        this.resultsContainer.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.classList.toggle('active', index === this.activeIndex);
        });

        // Scroll para resultado ativo
        const activeItem = this.resultsContainer.querySelector('.search-result-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    /**
     * Normaliza texto
     */
    normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Escapa regex
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Formata data
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;

        return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    }
}

// Instância global
const search = new AdvancedSearch();

// Inicializa quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => search.init());
} else {
    search.init();
}

// Expõe globalmente
window.search = search;
