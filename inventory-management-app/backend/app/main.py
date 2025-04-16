from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api import inventory
from app.api import vinted_bot

app = FastAPI()

# Allow all origins (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Credentials cannot be used with allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for Vinted images
downloads_dir = os.path.join(os.path.dirname(__file__), "api", "Vinted-Scraper", "downloads")
app.mount(
    "/static/vinted",
    StaticFiles(directory=downloads_dir),
    name="vinted_static"
)

# Include routers
app.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
app.include_router(vinted_bot.router, tags=["VintedBot"])

@app.get("/")
def root():
    return {"message": "Inventory Management API is running."}
