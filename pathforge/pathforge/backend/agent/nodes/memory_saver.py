import uuid
from typing import Any

from mock_mode import MOCK_MODE
from agent.state import AgentState

# In-memory store for mock mode  (session_id → state snapshot)
mock_db: dict[str, dict] = {}


def memory_saver(state: AgentState) -> dict[str, Any]:
    """
    Persists the completed pipeline state.
    Mock mode: writes to in-process mock_db dict and returns a fake UUID.
    Real mode: upserts into Supabase roadmaps table.
    """
    # Generate a session_id if none was provided in the initial call
    session_id = state.get("session_id") or str(uuid.uuid4())

    snapshot = {
        "job_data":    state.get("job_data", {}),
        "user_profile": state.get("user_profile", {}),
        "skill_tree":  state.get("skill_tree", {}),
        "gap_map":     state.get("gap_map", {}),
        "resources":   state.get("resources", {}),
        "roadmap":     state.get("roadmap", {}),
        "match_score": state.get("match_score", 0),
    }

    if MOCK_MODE:
        mock_db[session_id] = snapshot
        return {"session_id": session_id, "phase": "complete", "error": ""}

    try:
        import os
        from supabase import create_client

        supabase = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_SERVICE_KEY"],
        )
        supabase.table("roadmaps").upsert(
            {"session_id": session_id, **snapshot}
        ).execute()
        return {"session_id": session_id, "phase": "complete", "error": ""}
    except Exception as exc:
        # Don't fail the whole pipeline on a persistence error —
        # return session_id so the caller still gets a usable result.
        return {"session_id": session_id, "phase": "complete", "error": str(exc)}
