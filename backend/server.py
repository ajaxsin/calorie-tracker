from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class MealCreate(BaseModel):
    meal_text: str = Field(min_length=3, max_length=2000)
    segment: str
    date: str
    calories: float = Field(ge=0)
    protein: float = Field(ge=0)
    carbs: float = Field(ge=0)
    fibre: float = Field(ge=0)
    fats: float = Field(ge=0)
    confidence: Optional[float] = None

class EstimateRequest(BaseModel):
    meal_text: str = Field(min_length=3, max_length=2000)

class MealOut(MealCreate):
    id: str
    created_at: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "NutriPaste API"}

@api_router.post("/nutrition/estimate")
async def estimate_nutrition(input: EstimateRequest):
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise HTTPException(status_code=503, detail="Nutrition AI is not configured")
    system = """You estimate nutrition for one meal. Return ONLY valid JSON with keys calories, protein, carbs, fibre, fats, confidence, note. Use numeric values in kcal and grams. Make reasonable standard-portion assumptions, be conservative, and mention assumptions briefly in note. No markdown."""
    prompt = f"Estimate this meal: {input.meal_text}"
    chat = LlmChat(api_key=key, session_id=f"nutrition-{uuid.uuid4()}", system_message=system).with_model("openai", "gpt-5.4")
    raw = ""
    try:
        async for event in chat.stream_message(UserMessage(text=prompt)):
            if isinstance(event, TextDelta):
                raw += event.content
            elif isinstance(event, StreamDone):
                break
        cleaned = raw.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned)
        required = ["calories", "protein", "carbs", "fibre", "fats"]
        if any(key not in data for key in required):
            raise ValueError("Missing nutrition fields")
        return {**data, "calories": round(float(data["calories"])), "protein": round(float(data["protein"]), 1), "carbs": round(float(data["carbs"]), 1), "fibre": round(float(data["fibre"]), 1), "fats": round(float(data["fats"]), 1)}
    except Exception as exc:
        logger.exception("Nutrition estimate failed")
        raise HTTPException(status_code=502, detail="Could not estimate this meal. Please try again.") from exc

@api_router.post("/meals", response_model=MealOut)
async def create_meal(input: MealCreate):
    if input.segment not in {"Breakfast", "Lunch", "Dinner", "Snacks"}:
        raise HTTPException(status_code=400, detail="Invalid meal segment")
    meal = {"id": str(uuid.uuid4()), **input.model_dump(), "created_at": datetime.now(timezone.utc).isoformat()}
    await db.meals.insert_one(meal.copy())
    return meal

@api_router.get("/meals", response_model=List[MealOut])
async def get_meals(date: str):
    return await db.meals.find({"date": date}, {"_id": 0}).sort("created_at", -1).to_list(200)

@api_router.delete("/meals/{meal_id}")
async def delete_meal(meal_id: str):
    result = await db.meals.delete_one({"id": meal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meal not found")
    return {"deleted": True}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()