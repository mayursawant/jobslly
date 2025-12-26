"""
Configuration module for HealthCare Jobs API.
Loads environment variables and defines application settings.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Security settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-this')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# MongoDB settings
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

# MongoDB connection pool settings
MONGO_SETTINGS = {
    'tlsAllowInvalidCertificates': True,
    'serverSelectionTimeoutMS': 60000,
    'connectTimeoutMS': 60000,
    'socketTimeoutMS': 60000,
    'maxPoolSize': 50,
    'minPoolSize': 10,
    'maxIdleTimeMS': 45000,
    'retryWrites': True,
    'retryReads': True
}

# AI Integration
AI_ENABLED = False
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    AI_ENABLED = True
except ImportError:
    print("AI integration not available")
