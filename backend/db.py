import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")

mongo_client = AsyncIOMotorClient(MONGODB_URL)
db = mongo_client["ai_architect"] 