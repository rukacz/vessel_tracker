
import json
from playwright.sync_api import sync_playwright

def get_ship_position(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, timeout=60000)

        # Čekání na načtení prvku s polohou - bude potřeba přizpůsobit dle skutečného DOM
        page.wait_for_timeout(5000)  # Jednoduché čekání, ideálně nahradit wait_for_selector

        content = page.content()

        # Zde by přišel parsing obsahu stránky - prozatím jen vracíme HTML
        browser.close()
        return content

if __name__ == "__main__":
    url = "https://www.marinetraffic.com/en/ais/details/ships/shipid:689445/mmsi:352002503/imo:9474199/vessel:FLAMINGO_1"
    html = get_ship_position(url)

data = [
    {
        "ship": "FLAMINGO 1",
        "position": {"lat": 35.1234, "lon": 25.5678},
        "status": "Underway",
        "timestamp": "2025-04-26T20:00:00Z"
    },
    {
        "ship": "PELIKAN",
        "position": {"lat": 41.5678, "lon": 19.7890},
        "status": "Moored",
        "timestamp": "2025-04-26T20:00:00Z"
    },
    {
        "ship": "HARMONY",
        "position": {"lat": 44.1234, "lon": 33.5678},
        "status": "At anchor",
        "timestamp": "2025-04-26T20:00:00Z"
    }
]
    
    with open("public/current_vessels.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print("Stránka stažena.")
