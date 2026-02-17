/**
 * ADVANCED ANALYTICS
 *
 * Google Analytics 4 + métricas customizadas
 * Tracking de scroll, tempo de leitura, engajamento
 */

class AdvancedAnalytics {
    constructor() {
        this.startTime = Date.now();
        this.maxScroll = 0;
        this.milestones = {
            25: false,
            50: false,
            75: false,
            100: false
        };
        this.engaged = false;
        this.readingTime = 0;
    }

    /**
     * Inicializa analytics
     */
    init() {
        this.trackPageView();
        this.trackScrollDepth();
        this.trackTimeOnPage();
        this.trackReadingTime();
        this.trackEngagement();
        this.trackOutboundLinks();
        this.trackArticleInteractions();

        console.log('📊 Advanced Analytics initialized');
    }

    /**
     * Track Page View
     */
    trackPageView() {
        if (typeof gtag === 'undefined') {
            return;
        }

        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }

    /**
     * Track Scroll Depth
     */
    trackScrollDepth() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.calculateScrollDepth();
                    ticking = false;
                });

                ticking = true;
            }
        });
    }

    /**
     * Calcula profundidade do scroll
     */
    calculateScrollDepth() {
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        const scrollPercent = Math.round((scrollTop + windowHeight) / docHeight * 100);

        this.maxScroll = Math.max(this.maxScroll, scrollPercent);

        // Envia eventos em milestones
        [25, 50, 75, 100].forEach(milestone => {
            if (scrollPercent >= milestone && !this.milestones[milestone]) {
                this.milestones[milestone] = true;
                this.sendEvent('scroll_depth', {
                    percent: milestone,
                    article_id: this.getArticleId()
                });
            }
        });
    }

    /**
     * Track Time on Page
     */
    trackTimeOnPage() {
        // Envia a cada 30 segundos
        setInterval(() => {
            const timeSpent = Math.round((Date.now() - this.startTime) / 1000);

            this.sendEvent('time_on_page', {
                seconds: timeSpent,
                article_id: this.getArticleId()
            });

            // Marca como engaged após 30s
            if (timeSpent >= 30 && !this.engaged) {
                this.engaged = true;
                this.sendEvent('user_engaged', {
                    article_id: this.getArticleId()
                });
            }
        }, 30000);

        // Envia ao sair da página
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - this.startTime) / 1000);

            this.sendEvent('page_exit', {
                time_spent: timeSpent,
                max_scroll: this.maxScroll,
                article_id: this.getArticleId()
            });
        });
    }

    /**
     * Track Reading Time (estimado)
     */
    trackReadingTime() {
        const articleContent = document.querySelector('.article-content');
        if (!articleContent) return;

        const text = articleContent.innerText;
        const words = text.split(/\s+/).length;
        const estimatedMinutes = Math.ceil(words / 200); // 200 palavras/min

        this.readingTime = estimatedMinutes;

        this.sendEvent('article_metadata', {
            word_count: words,
            estimated_reading_time: estimatedMinutes,
            article_id: this.getArticleId()
        });

        // Detecta se leu até o final
        this.detectReadCompletion(estimatedMinutes);
    }

    /**
     * Detecta leitura completa
     */
    detectReadCompletion(estimatedMinutes) {
        const timeThreshold = estimatedMinutes * 60 * 1000 * 0.7; // 70% do tempo estimado

        setTimeout(() => {
            if (this.maxScroll >= 75) {
                this.sendEvent('article_read_completed', {
                    article_id: this.getArticleId(),
                    time_spent: Math.round((Date.now() - this.startTime) / 1000)
                });
            }
        }, timeThreshold);
    }

    /**
     * Track Engagement
     */
    trackEngagement() {
        // Cliques em artigos relacionados
        document.addEventListener('click', (e) => {
            const relatedLink = e.target.closest('.related-article-link');
            if (relatedLink) {
                this.sendEvent('related_article_click', {
                    from_article: this.getArticleId(),
                    to_article: this.extractArticleId(relatedLink.href),
                    position: relatedLink.dataset.position
                });
            }

            // Compartilhamento
            const shareButton = e.target.closest('[data-share]');
            if (shareButton) {
                this.sendEvent('share', {
                    method: shareButton.dataset.share,
                    article_id: this.getArticleId()
                });
            }

            // Comentários
            const commentButton = e.target.closest('[data-comment]');
            if (commentButton) {
                this.sendEvent('comment_interaction', {
                    action: commentButton.dataset.comment,
                    article_id: this.getArticleId()
                });
            }
        });

        // Copy texto
        document.addEventListener('copy', () => {
            const selection = window.getSelection().toString();
            if (selection.length > 20) {
                this.sendEvent('text_copied', {
                    article_id: this.getArticleId(),
                    text_length: selection.length
                });
            }
        });
    }

    /**
     * Track Outbound Links
     */
    trackOutboundLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');

            if (link && link.hostname !== window.location.hostname) {
                this.sendEvent('outbound_link', {
                    url: link.href,
                    article_id: this.getArticleId()
                });
            }
        });
    }

    /**
     * Track Article Interactions
     */
    trackArticleInteractions() {
        // Hover em imagens
        document.querySelectorAll('.article-content img').forEach(img => {
            let hoverStart = null;

            img.addEventListener('mouseenter', () => {
                hoverStart = Date.now();
            });

            img.addEventListener('mouseleave', () => {
                if (hoverStart) {
                    const hoverTime = Date.now() - hoverStart;

                    if (hoverTime > 2000) {
                        this.sendEvent('image_viewed', {
                            article_id: this.getArticleId(),
                            hover_time: Math.round(hoverTime / 1000)
                        });
                    }
                }
            });
        });

        // Cliques em vídeos
        document.querySelectorAll('video').forEach(video => {
            video.addEventListener('play', () => {
                this.sendEvent('video_play', {
                    article_id: this.getArticleId()
                });
            });
        });
    }

    /**
     * Envia evento para GA4
     */
    sendEvent(eventName, params = {}) {
        if (typeof gtag === 'undefined') {
            console.log(`📊 Event: ${eventName}`, params);
            return;
        }

        gtag('event', eventName, {
            ...params,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Obtém ID do artigo
     */
    getArticleId() {
        const match = window.location.pathname.match(/\/artigo\/([^\/]+)/);
        return match ? match[1] : 'unknown';
    }

    /**
     * Extrai ID de URL
     */
    extractArticleId(url) {
        const match = url.match(/\/artigo\/([^\/]+)/);
        return match ? match[1] : 'unknown';
    }

    /**
     * Track erro JavaScript
     */
    trackError(error, info = {}) {
        this.sendEvent('javascript_error', {
            error_message: error.message || String(error),
            error_stack: error.stack,
            ...info
        });
    }

    /**
     * Track conversão
     */
    trackConversion(type, value = 0) {
        this.sendEvent('conversion', {
            conversion_type: type,
            conversion_value: value,
            article_id: this.getArticleId()
        });
    }
}

// Instância global
const analytics = new AdvancedAnalytics();

// Inicializa quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => analytics.init());
} else {
    analytics.init();
}

// Track erros globais
window.addEventListener('error', (event) => {
    analytics.trackError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(event.reason);
});
