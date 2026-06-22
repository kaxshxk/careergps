from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from mock_mode import MOCK_MODE
from routers import analyze, auth, chat, progress, roadmaps

load_dotenv()

app = FastAPI(
    title="PathForge API",
    description="AI Career Navigator Agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000"), "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(roadmaps.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.add_api_websocket_route("/ws/analyze/{session_id}", analyze.analyze_ws)

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }


@app.get("/api/mock-status")
async def mock_status():
    return {"mock_mode": MOCK_MODE, "message": "Running in demo mode" if MOCK_MODE else "Running in live mode"}
