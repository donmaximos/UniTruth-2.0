import json
import random
import re
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import time

# MOCK DATA ENGINEERING - Python Backend Scraping Script
# This script is designed to extract structured real estate data
# to calculate average student living costs.

def get_average_rent(city_url):
    """
    Scrapes a real estate listing page to extract average rental prices.
    Includes anti-scraping HTTP headers.
    """
    print(f"Scraping URL: {city_url}")
    
    # Comprehensive HTTP headers to mimic a real browser request
    # This helps bypass basic bot detection and HTTP 403 Forbidden errors
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'el-GR,el;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
    }
    
    try:
        response = requests.get(city_url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching page: {e}")
        return None

    soup = BeautifulSoup(response.content, 'html.parser')
    prices = []

    # --- HTML Parsing Logic ---
    # We are looking for price elements. Sites differ, but a common pattern might be:
    # <span class="price">450 €</span> or <div class="listing-price">500€</div>
    # Here we look for elements with classes that typically contain prices.
    # Adjust '.price' or '.listing-price' to match the actual target DOM structure.
    
    price_elements = soup.find_all(['span', 'div'], class_=re.compile(r'price', re.I))
    
    for el in price_elements:
        text = el.get_text(strip=True)
        # Extract numeric values, ignoring currency symbols or extra text
        # Assumes price is a sequence of digits e.g., '450 €' -> '450'
        match = re.search(r'(\d{2,4})', text)
        if match:
            try:
                price = int(match.group(1))
                # Validate realistic student rent range to filter out junk data (100 - 1500 euros)
                if 100 <= price <= 1500:
                    prices.append(price)
            except ValueError:
                continue

    if not prices:
        print("No valid prices found on this page. Check the CSS selectors.")
        return None

    avg_rent = sum(prices) / len(prices)
    return round(avg_rent)


def scrape_hahe_academic_data():
    """
    Simulates scraping PDF reports from ethaae.gr (ΕΘΑΑΕ) to extract academic quality metrics.
    In production, this would use pdfplumber, tabula-py, or OCR to parse nested tables.
    """
    print("[HAHE] Extracting mock N+2 graduation rates and 6-month employment metrics...")
    
    # Mock extracted dataset from HAHE
    academic_metrics = [
        {
            "department_id": "cs_aueb",
            "department_name_greek": "Πληροφορικής (ΟΠΑ)",
            "institution": "ΟΠΑ",
            "city": "Αθήνα",
            "graduation_rate_n_plus_2": 68.4,
            "employment_rate_6m": 89.2,
            "base_points_history": [
                {"year": 2019, "points": 16840},
                {"year": 2020, "points": 17200},
                {"year": 2021, "points": 16954},
                {"year": 2022, "points": 17520},
                {"year": 2023, "points": 17850}
            ]
        },
        {
            "department_id": "det_aueb",
            "department_name_greek": "Διοικητικής Επιστήμης & Τεχνολογίας (ΟΠΑ)",
            "institution": "ΟΠΑ",
            "city": "Αθήνα",
            "graduation_rate_n_plus_2": 82.1,
            "employment_rate_6m": 94.5,
            "base_points_history": [
                {"year": 2019, "points": 17950},
                {"year": 2020, "points": 18100},
                {"year": 2021, "points": 18230},
                {"year": 2022, "points": 18550},
                {"year": 2023, "points": 18880}
            ]
        }
    ]
    
    return academic_metrics


def scrape_real_estate():
    """
    Uses the scraping function to get average rents for specific areas.
    Falls back to mock data if no live data is retrieved.
    """
    # Example target URLs (placeholders)
    targets = [
        {"location_id": "ath_kypseli", "city": "Αθήνα", "neighborhood": "Κυψέλη - Πατήσια (ΟΠΑ/ΕΜΠ)", "url": "https://example.com/rent/athens-kypseli?sqm=0-50"},
        {"location_id": "ath_zografou", "city": "Αθήνα", "neighborhood": "Ζωγράφου - Ιλίσια (ΕΚΠΑ/ΕΜΠ)", "url": "https://example.com/rent/athens-zografou?sqm=0-50"}
    ]
    
    results = []
    for t in targets:
        # Rate limit between requests
        time.sleep(random.uniform(1, 3))
        
        avg_rent = get_average_rent(t["url"])
        
        # If extraction fails (e.g., due to mock URL or anti-scraping blocks), use mock value
        if not avg_rent:
            avg_rent = random.randint(350, 500)
            
        results.append({
            "location_id": t["location_id"],
            "city": t["city"],
            "neighborhood": t["neighborhood"],
            "avg_rent_under_50sqm": avg_rent,
            "avg_living_cost_monthly": avg_rent + 50, # Rough estimate
            "transport_cost": round(random.uniform(15, 40))
        })
        
    return results


def main():
    print("Starting UniTruth Data Extraction Pipeline...")
    
    academic_data = scrape_hahe_academic_data()
    real_estate_data = scrape_real_estate()
    
    final_payload = {
        "metadata": {
            "last_updated": datetime.now().isoformat(),
            "sources": ["ethaae.gr", "listing_sites"]
        },
        "academic_metrics": academic_data,
        "real_estate_index": real_estate_data
    }
    
    output_file = "unitruth_crawled_data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_payload, f, ensure_ascii=False, indent=2)
        
    print(f"Extraction complete. Data dumped to {output_file}.")

if __name__ == "__main__":
    main()
