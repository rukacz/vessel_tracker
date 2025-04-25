// vessel-tracker.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Konfigurace sledovaných lodí
const vessels = [
  { name: 'FLAMINGO 1', imo: '9474199', mmsi: '352002503' },
  { name: 'PELIKAN', imo: '9474280', mmsi: '352003347' },
  { name: 'HARMONY', imo: '9449522', mmsi: '352003307' }
];

// Funkce pro získání dat o lodi
async function getVesselData(vessel) {
  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigace na stránku lodi
    const url = `https://www.vesselfinder.com/vessels/${vessel.name.replace(/ /g, '-')}-IMO-${vessel.imo}-MMSI-${vessel.mmsi}`;
    console.log(`Načítám data pro loď ${vessel.name} z URL: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Získání dat o lodi
    const vesselData = await page.evaluate(() => {
      // Funkce pro čistění textu
      const cleanText = text => text ? text.trim() : null;
      
      // Pokus o získání pozice
      let lat = null;
      let lon = null;
      
      // Zkusíme získat souřadnice z meta tagů
      const latMeta = document.querySelector('meta[property="og:latitude"]');
      const lonMeta = document.querySelector('meta[property="og:longitude"]');
      
      if (latMeta && lonMeta) {
        lat = latMeta.getAttribute('content');
        lon = lonMeta.getAttribute('content');
      }
      
      // Nebo zkusíme získat souřadnice z textu na stránce
      const positionElement = document.querySelector('.coordinate');
      if (positionElement) {
        const posText = positionElement.textContent.trim();
        const posMatch = posText.match(/([0-9.]+)°\s*([NS])\s*\/\s*([0-9.]+)°\s*([EW])/);
        if (posMatch) {
          lat = posMatch[1] * (posMatch[2] === 'S' ? -1 : 1);
          lon = posMatch[3] * (posMatch[4] === 'W' ? -1 : 1);
        }
      }
      
      // Získání dalších informací
      const status = cleanText(document.querySelector('.vfix-top')?.textContent);
      const destination = cleanText(document.querySelector('td:contains("Destination") + td')?.textContent);
      const eta = cleanText(document.querySelector('td:contains("ETA") + td')?.textContent);
      const course = cleanText(document.querySelector('td:contains("Course / Speed") + td')?.textContent);
      
      return {
        position: lat && lon ? { lat, lon } : null,
        status,
        destination,
        eta,
        course,
        lastUpdate: new Date().toISOString()
      };
    });
    
    return {
      ...vessel,
      ...vesselData
    };
  } catch (error) {
    console.error(`Chyba při získávání dat pro loď ${vessel.name}:`, error);
    return {
      ...vessel,
      error: error.message,
      lastUpdate: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}

// Hlavní funkce pro sledování všech lodí
async function trackVessels() {
  console.log('Začínám sledování lodí...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dataDir = path.join(__dirname, 'data');
  
  // Vytvoření adresáře pro data, pokud neexistuje
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Získání dat pro všechny lodě
  const results = [];
  for (const vessel of vessels) {
    const data = await getVesselData(vessel);
    results.push(data);
    
    // Ukládání individuálních dat o lodi
    fs.writeFileSync(
      path.join(dataDir, `${vessel.name.replace(/ /g, '_')}_${timestamp}.json`),
      JSON.stringify(data, null, 2)
    );
  }
  
  // Ukládání souboru se všemi aktuálními daty
  fs.writeFileSync(
    path.join(dataDir, 'current_vessels.json'),
    JSON.stringify(results, null, 2)
  );
  
  // Ukládání historických dat
  const historyFile = path.join(dataDir, 'vessels_history.json');
  let history = [];
  
  if (fs.existsSync(historyFile)) {
    try {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    } catch (e) {
      console.error('Chyba při čtení historie:', e);
    }
  }
  
  history.push({
    timestamp: new Date().toISOString(),
    vessels: results
  });
  
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  
  console.log('Sledování lodí dokončeno. Data uložena.');
  return results;
}

// Spuštění sledování
trackVessels().catch(console.error);

// Plánované opakované spouštění (např. 2x denně)
// Pokud chcete skript spouštět automaticky 2x denně, odkomentujte následující kód:
/*
const schedule = require('node-schedule');

// Naplánování spuštění v 8:00 a 20:00 každý den
schedule.scheduleJob('0 8,20 * * *', function() {
  trackVessels().catch(console.error);
});

console.log('Skript pro sledování lodí je spuštěn a bude automaticky získávat data v 8:00 a 20:00.');
*/

module.exports = { trackVessels, getVesselData, vessels };
