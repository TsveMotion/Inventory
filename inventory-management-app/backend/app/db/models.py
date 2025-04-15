from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from app.db.database import Base

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    barcode = Column(String, nullable=True, unique=True, index=True)
    quantity = Column(Integer, nullable=False)
    location = Column(String, nullable=True)
    category = Column(String, nullable=True)
    supplier = Column(String, nullable=True)  # Supplier link
    cost = Column(Float, nullable=True)
    sale_price = Column(Float, nullable=True)
    profit = Column(Float, nullable=True)
    profit_percent = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    date_of_input = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
