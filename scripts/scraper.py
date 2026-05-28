import json
import random
from bs4 import BeautifulSoup
import requests

# This is a theoretical example of scraping real estate data and standardizing academic data.
# In a real environment, you'd target specific platforms like Spitogatos or proper academic registers.

def scrape_real_estate_data():
    """
    Theoretical scraper for a real estate listings site to get average rent for apartments < 50sqm.
    """
    cities_to_scrape = [
        {"city": "Αθήνα", "neighborhood": "Ζωγράφου", "location_id": "athens_zografou", "safety_score": 4.1, "living_cost": 350},
        {"city": "Πάτρα", "neighborhood": "Κέντρο", "location_id": "patras_center", "safety_score": 4.5, "living_cost": 280},
        {"city": "Θεσσαλονίκη", "neighborhood": "Κέντρο", "location_id": "thessaloniki_kentro", "safety_score": 4.0, "living_cost": 320}
    ]
    
    financial_data = []

    for loc in cities_to_scrape:
        # Theoretical URL
        """
        url = f"https://example-real-estate.gr/search?city={loc['city']}&sqm_max=50"
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        prices_elements = soup.find_all('span', class_='price-value')
        prices = [int(p.text.replace('€', '').replace('.', '')) for p in prices_elements]
        avg_rent = sum(prices) // len(prices) if prices else 0
        """
        
        # Simulating scraped average rent under 50sqm
        if loc["city"] == "Αθήνα":
            simulated_avg_rent = 450
        elif loc["city"] == "Πάτρα":
            simulated_avg_rent = 320
        else:
            simulated_avg_rent = 400
            
        financial_data.append({
            "location_id": loc["location_id"],
            "city": loc["city"],
            "neighborhood": loc["neighborhood"],
            "avg_rent_under_50sqm": simulated_avg_rent,
            "avg_living_cost_monthly": loc["living_cost"],
            "safety_score": loc["safety_score"]
        })

    return financial_data

def get_academic_data():
    """
    Simulates parsing data from an academic API or dataset (like ETHAAE).
    """
    return [
        {
            "department_id": "det_aueb",
            "name": "Διοικητικής Επιστήμης και Τεχνολογίας",
            "university": "ΟΠΑ (AUEB)",
            "graduation_rate": 78.5,
            "employment_rate_6m": 92.4,
            "theory_vs_lab_ratio": {
                "theory": 40,
                "lab": 60
            },
            "base_points_history": [
                {"year": 2019, "points": 17950},
                {"year": 2020, "points": 18200},
                {"year": 2021, "points": 18450},
                {"year": 2022, "points": 18100},
                {"year": 2023, "points": 18350}
            ]
        },
        {
            "department_id": "cs_ekpa",
            "name": "Πληροφορικής και Τηλεπικοινωνιών",
            "university": "ΕΚΠΑ",
            "graduation_rate": 65.2,
            "employment_rate_6m": 88.7,
            "theory_vs_lab_ratio": {
                "theory": 60,
                "lab": 40
            },
            "base_points_history": [
                {"year": 2019, "points": 17150},
                {"year": 2020, "points": 17400},
                {"year": 2021, "points": 17650},
                {"year": 2022, "points": 17300},
                {"year": 2023, "points": 17550}
            ]
        },
        {
            "department_id": "ece_ntua",
            "name": "Ηλεκτρολόγων Μηχανικών και Μηχανικών Υπολογιστών",
            "university": "ΕΜΠ (NTUA)",
            "graduation_rate": 55.4,
            "employment_rate_6m": 95.1,
            "theory_vs_lab_ratio": {
                "theory": 50,
                "lab": 50
            },
            "base_points_history": [
                {"year": 2019, "points": 18300},
                {"year": 2020, "points": 18450},
                {"year": 2021, "points": 18850},
                {"year": 2022, "points": 18600},
                {"year": 2023, "points": 18800}
            ]
        }
    ]

def main():
    print("Gathering academic data...")
    academic_data = get_academic_data()
    
    print("Scraping real estate data...")
    financial_data = scrape_real_estate_data()
    
    database = {
        "university_departments": academic_data,
        "real_estate_costs": financial_data
    }
    
    output_file = "../src/data/mock_db.json"
    print(f"Writing to {output_file}...")
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(database, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully generated database with {len(academic_data)} departments and {len(financial_data)} locations.")

if __name__ == "__main__":
    main()
