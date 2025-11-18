// Função para inicializar a página de reserva
document.addEventListener('DOMContentLoaded', function() {
    initializeReservationPage();
    setupEventListeners();
    updateReservationSummary();
});

// Inicialização da página
function initializeReservationPage() {
    // Configurar datas mínimas
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkin').min = today;
    
    // Configurar checkout para pelo menos 1 dia após checkin
    document.getElementById('checkin').addEventListener('change', function() {
        const checkinDate = new Date(this.value);
        checkinDate.setDate(checkinDate.getDate() + 1);
        const minCheckout = checkinDate.toISOString().split('T')[0];
        document.getElementById('checkout').min = minCheckout;
        
        // Se checkout for anterior à nova data mínima, atualizar
        const checkoutDate = new Date(document.getElementById('checkout').value);
        if (checkoutDate < checkinDate) {
            document.getElementById('checkout').value = minCheckout;
        }
        
        updateReservationSummary();
    });
    
    document.getElementById('checkout').addEventListener('change', updateReservationSummary);
    
    // Configurar seleção de quarto
    const roomOptions = document.querySelectorAll('.room-option');
    roomOptions.forEach(option => {
        option.addEventListener('click', function() {
            roomOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            updateReservationSummary();
        });
    });
    
    // Configurar serviços adicionais
    const serviceOptions = document.querySelectorAll('.service-option input[type="checkbox"]');
    serviceOptions.forEach(option => {
        option.addEventListener('change', updateReservationSummary);
    });
    
    // Configurar número de hóspedes
    document.getElementById('adults').addEventListener('change', updateReservationSummary);
    document.getElementById('children').addEventListener('change', updateReservationSummary);
    
    // Configurar máscara para CPF
    document.getElementById('cpf').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        }
    });
    
    // Configurar máscara para telefone
    document.getElementById('phone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        }
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Validação do formulário
    document.getElementById('reservationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            processReservation();
        }
    });
}



// Atualizar resumo da reserva
function updateReservationSummary() {
    const selectedRoom = document.querySelector('.room-option.selected');
    const roomPrice = parseFloat(selectedRoom.querySelector('.price').textContent.replace('R$ ', '').replace('.', ''));
    
    const checkin = new Date(document.getElementById('checkin').value);
    const checkout = new Date(document.getElementById('checkout').value);
    
    let nights = 0;
    if (checkin && checkout && checkout > checkin) {
        nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    }
    
    const roomTotal = roomPrice * nights;
    const taxRate = 0.1; // 10% de taxas e impostos
    const taxes = roomTotal * taxRate;
    
    // Calcular serviços adicionais
    let servicesTotal = 0;
    const servicePrices = {
        breakfast: 85 * nights,
        airport: 150,
        spa: 350,
        late: 120
    };
    
    document.querySelectorAll('.service-option input[type="checkbox"]:checked').forEach(service => {
        servicesTotal += servicePrices[service.id] || 0;
    });
    
    const total = roomTotal + taxes + servicesTotal;
    
    // Atualizar interface
    updateSummaryDisplay(roomPrice, nights, roomTotal, taxes, servicesTotal, total);
}

// Atualizar exibição do resumo
function updateSummaryDisplay(roomPrice, nights, roomTotal, taxes, servicesTotal, total) {
    const summaryDetails = document.querySelector('.summary-details');
    
    summaryDetails.innerHTML = `
        <div class="summary-item">
            <span>${document.querySelector('.room-option.selected h4').textContent}</span>
            <span>R$ ${roomPrice.toFixed(2)}/noite</span>
        </div>
        <div class="summary-item">
            <span>${nights} noite${nights !== 1 ? 's' : ''}</span>
            <span>R$ ${roomTotal.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span>Taxas e impostos</span>
            <span>R$ ${taxes.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span>Serviços adicionais</span>
            <span>R$ ${servicesTotal.toFixed(2)}</span>
        </div>
    `;
    
    document.querySelector('.total-item strong:last-child').textContent = `R$ ${total.toFixed(2)}`;
}

// Validar formulário
function validateForm() {
    const requiredFields = document.querySelectorAll('#reservationForm [required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Este campo é obrigatório');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // Validação específica para datas
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    
    if (checkin && checkout) {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        
        if (checkoutDate <= checkinDate) {
            showFieldError(document.getElementById('checkout'), 'A data de check-out deve ser posterior ao check-in');
            isValid = false;
        }
    }
    
    // Validação de termos
    if (!document.getElementById('terms').checked) {
        alert('Você deve aceitar os termos e condições para continuar');
        isValid = false;
    }
    
    return isValid;
}

// Mostrar erro no campo
function showFieldError(field, message) {
    clearFieldError(field);
    field.style.borderColor = '#ef4444';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.color = '#ef4444';
    errorElement.style.fontSize = '0.85rem';
    errorElement.style.marginTop = '5px';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

// Limpar erro do campo
function clearFieldError(field) {
    field.style.borderColor = '#d1d5db';
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Processar reserva
function processReservation() {
    const submitButton = document.querySelector('.btn-complete-reservation');
    const originalText = submitButton.innerHTML;
    
    // Simular processamento
    submitButton.innerHTML = '<span class="btn-icon">⏳</span> Processando...';
    submitButton.disabled = true;
    
    // Simular delay de processamento
    setTimeout(() => {
        // Aqui normalmente enviaria os dados para o servidor
        const reservationData = collectReservationData();
        console.log('Dados da reserva:', reservationData);
        
        // Redirecionar para página de reserva concluída
        window.location.href = '../html/resConcluida.html';
        
        // Restaurar botão (em caso de erro)
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}

// Coletar dados da reserva
function collectReservationData() {
    const selectedRoom = document.querySelector('.room-option.selected');
    
    return {
        hotel: 'Copacabana Palace',
        room: selectedRoom.querySelector('h4').textContent,
        roomType: selectedRoom.dataset.room,
        checkin: document.getElementById('checkin').value,
        checkout: document.getElementById('checkout').value,
        adults: document.getElementById('adults').value,
        children: document.getElementById('children').value,
        services: Array.from(document.querySelectorAll('.service-option input[type="checkbox"]:checked'))
            .map(service => service.id),
        guest: {
            name: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            cpf: document.getElementById('cpf').value
        },
        notes: document.getElementById('notes').value,
        total: parseFloat(document.querySelector('.total-item strong:last-child').textContent.replace('R$ ', ''))
    };
}