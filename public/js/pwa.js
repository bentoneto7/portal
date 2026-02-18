/**
 * PWA MANAGER
 *
 * Gerencia Service Worker, install prompt e notificações
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.swRegistration = null;
    }

    /**
     * Inicializa PWA
     */
    async init() {
        // Registra Service Worker
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }

        // Captura install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPromotion();
        });

        // Detecta quando foi instalado
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA instalado com sucesso!');
            this.hideInstallPromotion();
            this.trackEvent('pwa_installed');
        });

        // Detecta modo standalone
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('📱 Rodando como PWA');
            document.body.classList.add('pwa-mode');
        }
    }

    /**
     * Registra Service Worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            this.swRegistration = registration;

            console.log('✅ Service Worker registrado');

            // Verifica atualizações
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });

            // Pede permissão para notificações
            this.requestNotificationPermission();

        } catch (error) {
            console.error('❌ Erro ao registrar Service Worker:', error);
        }
    }

    /**
     * Mostra promoção de instalação
     */
    showInstallPromotion() {
        // Verifica se já foi instalado
        if (localStorage.getItem('pwa-install-dismissed')) {
            return;
        }

        // Cria banner de instalação
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-install-content">
                <div class="pwa-install-icon">⚽</div>
                <div class="pwa-install-text">
                    <strong>Instalar Bola na Rede</strong>
                    <p>Acesse rapidamente e receba notificações</p>
                </div>
                <div class="pwa-install-actions">
                    <button class="pwa-install-button" onclick="pwaManager.install()">
                        Instalar
                    </button>
                    <button class="pwa-dismiss-button" onclick="pwaManager.dismissInstall()">
                        ✕
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Anima entrada
        setTimeout(() => banner.classList.add('show'), 100);
    }

    /**
     * Instala PWA
     */
    async install() {
        if (!this.deferredPrompt) {
            return;
        }

        // Mostra prompt nativo
        this.deferredPrompt.prompt();

        // Aguarda escolha do usuário
        const { outcome } = await this.deferredPrompt.userChoice;

        console.log(`PWA install outcome: ${outcome}`);
        this.trackEvent('pwa_install_prompt', { outcome });

        this.deferredPrompt = null;
        this.hideInstallPromotion();
    }

    /**
     * Dispensa instalação
     */
    dismissInstall() {
        localStorage.setItem('pwa-install-dismissed', 'true');
        this.hideInstallPromotion();
        this.trackEvent('pwa_install_dismissed');
    }

    /**
     * Esconde promoção de instalação
     */
    hideInstallPromotion() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    }

    /**
     * Mostra notificação de atualização
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="pwa-update-content">
                <span>🎉 Nova versão disponível!</span>
                <button onclick="pwaManager.updateApp()">Atualizar</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
    }

    /**
     * Atualiza app
     */
    updateApp() {
        if (!this.swRegistration || !this.swRegistration.waiting) {
            return;
        }

        this.swRegistration.waiting.postMessage({ action: 'skipWaiting' });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }

    /**
     * Pede permissão para notificações
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            return;
        }

        if (Notification.permission === 'granted') {
            await this.subscribeToPush();
            return;
        }

        if (Notification.permission !== 'denied') {
            // Aguarda interação do usuário antes de pedir
            setTimeout(async () => {
                const permission = await Notification.requestPermission();

                if (permission === 'granted') {
                    console.log('✅ Permissão de notificações concedida');
                    await this.subscribeToPush();
                    this.trackEvent('notifications_enabled');
                }
            }, 30000); // 30 segundos após carregar
        }
    }

    /**
     * Subscreve para push notifications
     */
    async subscribeToPush() {
        if (!this.swRegistration) {
            return;
        }

        try {
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    'YOUR_PUBLIC_VAPID_KEY' // Substituir por chave real
                )
            });

            console.log('✅ Subscrito para push notifications');

            // Envia subscription para servidor
            await fetch('/api/push-subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

        } catch (error) {
            console.error('❌ Erro ao subscrever push:', error);
        }
    }

    /**
     * Converte VAPID key
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    /**
     * Tracking de eventos
     */
    trackEvent(eventName, params = {}) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }

        // Console para debug
        console.log(`📊 Event: ${eventName}`, params);
    }

    /**
     * Mostra notificação local
     */
    async showNotification(title, options = {}) {
        if (!this.swRegistration || Notification.permission !== 'granted') {
            return;
        }

        const defaultOptions = {
            icon: '/images/icon-192.png',
            badge: '/images/badge-72.png',
            vibrate: [200, 100, 200],
            ...options
        };

        await this.swRegistration.showNotification(title, defaultOptions);
    }
}

// Instância global
const pwaManager = new PWAManager();

// Inicializa quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => pwaManager.init());
} else {
    pwaManager.init();
}
