# playwright_scraper.py
import json
from playwright.sync_api import sync_playwright

# Seznam lodí s názvem a URL
vessels = [
    {
        "name": "FLAMINGO 1",
        "imo": "9474199",
        "mmsi": "352002503",
        "url": "https://www.marinetraffic.com/en/ais/details/ships/shipid:689445/mmsi:352002503/imo:9474199/vessel:FLAMINGO_1"
    },
    {
        "name": "PELIKAN",
        "imo": "9474280",
        "mmsi": "352003347",
        "url": "https://www.marinetraffic.com/en/ais/details/ships/shipid:687201/mmsi:352003347/imo:9474280/vessel:PELIKAN"
    },
    {
        "name": "HARMONY",
        "imo": "9449522",
        "mmsi": "352003307",
        "url": "https://www.marinetraffic.com/en/ais/details/ships/shipid:415530/mmsi:352003307/imo:9449522/vessel:HARMONY"
    }
]

def get_vessel_data(page, vessel):
    print(f"Načítám data pro loď: {vessel['name']}")
    page.goto(vessel['url'], timeout=60000)
    page.wait_for_timeout(5000)  # Lepší by bylo wait_for_selector

    try:
        lat_elem = page.query_selector('meta[property="og:latitude"]')
        lon_elem = page.query_selector('meta[property="og:longitude"]')
        
        lat = lat_elem.get_attribute('content') if lat_elem else None
        lon = lon_elem.get_attribute('content') if lon_elem else None

        status = page.query_selector(".vfix-top").inner_text().strip() if page.query_selector(".vfix-top") else "N/A"
        destination = page.locator("xpath=//td[contains(text(), 'Destination')]/following-sibling::td").first.text_content() or "N/A"
        eta = page.locator("xpath=//td[contains(text(), 'ETA')]/following-sibling::td").first.text_content() or "N/A"
        course = page.locator("xpath=//td[contains(text(), 'Course / Speed')]/following-sibling::td").first.text_content() or "N/A"

        return {
            "name": vessel["name"],
            "imo": vessel["imo"],
            "mmsi": vessel["mmsi"],
            "position": {"lat": lat, "lon": lon} if lat and lon else None,
            "status": status,
            "destination": destination.strip(),
            "eta": eta.strip(),
            "course": course.strip(),
            "lastUpdate":  "2025-04-26T20:00:00Z"
        }
    except Exception as e:
        print(f"Chyba při parsování: {e}")
        return {
            "name": vessel["name"],
            "imo": vessel["imo"],
            "mmsi": vessel["mmsi"],
            "error": str(e),
            "lastUpdate": "2025-04-26T20:00:00Z"
        }

if __name__ == "__main__":
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for vessel in vessels:
            data = get_vessel_data(page, vessel)
            results.append(data)

        browser.close()

    with open("public/current_vessels.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("Data úspěšně uložena do public/current_vessels.json")