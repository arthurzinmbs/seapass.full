// Serviço para gerenciar dados da reserva entre páginas
class ReservationStorage {
    static STORAGE_KEY = 'seapass_last_reservation';
    
    static saveReservation(reservationData) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reservationData));
            console.log('✅ Reserva salva no storage:', reservationData);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar reserva:', error);
            return false;
        }
    }
    
    static getReservation() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ Erro ao recuperar reserva:', error);
            return null;
        }
    }
    
    static clearReservation() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar reserva:', error);
            return false;
        }
    }
}

// Gerenciador da página de sucesso
class SuccessPageManager {
    constructor() {
        this.reservationData = null;
    }
    
    initialize() {
        console.log('🚀 Inicializando página de reserva concluída...');
        
        // Carregar dados da reserva
        this.loadReservationData();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Mostrar dados na página
        this.renderReservationDetails();
    }
    
    loadReservationData() {
        // Primeiro tenta pegar da storage (dados reais da reserva)
        this.reservationData = ReservationStorage.getReservation();
        
        if (!this.reservationData) {
            console.warn('⚠️ Nenhuma reserva encontrada, usando dados de demonstração');
            this.reservationData = this.generateDemoData();
        }
        
        console.log('📋 Dados da reserva carregados:', this.reservationData);
    }
    
    generateDemoData() {
        // Dados de demonstração para quando não há reserva real
        const today = new Date();
        const checkin = new Date(today);
        checkin.setDate(today.getDate() + 7);
        
        const checkout = new Date(checkin);
        checkout.setDate(checkin.getDate() + 3);
        
        return {
            id: 'DEMO_' + Math.random().toString(36).substr(2, 8).toUpperCase(),
            hotel: 'Copacabana Palace',
            roomType: 'deluxe',
            roomName: 'Quarto Deluxe',
            checkin: checkin.toISOString().split('T')[0],
            checkout: checkout.toISOString().split('T')[0],
            guests: { adults: 2, children: 0 },
            services: [],
            totalAmount: '2937.00',
            guestInfo: {
                name: 'João Silva',
                email: 'joao.silva@email.com',
                phone: '(11) 99999-9999',
                cpf: '123.456.789-00'
            },
            specialRequests: '',
            timestamp: new Date().toISOString()
        };
    }
    
    renderReservationDetails() {
        if (!this.reservationData) {
            this.showError('Dados da reserva não encontrados');
            return;
        }
        
        try {
            // Código da reserva
            document.getElementById('reservationCode').textContent = this.reservationData.id;
            
            // Hotel
            document.getElementById('hotelName').textContent = this.reservationData.hotel;
            document.getElementById('hotelNameDetail').textContent = this.reservationData.hotel;
            
            // Tipo de quarto
            const roomNames = {
                'deluxe': 'Quarto Deluxe',
                'junior': 'Suíte Junior',
                'presidencial': 'Suíte Presidencial'
            };
            document.getElementById('roomType').textContent = roomNames[this.reservationData.roomType] || this.reservationData.roomName || 'Quarto Selecionado';
            
            // Datas
            const checkinDate = this.formatDate(this.reservationData.checkin);
            const checkoutDate = this.formatDate(this.reservationData.checkout);
            document.getElementById('checkinDate').textContent = checkinDate;
            document.getElementById('checkoutDate').textContent = checkoutDate;
            
            // Noites
            const nights = this.calculateNights(this.reservationData.checkin, this.reservationData.checkout);
            document.getElementById('nightsCount').textContent = `${nights} noite${nights !== 1 ? 's' : ''}`;
            
            // Hóspedes
            const guestsText = this.formatGuestsInfo(this.reservationData.guests);
            document.getElementById('guestsInfo').textContent = guestsText;
            
            // Dados do hóspede
            document.getElementById('guestName').textContent = this.reservationData.guestInfo?.name || 'Não informado';
            document.getElementById('guestEmail').textContent = this.reservationData.guestInfo?.email || 'Não informado';
            document.getElementById('confirmationEmail').textContent = this.reservationData.guestInfo?.email || 'seu e-mail';
            
            // Serviços
            document.getElementById('servicesList').textContent = this.formatServices(this.reservationData.services);
            
            // Total
            document.getElementById('totalAmount').textContent = this.formatCurrency(this.reservationData.totalAmount);
            
            console.log('✅ Dados da reserva renderizados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao renderizar detalhes:', error);
            this.showError('Erro ao carregar detalhes da reserva');
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    calculateNights(checkin, checkout) {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const diffTime = Math.abs(checkoutDate - checkinDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    formatGuestsInfo(guests) {
        if (!guests) return 'Não informado';
        
        let text = `${guests.adults || 0} adulto${guests.adults > 1 ? 's' : ''}`;
        if (guests.children && guests.children > 0) {
            text += `, ${guests.children} criança${guests.children > 1 ? 's' : ''}`;
        }
        return text;
    }
    
    formatServices(services) {
        if (!services || services.length === 0) {
            return 'Nenhum serviço adicional';
        }
        
        const serviceNames = {
            'breakfast': 'Café da Manhã',
            'airport': 'Transfer Aeroporto',
            'spa': 'Pacote Spa',
            'late': 'Late Check-out'
        };
        
        return services.map(service => serviceNames[service] || service).join(', ');
    }
    
    formatCurrency(amount) {
        const value = parseFloat(amount) || 0;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    setupEventListeners() {
        // Botão de imprimir
        const printBtn = document.getElementById('btnPrint');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printReservation());
        }
        
        // Limpar dados ao sair da página (opcional)
        window.addEventListener('beforeunload', () => {
            // Se quiser limpar os dados após mostrar, descomente:
            // ReservationStorage.clearReservation();
        });
    }
    
    printReservation() {
        console.log('🖨️ Iniciando impressão da reserva...');
        
        const printContent = this.generatePrintContent();
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprovante de Reserva - SeaPass</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        color: #333;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 2px solid #3b82f6; 
                        padding-bottom: 20px; 
                        margin-bottom: 20px;
                    }
                    .success-icon { 
                        color: #10b981; 
                        font-size: 48px; 
                        margin-bottom: 10px;
                    }
                    .detail-card { 
                        background: #f8fafc; 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin-bottom: 20px;
                    }
                    .detail-item { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 8px; 
                        padding: 4px 0;
                    }
                    .detail-item.total { 
                        border-top: 1px solid #cbd5e1; 
                        padding-top: 12px; 
                        font-weight: bold; 
                        font-size: 1.1em;
                    }
                    .detail-label { 
                        font-weight: 600; 
                        color: #475569;
                    }
                    .footer { 
                        text-align: center; 
                        margin-top: 30px; 
                        color: #64748b; 
                        font-size: 0.9em;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            // printWindow.close(); // Fechar após imprimir (opcional)
        }, 500);
    }
    
    generatePrintContent() {
        const nights = this.calculateNights(this.reservationData.checkin, this.reservationData.checkout);
        const guestsText = this.formatGuestsInfo(this.reservationData.guests);
        const servicesText = this.formatServices(this.reservationData.services);
        
        return `
            <div class="header">
                <div class="success-icon">✓</div>
                <h1>Reserva Concluída com Sucesso!</h1>
                <p>SeaPass - Sistema de Reservas Hoteleiras</p>
            </div>
            
            <div class="detail-card">
                <h3>Detalhes da Reserva</h3>
                
                <div class="detail-item">
                    <span class="detail-label">Código:</span>
                    <span>${this.reservationData.id}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Hotel:</span>
                    <span>${this.reservationData.hotel}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Acomodação:</span>
                    <span>${this.reservationData.roomName || this.reservationData.roomType}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Check-in:</span>
                    <span>${this.formatDate(this.reservationData.checkin)}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Check-out:</span>
                    <span>${this.formatDate(this.reservationData.checkout)}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Noites:</span>
                    <span>${nights}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Hóspedes:</span>
                    <span>${guestsText}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Hóspede Principal:</span>
                    <span>${this.reservationData.guestInfo?.name || 'Não informado'}</span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-label">Serviços:</span>
                    <span>${servicesText}</span>
                </div>
                
                <div class="detail-item total">
                    <span class="detail-label">Total:</span>
                    <span>${this.formatCurrency(this.reservationData.totalAmount)}</span>
                </div>
            </div>
            
            <div class="footer">
                <p>SeaPass - ${new Date().toLocaleDateString('pt-BR')}</p>
                <p>Dúvidas? (11) 9999-9999</p>
            </div>
        `;
    }
    
    showError(message) {
        console.error('❌ Erro:', message);
        // Poderia mostrar uma mensagem na UI
        const errorElement = document.createElement('div');
        errorElement.style.cssText = `
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        `;
        errorElement.innerHTML = `
            <strong>⚠️ Erro</strong>
            <p>${message}</p>
            <small>Usando dados de demonstração</small>
        `;
        
        const container = document.querySelector('.success-content');
        if (container) {
            container.insertBefore(errorElement, container.querySelector('.reservation-details'));
        }
    }
}

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Página de reserva concluída carregada');
    
    const successManager = new SuccessPageManager();
    successManager.initialize();
    
    // Configurar botões de navegação
    document.querySelector('.btn-primary')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '../html/telainicial.html';
    });
    
    document.querySelector('.btn-secondary')?.addEventListener('click', function(e) {
        if (e.target.id !== 'btnPrint') {
            e.preventDefault();
            window.location.href = '../html/reservas.html';
        }
    });
});

// Expor para debug
window.SuccessPageManager = SuccessPageManager;
window.ReservationStorage = ReservationStorage;