
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
    with open("output.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Stránka stažena.")
