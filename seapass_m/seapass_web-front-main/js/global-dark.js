// ===== MODO ESCURO SEAPASS - INTEGRADO COM CONFIGURAÇÕES =====
class SeaPassDarkTheme {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.applyThemeFromSettings();
        this.isInitialized = true;
        console.log('🎨 SeaPass Dark Theme - Integrado com configurações');
    }

    // Carrega configurações (compatível com seu código de configurações)
    loadSettings() {
        const savedSettings = localStorage.getItem('seaPassSettings');
        if (savedSettings) {
            return JSON.parse(savedSettings);
        }
        return { darkMode: false };
    }

    applyThemeFromSettings() {
        const settings = this.loadSettings();
        
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
            this.injectTransitionStyles();
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    injectTransitionStyles() {
        if (document.querySelector('#dark-mode-transitions')) return;
        
        const style = document.createElement('style');
        style.id = 'dark-mode-transitions';
        style.textContent = `
            body.dark-mode * {
                transition: background-color 0.3s ease, 
                          color 0.3s ease, 
                          border-color 0.3s ease,
                          box-shadow 0.3s ease,
                          transform 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Método para ser chamado quando o toggle mudar nas configurações
    onDarkModeToggleChanged(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            this.injectTransitionStyles();
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        this.showThemeToast(isDark);
    }

    showThemeToast(isDark) {
        const existing = document.querySelector('.theme-toast');
        if (existing) existing.remove();

        const message = isDark ? '🌙 Modo Escuro Ativado' : '☀️ Modo Claro Ativado';
        const toast = document.createElement('div');
        toast.className = 'theme-toast';
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) reverse';
                setTimeout(() => toast.remove(), 400);
            }
        }, 2500);
    }

    // Método público para forçar atualização
    forceUpdate() {
        this.applyThemeFromSettings();
    }
}

// Inicialização simplificada
function initializeSeaPassDarkTheme() {
    if (typeof window.seaPassDarkTheme === 'undefined') {
        window.seaPassDarkTheme = new SeaPassDarkTheme();
    }
}


// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', initializeSeaPassDarkTheme);

// Fallback
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeSeaPassDarkTheme, 10);
}