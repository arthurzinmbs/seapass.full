// Configuração da API
const API_BASE = 'http://localhost:4000/api';

// Serviço de API para Reservas
class ReservationAPI {
    static async getAuthToken() {
        return localStorage.getItem('authToken');
    }

    static async getListingDetails(listingId) {
        try {
            console.log('📡 Buscando detalhes do imóvel:', listingId);
            const response = await fetch(`${API_BASE}/listings/${listingId}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Erro na API:', error);
            // Fallback para dados mockados
            return this.getMockListingData();
        }
    }

    static getMockListingData() {
        console.log('🔄 Usando dados mockados (backend offline)');
        return {
            id: 1,
            name: "Copacabana Palace",
            address: "Av. Atlântica, 1702 - Copacabana, Rio de Janeiro",
            image: "../images/copacabana-palace.jpg",
            rating: 5.0,
            rooms: [
                {
                    type: "deluxe",
                    name: "Quarto Deluxe",
                    price: 890,
                    size: "30m²",
                    view: "Vista parcial do mar",
                    features: ["🛏️ 1 cama de casal", "🚿 Banheiro de mármore"]
                },
                {
                    type: "junior",
                    name: "Suíte Junior", 
                    price: 1200,
                    size: "45m²",
                    view: "Vista para o mar • Varanda",
                    features: ["🛏️ 1 cama king size", "🚿 Banheiro com hidromassagem"]
                },
                {
                    type: "presidencial",
                    name: "Suíte Presidencial",
                    price: 2500,
                    size: "80m²", 
                    view: "Vista panorâmica • 2 quartos",
                    features: ["🛏️ 2 quartos separados", "💆 Área de spa privativa"]
                }
            ]
        };
    }

    static async checkAvailability(listingId, checkin, checkout) {
        try {
            console.log('📡 Verificando disponibilidade...');
            const response = await fetch(
                `${API_BASE}/listings/${listingId}/availability?checkin=${checkin}&checkout=${checkout}`
            );
            
            if (!response.ok) throw new Error('Erro ao verificar disponibilidade');
            return await response.json();
        } catch (error) {
            console.warn('⚠️ API offline, usando disponibilidade mockada');
            // Fallback: sempre disponível para demo
            return { available: true, message: "Disponível para reserva" };
        }
    }

    static async createBooking(bookingData) {
        try {
            const token = await this.getAuthToken();
            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            console.log('📦 Enviando reserva:', bookingData);
            const response = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar reserva');
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Erro ao criar reserva:', error);
            // Simular sucesso para demo
            return this.mockBookingSuccess(bookingData);
        }
    }

    static mockBookingSuccess(bookingData) {
        console.log('✅ Reserva mockada criada com sucesso');
        return {
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending_payment',
            ...bookingData
        };
    }

    static async createPaymentSession(bookingId) {
        try {
            const token = await this.getAuthToken();
            const response = await fetch(`${API_BASE}/payments/create-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bookingId })
            });
            
            if (!response.ok) throw new Error('Erro ao criar sessão de pagamento');
            return await response.json();
        } catch (error) {
            console.warn('⚠️ API de pagamento offline, simulando...');
            // Simular redirecionamento para página de sucesso
            return { 
                paymentUrl: '../html/resConcluida.html',
                sessionId: 'mock_session_' + Date.now()
            };
        }
    }

    static async getUserProfile() {
        try {
            const token = await this.getAuthToken();
            if (!token) return null;

            const response = await fetch(`${API_BASE}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.warn('⚠️ Erro ao carregar perfil, usando dados mockados');
            return this.getMockUserData();
        }
    }

    static getMockUserData() {
        // Dados mockados para quando o backend estiver offline
        return {
            nome: "João Silva",
            email: "joao.silva@email.com", 
            telefone: "11999999999",
            cpf: "12345678900"
        };
    }
}

// Gerenciador de Estado da Reserva
class ReservationManager {
    constructor() {
        this.state = {
            listingId: this.getListingIdFromURL(),
            listing: null,
            selectedRoom: null,
            checkin: null,
            checkout: null,
            guests: { adults: 2, children: 0 },
            services: [],
            availability: null,
            booking: null,
            user: null
        };
        
        this.initialized = false;
    }

    getListingIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('listing') || '1';
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🚀 Inicializando página de reserva...');
            
            // Configurar datas mínimas primeiro
            this.setupDateConstraints();
            
            // Verificar autenticação
            await this.checkAuthentication();
            
            // Carregar dados do imóvel
            await this.loadListingDetails();
            
            // Carregar perfil do usuário
            await this.loadUserProfile();
            
            // Inicializar interface
            this.setupEventListeners();
            
            // Renderizar quartos
            this.renderRoomOptions();
            
            this.initialized = true;
            console.log('✅ Página de reserva inicializada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.showError('Erro ao carregar página: ' + error.message, true);
        }
    }

    setupDateConstraints() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const checkinInput = document.getElementById('checkin');
            const checkoutInput = document.getElementById('checkout');
            
            if (checkinInput) {
                checkinInput.min = today;
                // Set default checkin to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                checkinInput.value = tomorrow.toISOString().split('T')[0];
                this.state.checkin = checkinInput.value;
            }
            
            if (checkoutInput) {
                // Set default checkout to 3 days from now
                const in3Days = new Date();
                in3Days.setDate(in3Days.getDate() + 3);
                checkoutInput.value = in3Days.toISOString().split('T')[0];
                this.state.checkout = checkoutInput.value;
                
                this.updateCheckoutMinDate();
            }
        } catch (error) {
            console.warn('⚠️ Erro ao configurar datas:', error);
        }
    }

    async checkAuthentication() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('🔐 Usuário não autenticado, usando modo demo');
            // Em vez de redirecionar, permitir modo demo
            this.showNotification('Modo demonstração - Dados mockados serão usados', 'info');
            return;
        }
    }

    async loadListingDetails() {
        try {
            this.showLoading('Carregando detalhes do imóvel...');
            this.state.listing = await ReservationAPI.getListingDetails(this.state.listingId);
            this.renderListingDetails();
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            throw error;
        }
    }

    async loadUserProfile() {
        try {
            this.state.user = await ReservationAPI.getUserProfile();
            if (this.state.user) {
                this.populateUserData();
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        }
    }

    populateUserData() {
        try {
            const fields = ['fullname', 'email', 'phone', 'cpf'];
            fields.forEach(field => {
                const element = document.getElementById(field);
                if (element && this.state.user[field] || this.state.user.nome) {
                    if (field === 'fullname' && this.state.user.nome) {
                        element.value = this.state.user.nome;
                    } else if (this.state.user[field]) {
                        element.value = this.state.user[field];
                    }
                }
            });
        } catch (error) {
            console.warn('⚠️ Erro ao preencher dados do usuário:', error);
        }
    }

    renderListingDetails() {
        try {
            const hotelSummary = document.querySelector('.hotel-summary');
            if (!hotelSummary || !this.state.listing) return;

            hotelSummary.innerHTML = `
                <div class="hotel-image">
                    <img src="${this.state.listing.image}" alt="${this.state.listing.name}" onerror="this.src='../images/copacabana-palace.jpg'">
                </div>
                <div class="hotel-details">
                    <h3>${this.state.listing.name}</h3>
                    <div class="hotel-info">
                        <span class="location">📍 ${this.state.listing.address}</span>
                        <div class="rating">
                            <span class="stars">${'⭐'.repeat(5)}</span>
                            <span class="rating-score">${this.state.listing.rating || '5.0'}</span>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Erro ao renderizar detalhes:', error);
        }
    }

    renderRoomOptions() {
        try {
            const roomSelection = document.getElementById('roomSelection');
            if (!roomSelection || !this.state.listing) return;

            roomSelection.innerHTML = this.state.listing.rooms.map(room => `
                <div class="room-option ${room.type === 'deluxe' ? 'selected' : ''}" data-room="${room.type}">
                    <div class="room-info">
                        <h4>${room.name}</h4>
                        <p>${room.size} • ${room.view}</p>
                        <div class="room-features">
                            ${room.features.map(feature => `<span>${feature}</span>`).join('')}
                        </div>
                    </div>
                    <div class="room-price">
                        <span class="price">R$ ${room.price}</span>
                        <span class="period">/noite</span>
                    </div>
                </div>
            `).join('');

            // Set first room as selected by default
            if (this.state.listing.rooms.length > 0 && !this.state.selectedRoom) {
                this.state.selectedRoom = 'deluxe';
            }

            // Add event listeners to rooms
            this.attachRoomEventListeners();
            
            // Update summary
            this.updateReservationSummary();

        } catch (error) {
            console.error('❌ Erro ao renderizar quartos:', error);
        }
    }

    attachRoomEventListeners() {
        document.querySelectorAll('.room-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.room-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.state.selectedRoom = option.dataset.room;
                this.updateReservationSummary();
            });
        });
    }

    setupEventListeners() {
        try {
            // Datas
            const checkinInput = document.getElementById('checkin');
            const checkoutInput = document.getElementById('checkout');
            
            if (checkinInput) {
                checkinInput.addEventListener('change', (e) => {
                    this.state.checkin = e.target.value;
                    this.updateCheckoutMinDate();
                    this.updateReservationSummary();
                });
            }

            if (checkoutInput) {
                checkoutInput.addEventListener('change', (e) => {
                    this.state.checkout = e.target.value;
                    this.updateReservationSummary();
                });
            }

            // Hóspedes
            const adultsSelect = document.getElementById('adults');
            const childrenSelect = document.getElementById('children');
            
            if (adultsSelect) {
                adultsSelect.addEventListener('change', (e) => {
                    this.state.guests.adults = parseInt(e.target.value);
                    this.updateReservationSummary();
                });
            }

            if (childrenSelect) {
                childrenSelect.addEventListener('change', (e) => {
                    this.state.guests.children = parseInt(e.target.value);
                    this.updateReservationSummary();
                });
            }

            // Serviços
            this.setupServiceListeners();

            // Máscaras
            this.setupMasks();

            // Formulário
            const form = document.getElementById('reservationForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.processReservation();
                });
            }

        } catch (error) {
            console.error('❌ Erro ao configurar event listeners:', error);
        }
    }

    setupServiceListeners() {
        // Serviços mockados
        const services = [
            { id: 'breakfast', name: 'Café da Manhã', price: 85, description: 'Buffet completo - R$ 85/dia' },
            { id: 'airport', name: 'Transfer Aeroporto', price: 150, description: 'Ida e volta - R$ 150' },
            { id: 'spa', name: 'Pacote Spa', price: 350, description: '2 massagens - R$ 350' },
            { id: 'late', name: 'Late Check-out', price: 120, description: 'Até 16h - R$ 120' }
        ];

        const servicesContainer = document.getElementById('additionalServices');
        if (servicesContainer) {
            servicesContainer.innerHTML = services.map(service => `
                <div class="service-option">
                    <input type="checkbox" id="${service.id}" name="${service.id}">
                    <label for="${service.id}">
                        <span class="service-icon">${this.getServiceIcon(service.id)}</span>
                        <div class="service-info">
                            <strong>${service.name}</strong>
                            <span>${service.description}</span>
                        </div>
                    </label>
                </div>
            `).join('');

            // Add event listeners to services
            services.forEach(service => {
                const checkbox = document.getElementById(service.id);
                if (checkbox) {
                    checkbox.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            this.state.services.push({
                                id: service.id,
                                name: service.name,
                                price: service.price
                            });
                        } else {
                            this.state.services = this.state.services.filter(s => s.id !== service.id);
                        }
                        this.updateReservationSummary();
                    });
                }
            });
        }
    }

    getServiceIcon(serviceId) {
        const icons = {
            breakfast: '🍳',
            airport: '🚗',
            spa: '💆',
            late: '⏰'
        };
        return icons[serviceId] || '⭐';
    }

    setupMasks() {
        // CPF mask
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    e.target.value = value;
                }
            });
        }
        
        // Phone mask
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                    e.target.value = value;
                }
            });
        }
    }

    updateCheckoutMinDate() {
        if (this.state.checkin) {
            const checkinDate = new Date(this.state.checkin);
            checkinDate.setDate(checkinDate.getDate() + 1);
            const minCheckout = checkinDate.toISOString().split('T')[0];
            
            const checkoutInput = document.getElementById('checkout');
            if (checkoutInput) {
                checkoutInput.min = minCheckout;
                
                // Update checkout if it's before new min date
                const checkoutDate = new Date(checkoutInput.value);
                if (checkoutDate < checkinDate) {
                    checkoutInput.value = minCheckout;
                    this.state.checkout = minCheckout;
                }
            }
        }
    }

    updateReservationSummary() {
        try {
            const total = this.calculateTotal();
            const nights = this.calculateNights();
            const roomPrice = this.state.selectedRoom ? this.getRoomPrice(this.state.selectedRoom) : 0;
            const roomTotal = roomPrice * nights;
            const taxRate = 0.1;
            const taxes = roomTotal * taxRate;
            const servicesTotal = this.calculateServicesTotal();

            const summaryDetails = document.getElementById('summaryDetails');
            const totalAmount = document.getElementById('totalAmount');
            
            if (summaryDetails) {
                summaryDetails.innerHTML = `
                    <div class="summary-item">
                        <span>${this.getRoomName(this.state.selectedRoom)}</span>
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
                    ${this.state.services.length > 0 ? this.state.services.map(service => `
                        <div class="summary-item">
                            <span>${service.name}</span>
                            <span>R$ ${service.price.toFixed(2)}</span>
                        </div>
                    `).join('') : '<div class="summary-item"><span>Serviços adicionais</span><span>R$ 0,00</span></div>'}
                `;
            }

            if (totalAmount) {
                totalAmount.textContent = `R$ ${total.toFixed(2)}`;
            }

        } catch (error) {
            console.error('❌ Erro ao atualizar resumo:', error);
        }
    }

    calculateTotal() {
        if (!this.state.selectedRoom || !this.state.checkin || !this.state.checkout) {
            return 0;
        }

        const roomPrice = this.getRoomPrice(this.state.selectedRoom);
        const nights = this.calculateNights();
        const servicesTotal = this.calculateServicesTotal();
        
        return (roomPrice * nights) + servicesTotal;
    }

    getRoomPrice(roomType) {
        if (this.state.listing && this.state.listing.rooms) {
            const room = this.state.listing.rooms.find(r => r.type === roomType);
            if (room) return room.price;
        }
        
        const priceMap = {
            'deluxe': 890,
            'junior': 1200,
            'presidencial': 2500
        };
        return priceMap[roomType] || 0;
    }

    calculateNights() {
        if (!this.state.checkin || !this.state.checkout) return 0;
        
        const checkin = new Date(this.state.checkin);
        const checkout = new Date(this.state.checkout);
        const diffTime = Math.abs(checkout - checkin);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    calculateServicesTotal() {
        return this.state.services.reduce((total, service) => total + service.price, 0);
    }

    getRoomName(roomType) {
        const roomMap = {
            'deluxe': 'Quarto Deluxe',
            'junior': 'Suíte Junior', 
            'presidencial': 'Suíte Presidencial'
        };
        return roomMap[roomType] || 'Quarto Selecionado';
    }

    async processReservation() {
        const submitButton = document.getElementById('btnCompleteReservation');
        if (!submitButton) return;

        const originalText = submitButton.innerHTML;
        
        try {
            // Mostrar loading
            submitButton.innerHTML = '<span class="btn-loading"><div class="loading-spinner"></div>Processando reserva...</span>';
            submitButton.disabled = true;

            // 1. Validar formulário
            if (!this.validateForm()) {
                return;
            }

            // 2. Validar disponibilidade
            const isAvailable = await this.checkAvailability();
            if (!isAvailable) {
                return;
            }

            // 3. Criar reserva
            const bookingData = this.collectReservationData();
            this.state.booking = await ReservationAPI.createBooking(bookingData);

            // 4. Criar sessão de pagamento
            const paymentSession = await ReservationAPI.createPaymentSession(this.state.booking.id);
            
            // 5. Redirecionar
            this.showSuccess('Reserva realizada com sucesso! Redirecionando...');
            setTimeout(() => {
                window.location.href = paymentSession.paymentUrl;
            }, 2000);

        } catch (error) {
            this.showError('Erro ao processar reserva: ' + error.message);
            console.error('❌ Erro no processamento:', error);
        } finally {
            // Restaurar botão
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }

    validateForm() {
        let isValid = true;
        
        // Validar campos obrigatórios
        const requiredFields = [
            { id: 'fullname', name: 'Nome completo' },
            { id: 'email', name: 'E-mail' },
            { id: 'phone', name: 'Telefone' },
            { id: 'cpf', name: 'CPF' },
            { id: 'checkin', name: 'Check-in' },
            { id: 'checkout', name: 'Check-out' }
        ];

        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            const errorElement = document.getElementById(field.id + '-error');
            
            if (element && !element.value.trim()) {
                if (errorElement) {
                    errorElement.textContent = `${field.name} é obrigatório`;
                    errorElement.style.display = 'block';
                }
                element.style.borderColor = '#ef4444';
                isValid = false;
            } else if (element && errorElement) {
                errorElement.style.display = 'none';
                element.style.borderColor = '';
            }
        });

        // Validar termos
        const termsCheckbox = document.getElementById('terms');
        const termsError = document.getElementById('terms-error');
        if (termsCheckbox && !termsCheckbox.checked) {
            if (termsError) {
                termsError.textContent = 'Você deve aceitar os termos e condições';
                termsError.style.display = 'block';
            }
            isValid = false;
        } else if (termsError) {
            termsError.style.display = 'none';
        }

        // Validar quarto selecionado
        if (!this.state.selectedRoom) {
            this.showError('Selecione um tipo de quarto');
            isValid = false;
        }

        return isValid;
    }

    async checkAvailability() {
        if (!this.state.checkin || !this.state.checkout) {
            this.showError('Selecione as datas de check-in e check-out');
            return false;
        }

        try {
            this.state.availability = await ReservationAPI.checkAvailability(
                this.state.listingId,
                this.state.checkin,
                this.state.checkout
            );

            if (!this.state.availability.available) {
                this.showError('Datas indisponíveis para reserva');
                return false;
            }

            return true;
        } catch (error) {
            console.warn('⚠️ Usando disponibilidade mockada devido a erro');
            return true; // Assume disponível para demo
        }
    }

    collectReservationData() {
        return {
            listingId: this.state.listingId,
            roomType: this.state.selectedRoom,
            checkin: this.state.checkin,
            checkout: this.state.checkout,
            guests: this.state.guests,
            services: this.state.services.map(service => service.id),
            totalAmount: this.calculateTotal(),
            guestInfo: {
                name: document.getElementById('fullname').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                cpf: document.getElementById('cpf').value
            },
            specialRequests: document.getElementById('notes').value,
            termsAccepted: document.getElementById('terms').checked
        };
    }

    // Métodos de UI
    showError(message, isFatal = false) {
        console.error('❌ Erro:', message);
        if (isFatal) {
            alert('Erro crítico: ' + message);
        } else {
            this.showNotification(message, 'error');
        }
    }

    showSuccess(message) {
        console.log('✅ Sucesso:', message);
        this.showNotification(message, 'success');
        
        const successElement = document.getElementById('success-message');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        }
    }

    showNotification(message, type = 'info') {
        // Implementação simples de notificação
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    showLoading(message) {
        console.log('⏳ Loading:', message);
        // Poderia implementar um spinner global aqui
    }

    hideLoading() {
        // Esconder loading se implementado
    }
}

// Inicialização segura da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 DOM carregado, inicializando reserva...');
    
    // Criar instância do gerenciador
    window.reservationManager = new ReservationManager();
    
    // Inicializar com delay para garantir que tudo está carregado
    setTimeout(() => {
        window.reservationManager.initialize().catch(error => {
            console.error('💥 Erro fatal na inicialização:', error);
        });
    }, 100);
});

// Fallback: se algo der errado, pelo menos as datas funcionam
window.addEventListener('load', function() {
    console.log('📄 Página totalmente carregada');
});