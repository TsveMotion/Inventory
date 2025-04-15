from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryBase(BaseModel):
    item_name: str
    barcode: Optional[str] = None
    quantity: int
    location: Optional[str] = None
    category: Optional[str] = None
    supplier: Optional[str] = None
    cost: Optional[float] = None
    sale_price: Optional[float] = None
    profit: Optional[float] = None
    profit_percent: Optional[float] = None
    notes: Optional[str] = None
    date_of_input: Optional[datetime] = None

class InventoryCreate(BaseModel):
    item_name: str
    quantity: int
    location: Optional[str] = None
    category: Optional[str] = None
    supplier: Optional[str] = None
    cost: Optional[float] = None
    sale_price: Optional[float] = None
    notes: Optional[str] = None

class InventoryUpdate(BaseModel):
    item_name: Optional[str] = None
    quantity: Optional[int] = None
    location: Optional[str] = None
    category: Optional[str] = None
    supplier: Optional[str] = None
    cost: Optional[float] = None
    sale_price: Optional[float] = None
    notes: Optional[str] = None

class Inventory(InventoryBase):
    id: int
    last_updated: datetime

    class Config:
        orm_mode = True
