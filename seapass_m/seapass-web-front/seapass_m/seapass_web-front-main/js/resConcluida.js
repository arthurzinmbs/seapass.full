const API_BASE = 'http://localhost:4000/api';

function saveToLocalStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadReservationData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data);
    } catch (err) {
        console.error("Erro ao parsear dados da reserva:", err);
        return null;
    }
}

function renderReservation(data) {
    if (!data) return;

    document.getElementById('guestName').textContent = data.nome_completo;
    document.getElementById('guestEmail').textContent = data.email;
    document.getElementById('confirmationEmail').textContent = data.email;
    document.getElementById('reservationCode').textContent = data.id || 'N/A';
    document.getElementById('hotelNameDetail').textContent = data.destino || 'Não informado';
    document.getElementById('guestDestino')?.textContent = data.destino || 'Não informado';
    document.getElementById('guestPhone').textContent = data.telefone || 'Não informado';
    document.getElementById('guestCPF').textContent = data.cpf || 'Não informado';
    document.getElementById('checkinDate')?.textContent = data.checkin || 'Não informado';
    document.getElementById('checkoutDate')?.textContent = data.checkout || 'Não informado';
}

function setupPrintButton() {
    const btnPrint = document.getElementById('btnPrint');
    if (!btnPrint) return;

    btnPrint.addEventListener('click', () => {
        const data = loadReservationData();
        if (!data) return;

        const content = `
            <h1>Reserva Concluída</h1>
            <p>Nome: ${data.nome_completo}</p>
            <p>Email: ${data.email}</p>
            <p>Telefone: ${data.telefone}</p>
            <p>CPF: ${data.cpf}</p>
            <p>Destino: ${data.destino || 'Não informado'}</p>
            <p>Check-in: ${data.checkin || 'Não informado'}</p>
            <p>Check-out: ${data.checkout || 'Não informado'}</p>
        `;
        const win = window.open('', '_blank');
        win.document.write(content);
        win.document.close();
        win.focus();
        win.print();
    });
}

async function sendReservationToBackend(data) {
    if (!data.nome_completo || !data.email || !data.telefone || !data.cpf) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return null;
    }

    try {
        const response = await fetch(`${API_BASE}/reserva`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.erro || 'Erro desconhecido');
        return result;
    } catch (err) {
        console.error("Erro ao enviar reserva ao backend:", err);
        alert("Erro ao cadastrar reserva. Tente novamente.");
        return null;
    }
}

async function handleReservationSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const reservationData = {
        nome_completo: form.nome_completo.value.trim(),
        email: form.email.value.trim(),
        telefone: form.telefone.value.trim(),
        cpf: form.cpf.value.trim(),
        destino: form.destino.value.trim()
    };

    const savedData = await sendReservationToBackend(reservationData);

    if (savedData && savedData.id) {
        reservationData.id = savedData.id;
        saveToLocalStorage(reservationData);
        renderReservation(reservationData);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }

    const savedData = loadReservationData();
    renderReservation(savedData);
    setupPrintButton();
});
