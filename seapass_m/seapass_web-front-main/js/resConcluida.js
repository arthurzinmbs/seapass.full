// Função para gerar dados aleatórios da reserva (simulação)
function generateReservationData() {
    // Gerar código de reserva aleatório
    const reservationCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Gerar datas (próximos 7-14 dias)
    const today = new Date();
    const checkin = new Date(today);
    checkin.setDate(today.getDate() + Math.floor(Math.random() * 7) + 7);
    
    const checkout = new Date(checkin);
    checkout.setDate(checkin.getDate() + Math.floor(Math.random() * 7) + 3);
    
    // Gerar número de hóspedes
    const adults = Math.floor(Math.random() * 2) + 1;
    const children = Math.floor(Math.random() * 2);
    
    // Gerar valor total
    const basePrice = 890; // Preço do quarto deluxe
    const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    const total = (basePrice * nights * 1.1).toFixed(2); // +10% taxas
    
    return {
        code: reservationCode,
        checkin: checkin,
        checkout: checkout,
        adults: adults,
        children: children,
        total: total
    };
}

// Função para formatar data
function formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}


// Função para inicializar a página
function initializeSuccessPage() {
    // Gerar dados da reserva
    const reservationData = generateReservationData();
    
    // Preencher os dados na página
    document.getElementById('reservationCode').textContent = reservationData.code;
    document.getElementById('checkinDate').textContent = formatDate(reservationData.checkin);
    document.getElementById('checkoutDate').textContent = formatDate(reservationData.checkout);
    
    // Preencher informações dos hóspedes
    let guestsText = `${reservationData.adults} adulto${reservationData.adults > 1 ? 's' : ''}`;
    if (reservationData.children > 0) {
        guestsText += `, ${reservationData.children} criança${reservationData.children > 1 ? 's' : ''}`;
    }
    document.getElementById('guestsInfo').textContent = guestsText;
    
    // Preencher valor total
    document.getElementById('totalAmount').textContent = `R$ ${reservationData.total}`;
}

// Inicializar a página quando carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeSuccessPage();
    
    // Adicionar evento de clique para o botão principal
    document.querySelector('.btn-primary').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '../html/telainicial.html';
    });
    
    // Adicionar evento de clique no botão secundário
    document.querySelector('.btn-secondary').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '../html/reservas.html';
    });
});