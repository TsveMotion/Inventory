from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import database, models
from app.models.inventory import Inventory, InventoryCreate, InventoryUpdate
from datetime import datetime
import random
import string

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[Inventory])
def read_inventory(db: Session = Depends(get_db)):
    return db.query(models.Inventory).all()

@router.post("/", response_model=Inventory)
def create_inventory(item: InventoryCreate, db: Session = Depends(get_db)):
    # Generate barcode if not provided
    barcode = ''.join(random.choices(string.digits, k=12))
    # Calculate profit and profit percent
    cost = item.cost or 0
    sale_price = item.sale_price or 0
    profit = sale_price - cost
    profit_percent = (profit / cost * 100) if cost else 0
    db_item = models.Inventory(
        item_name=item.item_name,
        barcode=barcode,
        quantity=item.quantity,
        location=item.location,
        category=item.category,
        supplier=item.supplier,
        cost=cost,
        sale_price=sale_price,
        profit=profit,
        profit_percent=profit_percent,
        notes=item.notes,
        date_of_input=datetime.now()
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return Inventory(**db_item.__dict__)

@router.put("/{item_id}", response_model=Inventory)
def update_inventory(item_id: int, item: InventoryUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.Inventory).filter(models.Inventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in item.dict(exclude_unset=True).items():
        setattr(db_item, key, value)
    # Recalculate profit and profit percent if cost or sale_price changed
    if item.cost is not None or item.sale_price is not None:
        cost = item.cost if item.cost is not None else db_item.cost
        sale_price = item.sale_price if item.sale_price is not None else db_item.sale_price
        profit = (sale_price or 0) - (cost or 0)
        profit_percent = (profit / cost * 100) if cost else 0
        db_item.profit = profit
        db_item.profit_percent = profit_percent
    db.commit()
    db.refresh(db_item)
    return Inventory(**db_item.__dict__)

@router.get("/barcode/{barcode}")
def get_inventory_by_barcode(barcode: str, db: Session = Depends(get_db)):
    db_item = db.query(models.Inventory).filter(models.Inventory.barcode == barcode).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {
        "id": db_item.id,
        "item_name": db_item.item_name,
        "barcode": db_item.barcode,
        "quantity": db_item.quantity,
        "location": db_item.location,
        "category": db_item.category,
        "supplier": db_item.supplier,
        "cost": db_item.cost,
        "sale_price": db_item.sale_price,
        "date_of_input": db_item.date_of_input,
    }

@router.delete("/{item_id}")
def delete_inventory(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.Inventory).filter(models.Inventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}

@router.post("/scan")
def scan_inventory(payload: dict, db: Session = Depends(get_db)):
    barcode = payload.get("barcode")
    quantity = int(payload.get("quantity", 1))
    mode = payload.get("mode")  # "in" or "out"
    db_item = db.query(models.Inventory).filter(models.Inventory.barcode == barcode).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if mode == "in":
        db_item.quantity += quantity
        db.commit()
        return {"message": f"Added {quantity} to {db_item.item_name}. New quantity: {db_item.quantity}"}
    elif mode == "out":
        if db_item.quantity < quantity:
            raise HTTPException(status_code=400, detail="Not enough quantity in stock.")
        db_item.quantity -= quantity
        db.commit()
        return {"message": f"Removed {quantity} from {db_item.item_name}. New quantity: {db_item.quantity}"}
    else:
        raise HTTPException(status_code=400, detail="Invalid mode. Use 'in' or 'out'.")
