// Data pro lodě a materiály
const shipsData = [
  {
    name: "FLAMINGO 1",
    position: [19.66614, 57.71341],
    color: "#ff7043",
    imo: "IMO 9474199",
    status: "V přístavu, operuje",
    destination: "Szczecin, Poland",
    eta: "2025-05-28",
    course: 0,
    speed: 10,
    cargo: "HADEED 4",
    loadingPort: "FUJAIRAH"
  },
  {
    name: "PELIKAN",
    position: [24.20157, 58.07892],
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
    position: [36.18681, -2,37967],
    color: "#66bb6a",
    imo: "IMO 9449522",
    status: "Underway - před Gibraltarem",
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

// Funkce volaná po načtení DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  fillLegacyPlaceholders();
  // Aktualizace grafu, pokud je k dispozici
  if (window.updateInventoryChart) {
    window.updateInventoryChart(materialsData);
  }
});

function initMap() {
  // Nastavení základní mapy se zaměřením zahrnujícím Evropu a Blízký východ
  map = L.map('map').setView([40.0, 40.0], 4);
  
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
        // <p><strong>${ship.imo}</strong></p>
        // <p><strong>Status:</strong> ${ship.status}</p>
        <p><strong>Cargo:</strong> ${ship.cargo}</p>
        <p><strong>Loading port:</strong> ${ship.loadingPort}</p>
        <p><strong>Destination:</strong> ${ship.destination}</p>
        // <p><strong>ETA:</strong> ${ship.eta}</p>
        <p><strong>Course/Speed:</strong> ${ship.course}° / ${ship.speed} knots</p>
      </div>
    `;
    
    // Přidání popup k markeru
    marker.bindPopup(popupContent);
    
    // Přidání popisku (tooltip) ke každé lodi, který se zobrazí při najetí myší
    marker.bindTooltip(ship.name, {
      permanent: true,
      direction: 'top',
      className: 'ship-tooltip',
      offset: [0, -10]
    });
    
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
  
  // Vytvoříme samostatný kontejner pro informace pod mapou
  const shipInfoContainer = document.getElementById('ship-info-container');
  if (shipInfoContainer) {
    shipInfoContainer.innerHTML = '';
    
    // Vytvoření informačního boxu pro každou loď, který bude vždy viditelný
    shipsData.forEach(ship => {
      const infoBox = document.createElement('div');
      infoBox.className = 'ship-info-box';
      infoBox.style.borderColor = ship.color;
      
      infoBox.innerHTML = `
        <h4>${ship.name}</h4>
        <p><strong>Status:</strong> ${ship.status}</p>
        <p><strong>Destination:</strong> ${ship.destination}</p>
        <p><strong>ETA:</strong> ${ship.eta}</p>
      `;
      
      // Přidání události kliknutí pro centrování mapy na danou loď
      infoBox.addEventListener('click', () => {
        map.setView(ship.position, 8);
        shipMarkers[ship.name].openPopup();
      });
      
      shipInfoContainer.appendChild(infoBox);
    });
  }
}

/* === doplněk pro staré placeholdery v HTML === */
function fillLegacyPlaceholders() {
  shipsData.forEach(ship => {
    const base = ship.name.toLowerCase().replace(/\s+/g, '-');

    const set = (suffix, txt) => {
      const el = document.getElementById(`${base}-${suffix}`);
      if (el) el.textContent = txt;
    };

    set('position',
        `Pozice: ${ship.position[0].toFixed(4)}° N, ${ship.position[1].toFixed(4)}° E`);
    set('status',       `Status: ${ship.status}`);
    set('destination',  `Cíl: ${ship.destination}`);
    set('eta',          `ETA: ${ship.eta}`);
    set('cargo',       `Náklad: ${ship.cargo}`);
  });
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
