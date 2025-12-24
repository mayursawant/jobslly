
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def check_mongo():
    uri = os.environ.get('MONGO_URL', "mongodb://localhost:27017")
    print(f"Attempting to connect to {uri}...")
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=2000)
        await client.server_info()
        print("SUCCESS: Connected to MongoDB!")
    except Exception as e:
        print(f"FAILURE: Could not connect to MongoDB. Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_mongo())
