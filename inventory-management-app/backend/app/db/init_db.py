from .database import Base, engine
from .models import Inventory

# Create tables
Base.metadata.create_all(bind=engine)
