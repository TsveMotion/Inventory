from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Always use this fixed path for the SQLite database (Linux server path)
SQLALCHEMY_DATABASE_URL = "sqlite:////home/inventory/inventory/Inventory/inventory-management-app/database/inventory.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
