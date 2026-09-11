"""
AuthenAI - AI-Powered Deepfake & Synthetic Identity Detection System
Production-Ready Full-Stack FastAPI Backend
Tagline: "Verify the Person. Trust the Identity."
"""

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as verification_router
from app.api.tools_routes import router as tools_router
from app.database.mongo import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown


app = FastAPI(
    title="AuthenAI Forensics Engine",
    description="Multi-Modal Deepfake, Impersonation & Synthetic Identity Detection System",
    version="2026.2.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Verification Router & Dedicated Tools Router
app.include_router(verification_router)
app.include_router(tools_router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "ONLINE",
        "system": "AuthenAI Multi-Modal Forensics Engine",
        "version": "2026.2.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "tagline": "Verify the Person. Trust the Identity.",
        "engines": {
            "document_ela": "READY",
            "ocr_parser": "READY",
            "facial_biometrics": "READY",
            "micro_liveness": "READY",
            "video_deepfake": "READY",
            "voice_harmonics": "READY",
            "cross_modal_fusion": "READY",
            "risk_engine": "READY",
            "confidence_engine": "READY",
            "evidence_engine": "READY",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
