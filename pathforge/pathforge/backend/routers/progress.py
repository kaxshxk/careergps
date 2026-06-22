from fastapi import APIRouter, Depends
from pydantic import BaseModel

from agent.mock_data import MOCK_PROGRESS
from db.supabase_client import get_progress, get_roadmap, mock_db, save_progress
from routers.auth import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])


class CompleteRequest(BaseModel):
    roadmap_id: str
    task_id: str
    skill_id: str


@router.post("/complete")
async def complete_task(body: CompleteRequest, current_user: dict = Depends(get_current_user)):
    progress = save_progress(body.roadmap_id, current_user["id"], body.task_id, body.skill_id)
    roadmap = get_roadmap(body.roadmap_id)
    return {
        "progress": progress,
        "matchScore": roadmap.get("match_score", MOCK_PROGRESS["matchScore"]),
        "completed": get_progress(body.roadmap_id),
    }


@router.get("/streak")
async def streak(current_user: dict = Depends(get_current_user)):
    return mock_db["streaks"].get(current_user["id"], {
        "user_id": current_user["id"],
        "current_streak": MOCK_PROGRESS["currentStreak"],
        "longest_streak": MOCK_PROGRESS["bestStreak"],
        "total_tasks_done": 0,
    })


@router.get("/{roadmap_id}")
async def roadmap_progress(roadmap_id: str, current_user: dict = Depends(get_current_user)):
    return get_progress(roadmap_id)
