from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="MyApp API", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    name: str
    description: str = None

# In-memory storage
items = []

@app.get("/")
def root():
    return {"message": "Welcome to FastAPI Backend!", "version": "1.0.0"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/items")
def get_items():
    return {"items": items}

@app.post("/api/items")
def create_item(item: Item):
    items.append(item.dict())
    return {"message": "Item created", "item": item}

@app.get("/api/info")
def get_info():
    return {
        "app": "FastAPI Backend",
        "framework": "FastAPI",
        "python_version": "3.11",
        "items_count": len(items)
    }
