from __future__ import annotations

import copy
import os
import uuid
from datetime import date
from typing import Any

from mock_mode import MOCK_MODE
from agent.mock_data import (
    MOCK_COMPENSATION_TIERS,
    MOCK_GAP_MAP,
    MOCK_JOB_DATA,
    MOCK_PROGRESS,
    MOCK_RESOURCES,
    MOCK_ROADMAP,
    MOCK_SKILL_FREQUENCY,
    MOCK_SKILL_CATEGORIES,
    _ml,
)

try:
    from supabase import Client, create_client
except Exception:  # pragma: no cover - optional outside real Supabase mode
    Client = Any
    create_client = None


MOCK_USER = {
    "id": "mock-user-001",
    "email": "demo@pathforge.ai",
    "full_name": "PathForge Demo User",
    "avatar_url": None,
    "preferences": {},
}

mock_db: dict[str, Any] = {
    "users": {MOCK_USER["id"]: copy.deepcopy(MOCK_USER)},
    "roadmaps": {},
    "progress": {},
    "streaks": {
        MOCK_USER["id"]: {
            "user_id": MOCK_USER["id"],
            "current_streak": MOCK_PROGRESS["currentStreak"],
            "longest_streak": MOCK_PROGRESS["bestStreak"],
            "last_active_date": str(date.today()),
            "total_tasks_done": 0,
        }
    },
}


def _default_roadmap(roadmap_id: str = "mock-roadmap-001", user_id: str = MOCK_USER["id"]) -> dict:
    job_data = copy.deepcopy(MOCK_JOB_DATA)
    job_data["compensationTiers"] = copy.deepcopy(MOCK_COMPENSATION_TIERS)
    return {
        "id": roadmap_id,
        "user_id": user_id,
        "job_title": MOCK_JOB_DATA["title"],
        "job_data": job_data,
        "user_profile": {},
        "market_skills": copy.deepcopy(MOCK_SKILL_FREQUENCY),
        "skill_tree": {"matchScore": MOCK_GAP_MAP["matchScore"], "categories": copy.deepcopy(MOCK_SKILL_CATEGORIES)},
        "gap_map": copy.deepcopy(MOCK_GAP_MAP),
        "resources": copy.deepcopy(MOCK_RESOURCES),
        "roadmap": {
            "months": copy.deepcopy(MOCK_ROADMAP),
            "progress": copy.deepcopy(MOCK_PROGRESS),
            "weeklyView": copy.deepcopy(_ml.get("weeklyView") or []),
            "dailyView": copy.deepcopy(_ml.get("dailyView") or [])
        },
        "match_score": MOCK_GAP_MAP["matchScore"],
        "status": "active",
    }


mock_db["roadmaps"]["mock-roadmap-001"] = _default_roadmap()

_client: Client | None = None


def get_supabase() -> Client | None:
    global _client
    if MOCK_MODE:
        return None
    if _client is None:
        if create_client is None:
            raise RuntimeError("supabase package is not available")
        _client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
    return _client


def create_user(email: str, full_name: str) -> dict:
    try:
        if MOCK_MODE:
            user_id = str(uuid.uuid4())
            user = {"id": user_id, "email": email, "full_name": full_name, "avatar_url": None, "preferences": {}}
            mock_db["users"][user_id] = user
            return copy.deepcopy(user)

        result = get_supabase().table("users").insert({"email": email, "full_name": full_name}).execute()
        return result.data[0] if result.data else {}
    except Exception as exc:
        return {"error": str(exc)}


def get_user(user_id: str) -> dict:
    try:
        if MOCK_MODE:
            return copy.deepcopy(mock_db["users"].get(user_id, MOCK_USER))

        result = get_supabase().table("users").select("*").eq("id", user_id).single().execute()
        return result.data or {}
    except Exception as exc:
        return {"error": str(exc)}


def save_roadmap(user_id: str, roadmap_data: dict) -> str:
    try:
        if MOCK_MODE:
            roadmap_id = roadmap_data.get("id") or str(uuid.uuid4())
            record = _default_roadmap(roadmap_id, user_id)
            record.update(copy.deepcopy(roadmap_data))
            record["id"] = roadmap_id
            record["user_id"] = user_id
            mock_db["roadmaps"][roadmap_id] = record
            return roadmap_id

        payload = {
            "user_id": user_id,
            "job_title": roadmap_data.get("job_title") or roadmap_data.get("job_data", {}).get("title", ""),
            "job_data": roadmap_data.get("job_data", {}),
            "user_profile": roadmap_data.get("user_profile", {}),
            "skill_tree": roadmap_data.get("skill_tree", {}),
            "gap_map": roadmap_data.get("gap_map", {}),
            "resources": roadmap_data.get("resources", {}),
            "roadmap_plan": roadmap_data.get("roadmap", {}),
            "match_score": roadmap_data.get("match_score", 0),
        }
        result = get_supabase().table("roadmaps").insert(payload).execute()
        return result.data[0]["id"] if result.data else ""
    except Exception:
        return ""


def get_roadmap(roadmap_id: str) -> dict:
    try:
        if MOCK_MODE:
            return copy.deepcopy(mock_db["roadmaps"].get(roadmap_id) or mock_db["roadmaps"]["mock-roadmap-001"])

        result = get_supabase().table("roadmaps").select("*").eq("id", roadmap_id).single().execute()
        return result.data or {}
    except Exception as exc:
        return {"error": str(exc)}


def get_user_roadmaps(user_id: str) -> list[dict]:
    try:
        if MOCK_MODE:
            return [
                copy.deepcopy(roadmap)
                for roadmap in mock_db["roadmaps"].values()
                if roadmap.get("user_id") == user_id or user_id == MOCK_USER["id"]
            ]

        result = get_supabase().table("roadmaps").select("*").eq("user_id", user_id).execute()
        return result.data or []
    except Exception:
        return []


def save_progress(roadmap_id: str, user_id: str, task_id: str, skill_id: str) -> dict:
    try:
        entry = {
            "roadmap_id": roadmap_id,
            "user_id": user_id,
            "task_id": task_id,
            "skill_id": skill_id,
            "completed_at": str(date.today()),
        }
        if MOCK_MODE:
            bucket = mock_db["progress"].setdefault(roadmap_id, [])
            if not any(item["task_id"] == task_id and item["skill_id"] == skill_id for item in bucket):
                bucket.append(entry)
            update_streak(user_id)
            roadmap = mock_db["roadmaps"].setdefault(roadmap_id, _default_roadmap(roadmap_id, user_id))
            completed_count = len(bucket)
            new_score = min(100, MOCK_PROGRESS["matchScore"] + completed_count)
            roadmap["match_score"] = new_score
            roadmap["roadmap"]["progress"]["matchScore"] = new_score
            return copy.deepcopy(entry)

        result = get_supabase().table("progress_logs").insert(entry).execute()
        update_streak(user_id)
        return result.data[0] if result.data else entry
    except Exception as exc:
        return {"error": str(exc)}


def get_progress(roadmap_id: str) -> list[dict]:
    try:
        if MOCK_MODE:
            return copy.deepcopy(mock_db["progress"].get(roadmap_id, []))

        result = get_supabase().table("progress_logs").select("*").eq("roadmap_id", roadmap_id).execute()
        return result.data or []
    except Exception:
        return []


def update_streak(user_id: str) -> dict:
    try:
        if MOCK_MODE:
            streak = mock_db["streaks"].setdefault(
                user_id,
                {"user_id": user_id, "current_streak": 0, "longest_streak": 0, "last_active_date": "", "total_tasks_done": 0},
            )
            streak["current_streak"] = max(1, int(streak.get("current_streak", 0)))
            streak["longest_streak"] = max(streak["longest_streak"], streak["current_streak"])
            streak["last_active_date"] = str(date.today())
            streak["total_tasks_done"] = int(streak.get("total_tasks_done", 0)) + 1
            return copy.deepcopy(streak)

        existing = get_supabase().table("streaks").select("*").eq("user_id", user_id).execute()
        if existing.data:
            streak = existing.data[0]
            current = int(streak.get("current_streak") or 0) + 1
            payload = {
                "current_streak": current,
                "longest_streak": max(current, int(streak.get("longest_streak") or 0)),
                "last_active_date": str(date.today()),
                "total_tasks_done": int(streak.get("total_tasks_done") or 0) + 1,
            }
            result = get_supabase().table("streaks").update(payload).eq("user_id", user_id).execute()
            return result.data[0] if result.data else payload
        payload = {"user_id": user_id, "current_streak": 1, "longest_streak": 1, "last_active_date": str(date.today()), "total_tasks_done": 1}
        result = get_supabase().table("streaks").insert(payload).execute()
        return result.data[0] if result.data else payload
    except Exception as exc:
        return {"error": str(exc)}
