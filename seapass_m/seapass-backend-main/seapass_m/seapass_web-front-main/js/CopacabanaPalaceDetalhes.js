// CopacabanaPalaceDetalhes.js

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização da galeria de imagens
    initImageGallery();
    
    // Inicialização de interações
    initInteractions();
    
    // Verificação de disponibilidade de imagens
    checkImageAvailability();
});

// Função para inicializar a galeria de imagens
function initImageGallery() {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    // Verificar se a imagem principal existe
    if (!mainImage) {
        console.error('Imagem principal não encontrada');
        return;
    }
    
    // Adicionar eventos aos thumbnails
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const newImageSrc = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            changeImage(newImageSrc);
            
            // Atualizar estado ativo
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
        
        // Pré-carregar imagens dos thumbnails
        const img = thumbnail.querySelector('img');
        if (img && img.src) {
            preloadImage(img.src);
        }
    });
    
    // Pré-carregar imagem principal
    preloadImage(mainImage.src);
}

// Função para trocar a imagem principal
function changeImage(imageSrc) {
    const mainImage = document.getElementById('mainImage');
    
    if (!mainImage) return;
    
    // Adicionar efeito de transição
    mainImage.style.opacity = '0.7';
    mainImage.style.transform = 'scale(0.95)';
    
    // Criar uma nova imagem para pré-carregamento
    const newImage = new Image();
    newImage.onload = function() {
        mainImage.src = imageSrc;
        mainImage.alt = getImageAlt(imageSrc);
        
        // Restaurar opacidade e escala
        setTimeout(() => {
            mainImage.style.opacity = '1';
            mainImage.style.transform = 'scale(1)';
        }, 150);
    };
    
    newImage.onerror = function() {
        console.error('Erro ao carregar imagem:', imageSrc);
        showImageError(mainImage);
    };
    
    newImage.src = imageSrc;
}

// Função para obter o texto alternativo baseado no src da imagem
function getImageAlt(imageSrc) {
    const altMap = {
        '../images/copacabana-palace.jpg': 'Vista frontal do Copacabana Palace',
        '../images/quarto.jpg': 'Quarto de luxo do hotel',
        '../images/sala.jpg': 'Área comum do hotel',
        '../images/mark-champs-Id2IIl1jOB0-unsplash.jpg': 'Piscina do hotel',
        '../images/visualsofdana-T5pL6ciEn-I-unsplash.jpg': 'Restaurante do hotel'
    };
    
    return altMap[imageSrc] || 'Imagem do Copacabana Palace';
}

// Função para pré-carregar imagens
function preloadImage(src) {
    const img = new Image();
    img.src = src;
}


// Função para mostrar erro de carregamento de imagem
function showImageError(imageElement) {
    imageElement.style.backgroundColor = '#f3f4f6';
    imageElement.style.display = 'flex';
    imageElement.style.alignItems = 'center';
    imageElement.style.justifyContent = 'center';
    imageElement.style.color = '#6b7280';
    imageElement.style.fontSize = '1.1rem';
    imageElement.innerHTML = '🚫 Imagem não disponível';
}

// Função para verificar disponibilidade de imagens
function checkImageAvailability() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.onerror = function() {
            console.warn('Imagem não carregada:', this.src);
            showImageError(this);
        };
        
        // Verificar se a imagem já está carregada
        if (img.complete && img.naturalHeight === 0) {
            console.warn('Imagem quebrada:', img.src);
            showImageError(img);
        }
    });
}

// Função para inicializar outras interações
function initInteractions() {
    // Botão de favorito
    const favoriteBtn = document.querySelector('.btn-favorite');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavorite);
    }
    
    // Botão de compartilhar
    const shareBtn = document.querySelector('.btn-share');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareHotel);
    }
    
    // Adicionar loading lazy para imagens
    initLazyLoading();
}

// Função para alternar favorito
function toggleFavorite() {
    const favoriteBtn = document.querySelector('.btn-favorite');
    const isFavorited = favoriteBtn.classList.contains('favorited');
    
    if (isFavorited) {
        favoriteBtn.classList.remove('favorited');
        favoriteBtn.innerHTML = '<span>🤍</span> Favorito';
        showNotification('Removido dos favoritos', 'info');
    } else {
        favoriteBtn.classList.add('favorited');
        favoriteBtn.innerHTML = '<span>❤️</span> Favoritado';
        showNotification('Adicionado aos favoritos!', 'success');
    }
    
    // Adicionar animação
    favoriteBtn.style.transform = 'scale(1.1)';
    setTimeout(() => {
        favoriteBtn.style.transform = 'scale(1)';
    }, 300);
}

// Função para compartilhar hotel
function shareHotel() {
    const hotelName = 'Copacabana Palace';
    const hotelUrl = window.location.href;
    
    if (navigator.share) {
        // Web Share API (dispositivos móveis)
        navigator.share({
            title: hotelName,
            text: 'Confira este hotel incrível no SeaPass!',
            url: hotelUrl
        })
        .then(() => console.log('Compartilhado com sucesso'))
        .catch(error => console.log('Erro ao compartilhar:', error));
    } else if (navigator.clipboard) {
        // Fallback: copiar para área de transferência
        navigator.clipboard.writeText(hotelUrl)
            .then(() => {
                showNotification('Link copiado para a área de transferência!', 'success');
            })
            .catch(err => {
                console.error('Erro ao copiar:', err);
                showNotification('Erro ao copiar link', 'error');
            });
    } else {
        // Fallback mais antigo
        const tempInput = document.createElement('input');
        tempInput.value = hotelUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showNotification('Link copiado para a área de transferência!', 'success');
    }
}

// Função para inicializar lazy loading
function initLazyLoading() {
    const images = document.querySelectorAll('img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        if (img.classList.contains('lazy')) {
            imageObserver.observe(img);
        }
    });
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Adicionar estilos
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 350px;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    
    // Estilo do botão fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255,255,255,0.2)';
    });
    
    closeBtn.addEventListener('mouseleave', function() {
        this.style.background = 'none';
    });
    
    closeBtn.addEventListener('click', function() {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    document.body.appendChild(notification);
    
    // Auto-remover após 4 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Adicionar estilos CSS para animações
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
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .btn-favorite.favorited {
        background: #fef2f2;
        border-color: #ef4444;
        color: #ef4444;
    }
    
    img {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .thumbnail {
        position: relative;
    }
    
    .thumbnail::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 12px;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .thumbnail.active::after {
        opacity: 1;
    }
`;

document.head.appendChild(style);

// Função para debug - verificar se todas as imagens estão carregando
function debugImages() {
    console.log('=== DEBUG DE IMAGENS ===');
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
        console.log(`Imagem ${index + 1}:`, {
            src: img.src,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            alt: img.alt
        });
    });
}

// Executar debug no console (opcional)
// debugImages();