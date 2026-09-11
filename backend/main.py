"""
AuthenAI Root Launcher & Dedicated Tools API
Exposes app from app.main for standard uvicorn main:app execution
"""
from app.main import app
from app.api.tools_routes import router as tools_router

# Ensure dedicated tools router is mounted
if not any(hasattr(r, "path") and "/api/tools" in r.path for r in app.routes):
    app.include_router(tools_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
