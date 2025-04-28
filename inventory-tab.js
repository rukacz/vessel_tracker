// JavaScript pro záložku "Stav zásob"

document.addEventListener('DOMContentLoaded', function() {
    // Funkce pro přepínání mezi kritickými obdobími
    initPeriodTabs();
});

/**
 * Inicializace přepínačů kritických období
 */
function initPeriodTabs() {
    // Získáme všechny přepínače období
    const periodTabs = document.querySelectorAll('.period-tab');
    
    // Přidáme event listener na každý přepínač
    periodTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Odstraníme třídu active ze všech přepínačů
            periodTabs.forEach(t => t.classList.remove('active'));
            
            // Přidáme třídu active na aktuálně kliknutý přepínač
            this.classList.add('active');
            
            // Získáme ID období z data-period atributu
            const periodId = this.getAttribute('data-period');
            
            // Skryjeme všechny obsahy období
            const periodContents = document.querySelectorAll('.period-content');
            periodContents.forEach(content => content.classList.remove('active'));
            
            // Zobrazíme obsah pro vybrané období
            const selectedContent = document.getElementById(`${periodId}-content`);
            if (selectedContent) {
                selectedContent.classList.add('active');
            }
        });
    });
}

/**
 * Funkce pro aktualizaci metrik kritických období
 * Tato funkce může být později použita pro aktualizaci dat z externího zdroje
 * @param {string} periodId - ID období ('w17' nebo 'w23')
 * @param {Object} metrics - Objekt s metrikami pro dané období
 */
function updatePeriodMetrics(periodId, metrics) {
    const contentElement = document.getElementById(`${periodId}-content`);
    if (!contentElement) return;
    
    // Aktualizace minimálního stavu zásob
    const minStockElement = contentElement.querySelector('.metric-card.danger .metric-value');
    if (minStockElement && metrics.minStock) {
        minStockElement.textContent = `${metrics.minStock} t`;
    }
    
    // Aktualizace data kritického stavu
    const dateElement = contentElement.querySelector('.metric-card.danger .metric-date');
    if (dateElement && metrics.criticalDate) {
        dateElement.textContent = metrics.criticalDate;
    }
    
    // Aktualizace deficitu zásob
    const deficitElement = contentElement.querySelector('.metric-card.info .metric-value');
    if (deficitElement && metrics.deficit) {
        deficitElement.textContent = `${metrics.deficit} t`;
    }
}

/**
 * Funkce pro přidání nové události do časové osy
 * @param {string} periodId - ID období ('w17' nebo 'w23')
 * @param {Object} event - Objekt s informacemi o události
 */
function addTimelineEvent(periodId, event) {
    const timeline = document.querySelector(`#${periodId}-content .timeline`);
    if (!timeline) return;
    
    // Vytvoření nového prvku časové osy
    const eventItem = document.createElement('div');
    eventItem.className = 'timeline-item';
    
    // Přidání HTML obsahu
    eventItem.innerHTML = `
        <div class="timeline-date">${event.date}</div>
        <div class="timeline-content ${event.isWarning ? 'warning' : ''}">
            <h4>${event.title}</h4>
            <p>${event.description}</p>
        </div>
    `;
    
    // Přidání prvku do časové osy
    timeline.appendChild(eventItem);
}

// Příklad použití funkcí pro aktualizaci dat
/*
// Aktualizace metrik pro období W17
updatePeriodMetrics('w17', {
    minStock: 2800,
    criticalDate: '22.4.2025',
    deficit: 3200
});

// Přidání nové události do časové osy období W17
addTimelineEvent('w17', {
    date: '5.5.2025',
    title: 'Mimořádná dodávka materiálu',
    description: 'Letecká přeprava 500 tun materiálu',
    isWarning: false
});
*/
