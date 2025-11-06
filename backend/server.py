from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# API Keys
CRICKET_API_KEY = os.environ['CRICKET_API_KEY']
FOOTBALL_API_KEY = os.environ['FOOTBALL_API_KEY']

# API Base URLs
CRICKET_BASE_URL = "https://api.cricapi.com/v1"
FOOTBALL_BASE_URL = "https://api.football-data.org/v4"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ CRICKET ENDPOINTS ============

@api_router.get("/cricket/current-matches")
async def get_current_cricket_matches():
    """Get current cricket matches"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{CRICKET_BASE_URL}/currentMatches",
                params={"apikey": CRICKET_API_KEY, "offset": 0}
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Cricket API error")
    except Exception as e:
        logger.error(f"Error fetching cricket matches: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/cricket/match/{match_id}")
async def get_cricket_match_info(match_id: str):
    """Get detailed cricket match info"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{CRICKET_BASE_URL}/match_info",
                params={"apikey": CRICKET_API_KEY, "id": match_id}
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Cricket API error")
    except Exception as e:
        logger.error(f"Error fetching cricket match info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/cricket/series")
async def get_cricket_series():
    """Get cricket series list"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{CRICKET_BASE_URL}/series",
                params={"apikey": CRICKET_API_KEY, "offset": 0}
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Cricket API error")
    except Exception as e:
        logger.error(f"Error fetching cricket series: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/cricket/series-info/{series_id}")
async def get_cricket_series_info(series_id: str):
    """Get cricket series information"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{CRICKET_BASE_URL}/series_info",
                params={"apikey": CRICKET_API_KEY, "id": series_id}
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Cricket API error")
    except Exception as e:
        logger.error(f"Error fetching cricket series info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ FOOTBALL ENDPOINTS ============

@api_router.get("/football/competitions")
async def get_football_competitions():
    """Get available football competitions"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{FOOTBALL_BASE_URL}/competitions",
                headers={"X-Auth-Token": FOOTBALL_API_KEY}
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Football API error")
    except Exception as e:
        logger.error(f"Error fetching football competitions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/football/matches")
async def get_football_matches(status: Optional[str] = None):
    """Get football matches - supports status filter (SCHEDULED, LIVE, FINISHED)"""
    try:
        params = {}
        if status:
            params["status"] = status
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{FOOTBALL_BASE_URL}/matches",
                headers={"X-Auth-Token": FOOTBALL_API_KEY},
                params=params
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Football API error")
    except Exception as e:
        logger.error(f"Error fetching football matches: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/football/competition/{competition_code}/standings")
async def get_football_standings(competition_code: str):
    """Get football competition standings"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{FOOTBALL_BASE_URL}/competitions/{competition_code}/standings",
                headers={"X-Auth-Token": FOOTBALL_API_KEY}
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Football API error")
    except Exception as e:
        logger.error(f"Error fetching football standings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/football/competition/{competition_code}/matches")
async def get_football_competition_matches(competition_code: str, status: Optional[str] = None):
    """Get matches for a specific competition"""
    try:
        params = {}
        if status:
            params["status"] = status
            
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{FOOTBALL_BASE_URL}/competitions/{competition_code}/matches",
                headers={"X-Auth-Token": FOOTBALL_API_KEY},
                params=params
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Football API error")
    except Exception as e:
        logger.error(f"Error fetching competition matches: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/football/match/{match_id}")
async def get_football_match_details(match_id: int):
    """Get detailed football match information"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{FOOTBALL_BASE_URL}/matches/{match_id}",
                headers={"X-Auth-Token": FOOTBALL_API_KEY}
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Football API error")
    except Exception as e:
        logger.error(f"Error fetching match details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/football/team/{team_id}")
async def get_football_team(team_id: int):
    """Get football team information"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{FOOTBALL_BASE_URL}/teams/{team_id}",
                headers={"X-Auth-Token": FOOTBALL_API_KEY}
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Football API error")
    except Exception as e:
        logger.error(f"Error fetching team info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()