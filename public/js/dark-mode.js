/**
 * DARK MODE MANAGER
 *
 * Gerencia tema escuro/claro com:
 * - Persistência em localStorage
 * - Detecção de preferência do sistema
 * - Toggle suave
 * - Acessibilidade (ARIA)
 */

class DarkModeManager {
    constructor() {
        this.theme = null;
        this.button = null;
    }

    /**
     * Inicializa dark mode
     */
    init() {
        // Cria botão de toggle
        this.createToggleButton();

        // Carrega preferência salva ou do sistema
        this.loadTheme();

        // Aplica tema
        this.applyTheme();

        // Escuta mudanças de preferência do sistema
        this.watchSystemPreference();

        console.log('🌙 Dark Mode initialized');
    }

    /**
     * Cria botão de toggle
     */
    createToggleButton() {
        this.button = document.createElement('button');
        this.button.className = 'dark-mode-toggle';
        this.button.setAttribute('aria-label', 'Alternar tema escuro/claro');
        this.button.setAttribute('title', 'Alternar tema');

        // Adiciona ao body
        document.body.appendChild(this.button);

        // Event listener
        this.button.addEventListener('click', () => this.toggle());

        // Atualiza ícone
        this.updateButtonIcon();
    }

    /**
     * Carrega tema salvo ou preferência do sistema
     */
    loadTheme() {
        // 1. Verifica localStorage
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
            this.theme = savedTheme;
            return;
        }

        // 2. Verifica preferência do sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.theme = 'dark';
        } else {
            this.theme = 'light';
        }
    }

    /**
     * Aplica tema
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);

        // Atualiza meta tag theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                'content',
                this.theme === 'dark' ? '#0a0a0a' : '#1a472a'
            );
        }

        // Atualiza botão
        this.updateButtonIcon();

        // Tracking
        this.trackThemeChange();
    }

    /**
     * Alterna tema
     */
    toggle() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';

        // Salva preferência
        localStorage.setItem('theme', this.theme);

        // Aplica
        this.applyTheme();

        // Animação do botão
        this.button.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.button.style.transform = '';
        }, 300);

        // Feedback sonoro (opcional)
        this.playToggleSound();
    }

    /**
     * Atualiza ícone do botão
     */
    updateButtonIcon() {
        if (!this.button) return;

        // Ícones: 🌙 (lua) para modo claro, ☀️ (sol) para modo escuro
        this.button.textContent = this.theme === 'dark' ? '☀️' : '🌙';
        this.button.setAttribute(
            'aria-label',
            this.theme === 'dark'
                ? 'Mudar para tema claro'
                : 'Mudar para tema escuro'
        );
    }

    /**
     * Escuta mudanças de preferência do sistema
     */
    watchSystemPreference() {
        if (!window.matchMedia) return;

        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

        darkModeQuery.addEventListener('change', (e) => {
            // Só aplica se usuário não tiver preferência salva
            if (!localStorage.getItem('theme')) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme();
            }
        });
    }

    /**
     * Tracking de mudança de tema
     */
    trackThemeChange() {
        if (typeof analytics !== 'undefined') {
            analytics.sendEvent('theme_changed', {
                theme: this.theme,
                method: localStorage.getItem('theme') ? 'manual' : 'auto'
            });
        }
    }

    /**
     * Feedback sonoro (opcional)
     */
    playToggleSound() {
        try {
            // AudioContext para um clique suave
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = this.theme === 'dark' ? 440 : 660;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + 0.1
            );

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);

        } catch (error) {
            // Falha silenciosa
        }
    }

    /**
     * Obtém tema atual
     */
    getTheme() {
        return this.theme;
    }

    /**
     * Define tema
     */
    setTheme(theme) {
        if (theme !== 'dark' && theme !== 'light') {
            return;
        }

        this.theme = theme;
        localStorage.setItem('theme', theme);
        this.applyTheme();
    }

    /**
     * Reseta para preferência do sistema
     */
    resetToSystem() {
        localStorage.removeItem('theme');
        this.loadTheme();
        this.applyTheme();
    }
}

// Instância global
const darkMode = new DarkModeManager();

// Inicializa IMEDIATAMENTE para evitar flash
// (antes do DOMContentLoaded para aplicar o mais rápido possível)
darkMode.loadTheme();
darkMode.applyTheme();

// Cria botão quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => darkMode.init());
} else {
    darkMode.init();
}

// Expõe globalmente para uso em console
window.darkMode = darkMode;
