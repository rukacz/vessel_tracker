// vessel-tracker-script.js
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
  console.log(`Otevírám prohlížeč pro získání dat o lodi ${vessel.name}...`);
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']  // Nutné pro GitHub Actions
  });
  
  try {
    console.log(`Vytvářím novou stránku pro ${vessel.name}...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigace na stránku lodi
    const url = `https://www.vesselfinder.com/vessels/${vessel.name.replace(/ /g, '-')}-IMO-${vessel.imo}-MMSI-${vessel.mmsi}`;
    console.log(`Načítám data pro loď ${vessel.name} z URL: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log(`Stránka pro ${vessel.name} byla načtena`);
    
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
    
    console.log(`Data pro ${vessel.name} úspěšně získána:`, JSON.stringify(vesselData).substring(0, 200) + '...');
    
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
    console.log(`Prohlížeč pro ${vessel.name} zavřen`);
  }
}

// Hlavní funkce pro sledování všech lodí
async function trackVessels() {
  console.log('Začínám sledování lodí...');
  
  // Kontrola a vytvoření adresáře public
  console.log('Pracovní adresář:', process.cwd());
  const publicDir = path.join(process.cwd(), 'public');
  console.log('Cesta k adresáři public:', publicDir);
  
  if (!fs.existsSync(publicDir)) {
    console.log('Vytvářím adresář public...');
    fs.mkdirSync(publicDir, { recursive: true });
  } else {
    console.log('Adresář public již existuje');
  }
  
  // Získání dat pro všechny lodě
  const results = [];
  for (const vessel of vessels) {
    const data = await getVesselData(vessel);
    results.push(data);
  }
  
  // Ukládání souboru se všemi aktuálními daty
  const currentDataFile = path.join(publicDir, 'current_vessels.json');
  console.log(`Ukládám aktuální data do: ${currentDataFile}`);
  fs.writeFileSync(currentDataFile, JSON.stringify(results, null, 2));
  
  // Ukládání historických dat
  const historyFile = path.join(publicDir, 'vessels_history.json');
  let history = [];
  
  if (fs.existsSync(historyFile)) {
    try {
      console.log(`Načítám existující historii z: ${historyFile}`);
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    } catch (e) {
      console.error('Chyba při čtení historie:', e);
    }
  }
  
  // Přidání nového záznamu
  history.push({
    timestamp: new Date().toISOString(),
    vessels: results
  });
  
  console.log(`Ukládám aktualizovanou historii do: ${historyFile}`);
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  
  // Vypsání obsahu adresáře pro kontrolu
  console.log('Obsah adresáře public:');
  const files = fs.readdirSync(publicDir);
  console.log(files);
  
  console.log('Sledování lodí dokončeno. Data uložena.');
  return results;
}

// Spuštění sledování
trackVessels()
  .then(() => {
    console.log("Skript úspěšně dokončen");
  })
  .catch(error => {
    console.error("Kritická chyba při běhu skriptu:", error);
    process.exit(1);
  });
