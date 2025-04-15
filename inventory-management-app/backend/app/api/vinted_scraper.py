import requests
from threading import Thread
import time
from typing import List, Dict
from datetime import datetime, timedelta
from vinted_scraper import VintedScraper
import json
import os

# In-memory cache for scraped products (store with timestamp)
scraped_products: Dict[str, dict] = {}
PRODUCTS_FILE = os.path.join(os.path.dirname(__file__), 'scraped_products.json')
PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x200?text=No+Image"

def save_products():
    try:
        with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(scraped_products, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[VINTED BOT] Error saving products: {e}")

def load_products():
    global scraped_products
    if os.path.exists(PRODUCTS_FILE):
        try:
            with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
                scraped_products = json.load(f)
        except Exception as e:
            print(f"[VINTED BOT] Error loading products: {e}")
            scraped_products = {}

load_products()

def build_vinted_url(keywords: str, max_price: float = None):
    base = "https://www.vinted.co.uk/vetements?search_text=" + requests.utils.quote(keywords)
    if max_price:
        base += f"&price_to={int(max_price)}"
    return base

def scrape_vinted(keywords: str, max_price: float = None) -> List[dict]:
    scraper = VintedScraper("https://www.vinted.co.uk")
    params = {"search_text": keywords}
    if max_price:
        params["price_to"] = int(max_price)
    try:
        items = scraper.search(params)
    except Exception as e:
        print(f"[VINTED BOT] Scraping error: {e}")
        return []
    results = []
    session = requests.Session()
    for item in items:
        image_url = None
        if hasattr(item, "photo") and item.photo:
            image_url = item.photo
        elif hasattr(item, "photos") and item.photos and isinstance(item.photos, list):
            image_url = item.photos[0] if item.photos else None
        elif hasattr(item, "image") and item.image:
            image_url = item.image
        if not image_url or not str(image_url).startswith("http"):
            image_url = PLACEHOLDER_IMAGE
        print(f"[VINTED BOT] Image for '{getattr(item, 'title', '')}': {image_url}")
        # --- Fetch extra details from Vinted API ---
        product_id = getattr(item, 'id', None)
        user_id = None
        seller_rating = None
        seller_feedback_count = None
        view_count = None
        interested_count = None
        condition = None
        size = None
        time_posted = getattr(item, 'created_at', None)
        bump_time = getattr(item, 'bump_time', None)
        try:
            if product_id:
                detail_url = f"https://www.vinted.co.uk/api/v2/items/{product_id}"
                detail_resp = session.get(detail_url)
                if detail_resp.ok:
                    detail_data = detail_resp.json().get('item', {})
                    view_count = detail_data.get('view_count')
                    interested_count = detail_data.get('favorite_count')
                    condition = detail_data.get('status')
                    size = detail_data.get('size_title')
                    user_id = detail_data.get('user_id')
        except Exception as e:
            print(f"[VINTED BOT] Error fetching product details: {e}")
        try:
            if user_id:
                user_url = f"https://www.vinted.co.uk/api/v2/users/{user_id}"
                user_resp = session.get(user_url)
                if user_resp.ok:
                    user_data = user_resp.json().get('user', {})
                    seller_rating = user_data.get('feedback_reputation')
                    seller_feedback_count = user_data.get('feedback_count')
        except Exception as e:
            print(f"[VINTED BOT] Error fetching user details: {e}")
        results.append({
            "title": getattr(item, "title", ""),
            "price": getattr(item, "price", 0),
            "description": getattr(item, "description", ""),
            "image_url": image_url,
            "url": getattr(item, "url", None),
            "timestamp": datetime.utcnow().isoformat(),
            "seller_rating": seller_rating,
            "seller_feedback_count": seller_feedback_count,
            "created_at": time_posted,
            "bump_time": bump_time,
            "view_count": view_count,
            "interested_count": interested_count,
            "condition": condition,
            "size": size
        })
    if not results:
        print("[VINTED BOT] No items found! Check keywords or try again later.")
    return results

def cleanup_old_products():
    cutoff = datetime.utcnow() - timedelta(days=1)
    to_delete = [k for k, v in scraped_products.items() if datetime.fromisoformat(v['timestamp']) < cutoff]
    for k in to_delete:
        scraped_products.pop(k, None)
    save_products()

class VintedBotMonitor(Thread):
    def __init__(self, keywords, max_price=None, interval=30):
        super().__init__(daemon=True)
        self.keywords = keywords
        self.max_price = max_price
        self.interval = interval
        self.running = True
        self.last_seen_ids = set()

    def run(self):
        global scraped_products
        while self.running:
            try:
                products = scrape_vinted(self.keywords, self.max_price)
                new_products = {p['url']: p for p in products if p['url'] not in self.last_seen_ids}
                if new_products:
                    scraped_products.update(new_products)
                    self.last_seen_ids.update(new_products.keys())
                    save_products()
                cleanup_old_products()
            except Exception as e:
                print(f"[VINTED BOT] Monitor error: {e}")
            time.sleep(self.interval)

    def stop(self):
        self.running = False
