from fastapi import APIRouter, Depends, HTTPException

from db.supabase_client import get_roadmap, get_user_roadmaps, mock_db
from routers.auth import get_current_user
from agent.mock_data import get_mock_resources
from mock_mode import MOCK_MODE

router = APIRouter(prefix="/roadmaps", tags=["roadmaps"])


@router.get("")
async def list_roadmaps(current_user: dict = Depends(get_current_user)):
    return get_user_roadmaps(current_user["id"])


@router.get("/{roadmap_id}")
async def read_roadmap(roadmap_id: str, current_user: dict = Depends(get_current_user)):
    roadmap = get_roadmap(roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


@router.delete("/{roadmap_id}")
async def delete_roadmap(roadmap_id: str, current_user: dict = Depends(get_current_user)):
    mock_db["roadmaps"].pop(roadmap_id, None)
    mock_db["progress"].pop(roadmap_id, None)
    return {"deleted": True, "id": roadmap_id}


@router.get("/{roadmap_id}/skills")
async def roadmap_skills(roadmap_id: str, current_user: dict = Depends(get_current_user)):
    roadmap = get_roadmap(roadmap_id)
    return roadmap.get("gap_map", {}).get("categories") or roadmap.get("skill_tree", {}).get("categories", [])


@router.get("/{roadmap_id}/resources/{skill_id}")
async def roadmap_resources(roadmap_id: str, skill_id: str, current_user: dict = Depends(get_current_user)):
    print(f"[roadmap_resources] roadmap_id={roadmap_id!r} skill_id={skill_id!r}")
    if MOCK_MODE:
        return get_mock_resources(skill_id)
    roadmap = get_roadmap(roadmap_id)
    if not roadmap or roadmap.get("error"):
        return get_mock_resources(skill_id)
    resources = roadmap.get("resources", {})
    return resources.get(skill_id) or get_mock_resources(skill_id)


@router.get("/{roadmap_id}/roadmap")
async def roadmap_plan(roadmap_id: str, current_user: dict = Depends(get_current_user)):
    roadmap = get_roadmap(roadmap_id).get("roadmap", {})
    return roadmap.get("months", roadmap)
