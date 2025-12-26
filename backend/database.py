"""
Database module for HealthCare Jobs API.
Manages MongoDB connection and database instance.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URL, DB_NAME, MONGO_SETTINGS

# Create MongoDB client with optimized settings
client = AsyncIOMotorClient(MONGO_URL, **MONGO_SETTINGS)

# Database instance
db = client[DB_NAME]
