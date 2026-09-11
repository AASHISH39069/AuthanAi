"""
MongoDB Database Connection & Resilient In-Memory Repository
Provides seamless persistence with automatic fallback if MongoDB is not running.
"""

import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

# In-Memory Datastore Fallback
IN_MEMORY_SESSIONS: Dict[str, Dict[str, Any]] = {}
IN_MEMORY_RESULTS: Dict[str, Dict[str, Any]] = {}
IN_MEMORY_HISTORY: List[Dict[str, Any]] = [
    {
        "session_id": "AUTH-2026-00125",
        "date": "2026-09-11T14:32:00Z",
        "name": "Alexandra Chen",
        "risk_level": "LOW RISK",
        "risk_score": 18.0,
        "confidence": 94.0,
        "status": "VERIFICATION PASSED",
    },
    {
        "session_id": "AUTH-2026-00124",
        "date": "2026-09-11T12:15:00Z",
        "name": "Marcus Vance",
        "risk_level": "MEDIUM RISK",
        "risk_score": 47.0,
        "confidence": 67.0,
        "status": "ADDITIONAL VERIFICATION",
    },
    {
        "session_id": "AUTH-2026-00123",
        "date": "2026-09-11T09:44:00Z",
        "name": "Synthetic Test Profile",
        "risk_level": "HIGH RISK",
        "risk_score": 83.0,
        "confidence": 91.0,
        "status": "MANUAL REVIEW REQUIRED",
    },
]

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "authenai_db")

_mongo_client = None
_db = None
_mongo_available = False


async def init_db():
    """Initialize MongoDB connection if available; otherwise use in-memory store."""
    global _mongo_client, _db, _mongo_available
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        _mongo_client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=1000)
        # Ping
        await _mongo_client.admin.command('ping')
        _db = _mongo_client[MONGODB_DATABASE]
        _mongo_available = True
        print(f"[AuthenAI DB] Connected successfully to MongoDB at {MONGODB_URI}")
    except Exception as e:
        _mongo_available = False
        print(f"[AuthenAI DB] MongoDB offline ({e}). Operating in resilient In-Memory mode.")


async def save_session(session_id: str, data: Dict[str, Any]):
    """Save or update verification session."""
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    if _mongo_available and _db is not None:
        try:
            await _db.sessions.update_one({"session_id": session_id}, {"$set": data}, upsert=True)
            return
        except Exception:
            pass
    IN_MEMORY_SESSIONS[session_id] = data


async def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve session data by session_id."""
    if _mongo_available and _db is not None:
        try:
            doc = await _db.sessions.find_one({"session_id": session_id}, {"_id": 0})
            if doc:
                return doc
        except Exception:
            pass
    return IN_MEMORY_SESSIONS.get(session_id)


async def save_verification_result(result: Dict[str, Any], user_name: str = "Demo User"):
    """Persist final verification result and history entry."""
    session_id = result.get("session_id", "UNKNOWN")
    now_iso = datetime.now(timezone.utc).isoformat()
    result["saved_at"] = now_iso

    history_entry = {
        "session_id": session_id,
        "date": now_iso,
        "name": user_name,
        "risk_level": result.get("risk_level", "LOW RISK"),
        "risk_score": result.get("risk_score", 0.0),
        "confidence": result.get("confidence_score", 90.0),
        "status": result.get("verdict", "VERIFICATION PASSED"),
    }

    if _mongo_available and _db is not None:
        try:
            await _db.results.update_one({"session_id": session_id}, {"$set": result}, upsert=True)
            await _db.history.insert_one(history_entry)
            return
        except Exception:
            pass

    IN_MEMORY_RESULTS[session_id] = result
    IN_MEMORY_HISTORY.insert(0, history_entry)


async def get_verification_result(session_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a saved verification result by session_id."""
    if _mongo_available and _db is not None:
        try:
            res = await _db.results.find_one({"session_id": session_id}, {"_id": 0})
            if res:
                return res
        except Exception:
            pass
    return IN_MEMORY_RESULTS.get(session_id)


async def get_verification_history() -> List[Dict[str, Any]]:
    """Retrieve all verification history records."""
    if _mongo_available and _db is not None:
        try:
            cursor = _db.history.find({}, {"_id": 0}).sort("date", -1).limit(50)
            items = await cursor.to_list(length=50)
            if items:
                return items
        except Exception:
            pass
    return list(IN_MEMORY_HISTORY)
