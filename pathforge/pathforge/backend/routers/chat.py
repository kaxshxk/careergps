from fastapi import APIRouter, Depends
from pydantic import BaseModel

from agent.nodes.followup_handler import followup_handler
from db.supabase_client import get_roadmap
from routers.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str


@router.post("/{roadmap_id}")
async def chat(roadmap_id: str, body: ChatRequest, current_user: dict = Depends(get_current_user)):
    roadmap = get_roadmap(roadmap_id)
    result = followup_handler({
        "raw_input": body.message,
        "input_type": "text",
        "job_data": roadmap.get("job_data", {}),
        "user_profile": roadmap.get("user_profile", {}),
        "market_skills": [],
        "skill_tree": roadmap.get("skill_tree", {}),
        "gap_map": roadmap.get("gap_map", {}),
        "resources": roadmap.get("resources", {}),
        "roadmap": roadmap.get("roadmap", {}),
        "session_id": roadmap_id,
        "match_score": roadmap.get("match_score", 0),
        "error": "",
        "phase": "",
        "reply": "",
    })
    return {"response": result.get("reply", "")}
