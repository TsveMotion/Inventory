import requests
from fastapi import APIRouter, Query
from typing import List, Optional
from bs4 import BeautifulSoup
import sqlite3
import os
from .vinted_scraper import VintedScraper

router = APIRouter()

# Path to the Vinted-Scraper DB and downloads folder
SCRAPER_DB = os.path.join(os.path.dirname(__file__), 'Vinted-Scraper', 'vinted.db')
DOWNLOADS_DIR = os.path.join(os.path.dirname(__file__), 'Vinted-Scraper', 'downloads')

def get_scraper():
    import importlib.util
    scraper_path = os.path.join(os.path.dirname(__file__), 'Vinted-Scraper', 'scraper.py')
    spec = importlib.util.spec_from_file_location('scraper', scraper_path)
    scraper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(scraper)
    return scraper

@router.get("/vinted-bot")
def vinted_bot(
    user_id: Optional[str] = Query(None, description="Vinted User ID to scrape")
):
    if not user_id:
        return {"error": "You must provide a Vinted user_id to scrape."}

    # Dynamically import and run the scraper for the user (downloads images, updates DB)
    scraper = get_scraper()
    scraper.scrape_vinted_user(user_id)

    # Query the DB for products
    conn = sqlite3.connect(SCRAPER_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, price, description, images, url FROM vinted_products WHERE user_id = ? ORDER BY id DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()

    products = []
    for row in rows:
        prod_id, title, price, description, images, url = row
        # Get first image path if available
        image_path = None
        if images:
            image_list = images.split(',')
            if image_list:
                image_path = os.path.join(DOWNLOADS_DIR, image_list[0].strip())
        products.append({
            "id": prod_id,
            "title": title,
            "price": price,
            "description": description,
            "image_url": f"/static/vinted/{os.path.basename(image_path)}" if image_path else None,
            "url": url,
        })

    return {"products": products}

# --- NEW: Keyword/price search endpoint ---
@router.get("/vinted-bot-search")
def vinted_bot_search(
    keywords: str = Query(..., description="Keywords to search for"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    sort: str = Query("newest", description="Sort order: newest, oldest, price_asc, price_desc")
):
    user_agent = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )
    scraper = VintedScraper("https://www.vinted.co.uk", agent=user_agent)
    products = scraper.search_products(keywords, max_price=max_price, min_price=min_price)
    def safe_created_at(x):
        val = x.get("created_at")
        if val is None:
            # Use 0 for oldest, or a far past timestamp
            return 0
        return val
    if sort == "newest":
        products.sort(key=safe_created_at, reverse=True)
    elif sort == "oldest":
        products.sort(key=safe_created_at)
    elif sort == "price_asc":
        products.sort(key=lambda x: x.get("price", 0))
    elif sort == "price_desc":
        products.sort(key=lambda x: x.get("price", 0), reverse=True)
    print(f"[DEBUG] Returning products: {len(products)} (sorted by {sort}, min_price={min_price})")
    return {"products": products}
