// Configurações padrão
const defaultSettings = {
    darkMode: false,
    fontSize: 'medium',
    animations: true,
    pushNotifications: true,
    reservationAlerts: true,
    specialOffers: false,
    emailNotifications: true,
    biometricLogin: false,
    twoFactorAuth: false,
    preferredLanguage: 'pt',
    defaultCurrency: 'BRL',
    roomPreferences: 'any'
};

// Carregar configurações salvas
function loadSettings() {
    const savedSettings = localStorage.getItem('seaPassSettings');
    if (savedSettings) {
        return JSON.parse(savedSettings);
    }
    return defaultSettings;
}

// Configuração inteligente do botão voltar
function setupBackButton() {
    const backButton = document.getElementById('backButton');
    
    if (!backButton) return;
    
    // Verifica múltiplas condições para decidir o comportamento
    const canGoBack = 
        window.history.length > 1 && // Tem histórico
        document.referrer && // Tem referência
        document.referrer !== window.location.href && // Não é a mesma página
        document.referrer.includes(window.location.hostname); // É do mesmo site
    
    if (canGoBack) {
        backButton.href = 'javascript:void(0);';
        backButton.onclick = function() {
            window.history.back();
        };
    }
    // Se não puder voltar, mantém o link para telainicial.html
}

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', setupBackButton);

// Salvar configurações
function saveSettings() {
    const settings = {
        darkMode: document.getElementById('darkModeToggle').checked,
        fontSize: document.getElementById('fontSize').value,
        animations: document.getElementById('animationsToggle').checked,
        pushNotifications: document.getElementById('pushNotifications').checked,
        reservationAlerts: document.getElementById('reservationAlerts').checked,
        specialOffers: document.getElementById('specialOffers').checked,
        emailNotifications: document.getElementById('emailNotifications').checked,
        biometricLogin: document.getElementById('biometricLogin').checked,
        twoFactorAuth: document.getElementById('twoFactorAuth').checked,
        preferredLanguage: document.getElementById('preferredLanguage').value,
        defaultCurrency: document.getElementById('defaultCurrency').value,
        roomPreferences: document.getElementById('roomPreferences').value
    };

    localStorage.setItem('seaPassSettings', JSON.stringify(settings));
    applySettings(settings);
    showToast('Configurações salvas com sucesso!', 'success');
}

// Aplicar configurações
function applySettings(settings) {
    // Aplicar modo escuro global usando a classe do tema
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }

    // Aplicar tamanho da fonte
    document.body.style.fontSize = getFontSize(settings.fontSize);

    // Aplicar animações
    if (!settings.animations) {
        document.body.classList.add('no-animations');
    } else {
        document.body.classList.remove('no-animations');
    }

    // Notificar o sistema de tema sobre a mudança
    if (window.seaPassDarkTheme) {
        window.seaPassDarkTheme.onDarkModeToggleChanged(settings.darkMode);
    }
}

// Converter tamanho da fonte
function getFontSize(size) {
    const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px',
        xlarge: '20px'
    };
    return sizes[size] || '16px';
}

// Restaurar configurações padrão
function resetToDefault() {
    if (confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão?')) {
        localStorage.removeItem('seaPassSettings');
        initializeSettings();
        applySettings(defaultSettings);
        showToast('Configurações restauradas para o padrão!', 'success');
    }
}

// Inicializar configurações na página
function initializeSettings() {
    const settings = loadSettings();

    // Preencher os controles
    document.getElementById('darkModeToggle').checked = settings.darkMode;
    document.getElementById('fontSize').value = settings.fontSize;
    document.getElementById('animationsToggle').checked = settings.animations;
    document.getElementById('pushNotifications').checked = settings.pushNotifications;
    document.getElementById('reservationAlerts').checked = settings.reservationAlerts;
    document.getElementById('specialOffers').checked = settings.specialOffers;
    document.getElementById('emailNotifications').checked = settings.emailNotifications;
    document.getElementById('biometricLogin').checked = settings.biometricLogin;
    document.getElementById('twoFactorAuth').checked = settings.twoFactorAuth;
    document.getElementById('preferredLanguage').value = settings.preferredLanguage;
    document.getElementById('defaultCurrency').value = settings.defaultCurrency;
    document.getElementById('roomPreferences').value = settings.roomPreferences;

    // Aplicar configurações
function applySettings(settings) {
    // Aplicar modo escuro global
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }

    // Aplicar tamanho da fonte
    document.body.style.fontSize = getFontSize(settings.fontSize);

    // Aplicar animações
    if (!settings.animations) {
        document.body.classList.add('no-animations');
    } else {
        document.body.classList.remove('no-animations');
    }

    // Atualizar o toggle global se existir
    if (window.seaPassTheme) {
        window.seaPassTheme.updateToggleButton();
    }
}
}

// Mostrar toast de notificação
function showToast(message, type = 'info') {
    // Remover toast existente
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Criar novo toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Estilos do toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(toast);

    // Auto-remover após 3 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('backButton');
    
    if (backButton) {
        // Substitui o comportamento padrão
        backButton.addEventListener('click', function(e) {
            // Verifica se pode voltar no histórico
            if (window.history.length > 1) {
                e.preventDefault(); // Impede o link padrão
                window.history.back();
            }
            // Se não puder voltar, o link normal para telainicial.html funciona
        });
    }
});

// Funções para ações dos botões
function showDataPreferences() {
    showToast('Redirecionando para preferências de dados...', 'info');
    // Aqui iria para a página de preferências de dados
}

function showPrivacyPolicy() {
    showToast('Abrindo política de privacidade...', 'info');
    // Aqui abriria a política de privacidade
}

function contactSupport() {
    showToast('Abrindo chat de suporte...', 'info');
    // Aqui abriria o chat de suporte
}

function showFAQ() {
    showToast('Abrindo perguntas frequentes...', 'info');
    // Aqui abriria a página de FAQ
}

function showAbout() {
    const aboutInfo = `
        SeaPass v2.1.0
        Desenvolvido com ❤️
        © 2025 SeaPass Technologies
    `;
    alert(aboutInfo);
}

function clearCache() {
    if (confirm('Tem certeza que deseja limpar o cache? Isso não afetará suas configurações.')) {
        showToast('Cache limpo com sucesso!', 'success');
    }
}

function exportData() {
    showToast('Preparando exportação de dados...', 'info');
    // Aqui iniciaria o processo de exportação
}

function showDeleteAccount() {
    if (confirm('⚠️ ATENÇÃO: Esta ação é irreversível. Tem certeza que deseja excluir sua conta?')) {
        if (confirm('TODOS os seus dados serão permanentemente removidos. Confirmar exclusão?')) {
            showToast('Solicitação de exclusão de conta enviada.', 'info');
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();

    // Identificar apenas os elementos de configuração reais (não inclui o menu)
    const configElements = [
        'darkModeToggle', 'fontSize', 'animationsToggle', 'pushNotifications',
        'reservationAlerts', 'specialOffers', 'emailNotifications', 
        'biometricLogin', 'twoFactorAuth', 'preferredLanguage', 
        'defaultCurrency', 'roomPreferences'
    ];

    configElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', function() {
                // Aplicação instantânea para modo escuro
                if (id === 'darkModeToggle') {
                    const settings = loadSettings();
                    settings.darkMode = this.checked;
                    applySettings(settings);
                }
                saveSettings();
            });
        }
    });

    // Isolar completamente o menu hamburguer
    const menuCheckbox = document.querySelector('.menu-toggle');
    if (menuCheckbox) {
        // Remover qualquer listener existente que possa estar causando o problema
        const newMenuCheckbox = menuCheckbox.cloneNode(true);
        menuCheckbox.parentNode.replaceChild(newMenuCheckbox, menuCheckbox);
        
        // Adicionar apenas o comportamento do menu
        newMenuCheckbox.addEventListener('change', function() {
            // Apenas o comportamento normal do menu, sem salvar configurações
            const menu = document.querySelector('.menu');
            if (this.checked) {
                menu.style.opacity = '1';
                menu.style.visibility = 'visible';
                menu.style.transform = 'translateY(12px)';
            } else {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(-10px)';
            }
        });
    }
});

// CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .no-animations * {
        animation: none !important;
        transition: none !important;
    }

    .toast-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toast-close:hover {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
    }
`;
document.head.appendChild(style);