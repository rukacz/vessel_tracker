// Data pro lodě a materiály
const shipsData = [
  {
    name: "FLAMINGO 1",
    position: [19.44661, 57.47127],
    color: "#ff7043",
    imo: "IMO 9474199",
    status: "Underway using engine",
    destination: "Szczecin, Poland",
    eta: "2025-05-28",
    course: 0,
    speed: 10,
    cargo: "HADEED 4",
    loadingPort: "FUJAIRAH"
  },
  {
    name: "PELIKAN",
    position: [24.12094, 58.04735],
    color: "#42a5f5",
    imo: "IMO (neznámé)",
    status: "Plánovaná nakládka",
    destination: "Swinoujscie, Poland",
    eta: "2025-06-12",
    course: 0,
    speed: 0,
    cargo: "HADEED 5",
    loadingPort: "FUJAIRAH"
  },
  {
    name: "HARMONY",
    position: [37.24649, 5.36620],
    color: "#66bb6a",
    imo: "IMO 9449522",
    status: "Underway - pod Sardinií",
    destination: "Swinoujscie, Poland",
    eta: "2025-05-08",
    course: 0,
    speed: 10,
    cargo: "HADEED 3",
    loadingPort: "FUJAIRAH"
  }
];

const materialsData = [
  {
    type: "Bramy HADEED 3",
    currentAmount: 0,
    expectedAmount: 2500,
    sourceShip: "HARMONY",
    deliveryDate: "2025-05-08"
  },
  {
    type: "Bramy HADEED 4",
    currentAmount: 0,
    expectedAmount: 1800,
    sourceShip: "FLAMINGO 1",
    deliveryDate: "2025-05-28"
  },
  {
    type: "Bramy HADEED 5",
    currentAmount: 0,
    expectedAmount: 1500,
    sourceShip: "PELIKAN",
    deliveryDate: "2025-06-12"
  }
];

// Inicializace mapy
let map;
let shipMarkers = {};

function initMap() {
  // Nastavení základní mapy se zaměřením na Evropu
  map = L.map('map').setView([42.0, 25.0], 5);
  
  // Přidání tile vrstvy - OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);
  
  // Zobrazení lodí na mapě
  displayShips();
  
  // Aktualizace informací o lodích v kartách
  updateShipCards();
  
  // Naplnění tabulky se zásobami
  fillInventoryTable();
}

// Funkce pro zobrazení lodí na mapě
function displayShips() {
  shipsData.forEach(ship => {
    // Vytvoření ikony pro marker
    const shipIcon = L.divIcon({
      className: 'ship-marker',
      html: `<div style="background-color: ${ship.color}; width: 20px; height: 20px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 8px;">SHIP</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    // Vytvoření markeru a přidání na mapu
    const marker = L.marker(ship.position, {icon: shipIcon}).addTo(map);
    
    // Text pro popup
    const popupContent = `
      <div class="ship-popup">
        <h3>${ship.name}</h3>
        <p><strong>${ship.imo}</strong></p>
        <p><strong>Status:</strong> ${ship.status}</p>
        <p><strong>Destination:</strong> ${ship.destination}</p>
        <p><strong>ETA:</strong> ${ship.eta}</p>
        <p><strong>Course/Speed:</strong> ${ship.course}° / ${ship.speed} knots</p>
      </div>
    `;
    
    // Přidání popup k markeru
    marker.bindPopup(popupContent);
    
    // Uložení markeru pro pozdější použití
    shipMarkers[ship.name] = marker;
  });
}

// Funkce pro aktualizaci informací o lodích v kartách
function updateShipCards() {
  const shipCardsContainer = document.getElementById('ship-cards');
  
  // Vymazání stávajícího obsahu
  if (shipCardsContainer) {
    shipCardsContainer.innerHTML = '';
    
    // Vytvoření karet pro každou loď
    shipsData.forEach(ship => {
      const shipCard = document.createElement('div');
      shipCard.className = 'ship-card';
      shipCard.style.borderLeft = `5px solid ${ship.color}`;
      
      shipCard.innerHTML = `
        <h3>${ship.name}</h3>
        <p><strong>Position:</strong> ${ship.position[0].toFixed(4)}° N, ${ship.position[1].toFixed(4)}° E</p>
        <p><strong>Status:</strong> ${ship.status}</p>
        <p><strong>Cargo:</strong> ${ship.cargo}</p>
        <p><strong>Destination:</strong> ${ship.destination}</p>
        <p><strong>ETA:</strong> ${ship.eta}</p>
      `;
      
      // Přidání události kliknutí pro centrování mapy na danou loď
      shipCard.addEventListener('click', () => {
        map.setView(ship.position, 8);
        shipMarkers[ship.name].openPopup();
      });
      
      shipCardsContainer.appendChild(shipCard);
    });
  }
}

// Funkce pro naplnění tabulky se zásobami
function fillInventoryTable() {
  const inventoryTable = document.getElementById('inventory-table');
  
  if (inventoryTable) {
    // Vytvoření hlavičky tabulky
    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
      <tr>
        <th>Materiál</th>
        <th>Aktuální množství</th>
        <th>Očekávané množství</th>
        <th>Zdrojová loď</th>
        <th>Datum dodání</th>
      </tr>
    `;
    
    // Vytvoření těla tabulky
    const tableBody = document.createElement('tbody');
    
    materialsData.forEach(material => {
      const row = document.createElement('tr');
      
      // Nalezení barvy lodi pro barevné označení řádku
      const shipColor = shipsData.find(ship => ship.name === material.sourceShip)?.color || '#cccccc';
      
      row.innerHTML = `
        <td>${material.type}</td>
        <td>${material.currentAmount} t</td>
        <td>${material.expectedAmount} t</td>
        <td style="color: ${shipColor}; font-weight: bold;">${material.sourceShip}</td>
        <td>${material.deliveryDate}</td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // Přidání hlavičky a těla do tabulky
    inventoryTable.innerHTML = '';
    inventoryTable.appendChild(tableHeader);
    inventoryTable.appendChild(tableBody);
  }
}

// CSS styly pro aplikaci
function addCustomStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .ship-card {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .ship-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .ship-popup h3 {
      margin-top: 0;
      margin-bottom: 5px;
    }
    
    .ship-popup p {
      margin: 5px 0;
    }
    
    #inventory-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    #inventory-table th, #inventory-table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    
    #inventory-table th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    
    #inventory-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    #inventory-table tr:hover {
      background-color: #f0f0f0;
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Inicializace aplikace po načtení stránky
document.addEventListener('DOMContentLoaded', () => {
  addCustomStyles();
  initMap();
});
