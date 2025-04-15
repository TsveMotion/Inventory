# Inventory Management App

A full-stack inventory management application.

## Tech Stack
- **Frontend:** React + Tailwind CSS
- **Backend:** FastAPI (Python) + SQLAlchemy
- **Database:** SQLite (local)

## Getting Started

### Backend
1. Navigate to `backend/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The server will auto-create the SQLite DB on first run.

### Frontend
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## API Endpoints
- `GET /inventory` - List items
- `POST /inventory` - Add item
- `PUT /inventory/{id}` - Update item
- `DELETE /inventory/{id}` - Delete item

## Auth
Authentication can be added later (JWT-ready structure).

---

## Project Structure
```
frontend/    # React + Tailwind
backend/     # FastAPI + SQLite
```

---

Feel free to extend with more features!
