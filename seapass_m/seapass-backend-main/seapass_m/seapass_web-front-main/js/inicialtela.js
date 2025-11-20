// Dados dos hotéis para busca
const hotelsData = [
  {
    name: "Copacabana Palace",
    city: "Rio de Janeiro",
    image: "../images/copacabana-palace.jpg",
    link: "cpalace.html",
    rating: 5.0,
    price: 890
  },
  {
    name: "Hotel Paradise",
    city: "São Paulo",
    image: "../images/sasha-kaunas-Fk9d0cxYqC4-unsplash.jpg",
    link: "reservaunique.html",
    rating: 4.2,
    price: 650
  },
  {
    name: "Hotel Unique",
    city: "São Paulo",
    image: "../images/hotelunique.jpg",
    link: "reservaunique.html",
    rating: 4.5,
    price: 720
  },
  {
    name: "Palacio Tangara",
    city: "São Paulo",
    image: "../images/tangara.jpg",
    link: "ptangara.html",
    rating: 4.9,
    price: 950
  },
  {
    name: "Crystal Palace",
    city: "Florianópolis",
    image: "../images/sala.jpg",
    link: "tt.html",
    rating: 4.8,
    price: 820
  },
  {
    name: "Liverpool Hotel",
    city: "Salvador",
    image: "../images/quarto.jpg",
    link: "tt.html",
    rating: 4.1,
    price: 480
  },
  {
    name: "Recife Hotel",
    city: "Recife",
    image: "../images/mark-champs-Id2IIl1jOB0-unsplash.jpg",
    link: "tt.html",
    rating: 4.7,
    price: 780
  },
  {
    name: "Euro Palace",
    city: "Porto Alegre",
    image: "../images/roberto-nickson-EeeKjwm2vDo-unsplash.jpg",
    link: "reservaunique.html",
    rating: 4.3,
    price: 690
  },
  {
    name: "Hotel Iônia",
    city: "Local",
    image: "../images/meklay-yotkhamsay-AAZaK31x6FM-unsplash.jpg",
    link: "reservaunique.html",
    rating: 4.0,
    price: 550
  },
  {
    name: "Pousada Zero",
    city: "Local",
    image: "../images/visualsofdana-T5pL6ciEn-I-unsplash.jpg",
    link: "tt.html",
    rating: 4.9,
    price: 920
  },
  {
    name: "Pousada United",
    city: "Local",
    image: "../images/rod-long-2P_ifaetDm0-unsplash.jpg",
    link: "tt.html",
    rating: 4.2,
    price: 480
  },
  {
    name: "Hotel Real",
    city: "Local",
    image: "../images/redes-com-palmeiras - Copia.jpg",
    link: "tt.html",
    rating: 4.8,
    price: 850
  }
];

// Elementos DOM
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const resultsList = document.getElementById('resultsList');
const menuToggle = document.getElementById('menu-toggle');

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('.menu-hamburguer') && menuToggle.checked) {
    menuToggle.checked = false;
  }
});

// Função de busca
function performSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (searchTerm === '') {
    closeSearch();
    return;
  }

  const filteredHotels = hotelsData.filter(hotel => 
    hotel.name.toLowerCase().includes(searchTerm) || 
    hotel.city.toLowerCase().includes(searchTerm)
  );

  displaySearchResults(filteredHotels);
}

// Exibir resultados da busca
function displaySearchResults(results) {
  resultsList.innerHTML = '';

  if (results.length === 0) {
    resultsList.innerHTML = '<div class="no-results">Nenhum hotel encontrado</div>';
  } else {
    results.forEach(hotel => {
      const resultItem = document.createElement('a');
      resultItem.href = hotel.link;
      resultItem.className = 'result-item';
      resultItem.innerHTML = `
        <img src="${hotel.image}" alt="${hotel.name}">
        <div class="result-info">
          <h4>${hotel.name}</h4>
          <p>${hotel.city} • ⭐ ${hotel.rating} • R$ ${hotel.price}/noite</p>
        </div>
      `;
      resultsList.appendChild(resultItem);
    });
  }

  searchResults.classList.add('active');
}

// Fechar resultados da busca
function closeSearch() {
  searchResults.classList.remove('active');
  searchInput.value = '';
}


// Busca em tempo real
searchInput.addEventListener('input', () => {
  if (searchInput.value.trim() !== '') {
    performSearch();
  } else {
    closeSearch();
  }
});

// Fechar resultados ao pressionar ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSearch();
  }
});

// Fechar resultados ao clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container') && searchResults.classList.contains('active')) {
    closeSearch();
  }
});

// Buscar ao pressionar Enter
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  console.log('SeaPass - Tela inicial carregada');
});