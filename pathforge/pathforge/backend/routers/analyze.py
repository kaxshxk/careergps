from __future__ import annotations

import asyncio
import uuid
from typing import Any

from fastapi import APIRouter, BackgroundTasks, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from mock_mode import MOCK_MODE
from agent.graph import main_graph
from agent.mock_data import get_mock_data
from db.supabase_client import MOCK_USER, mock_db, save_roadmap

router = APIRouter(tags=["analyze"])
analysis_sessions: dict[str, dict[str, Any]] = {}
STREAM_DELAY_SECONDS = 0.3


class AnalyzeRequest(BaseModel):
    job_title: str
    job_text: str | None = None
    job_url: str | None = None
    pdf_base64: str | None = None
    image_base64: str | None = None
    user_profile: dict = {}


def _initial_state(session_id: str, body: AnalyzeRequest) -> dict:
    raw_input = body.job_text or body.job_url or body.pdf_base64 or body.image_base64 or body.job_title
    return {
        "raw_input": raw_input,
        "input_type": "",
        "job_data": {},
        "user_profile": body.user_profile,
        "market_skills": [],
        "skill_tree": {},
        "gap_map": {},
        "resources": {},
        "roadmap": {},
        "session_id": session_id,
        "match_score": 0,
        "error": "",
        "phase": "",
        "reply": "",
    }


def _mock_session(session_id: str, body: AnalyzeRequest) -> dict:
    mock = get_mock_data(body.job_title, body.user_profile)
    data = {
        "session_id": session_id,
        "job_data": mock["job_data"],
        "market_skills": mock["market_skills"],
        "skill_tree": mock["skill_tree"],
        "gap_map": mock["gap_map"],
        "resources": mock["resources"],
        "roadmap": mock["roadmap"],
        "user_profile": body.user_profile,
        "match_score": mock["match_score"],
        "complete": True,
    }
    roadmap_id = save_roadmap(MOCK_USER["id"], {"id": session_id, **data, "job_title": body.job_title})
    data["roadmap_id"] = roadmap_id
    return data


async def run_analysis(session_id: str, body: AnalyzeRequest) -> None:
    try:
        if MOCK_MODE:
            analysis_sessions[session_id] = _mock_session(session_id, body)
            return
        state = await asyncio.to_thread(main_graph.invoke, _initial_state(session_id, body))
        analysis_sessions[session_id] = {**state, "complete": True}
    except Exception as exc:
        analysis_sessions[session_id] = {"session_id": session_id, "error": str(exc), "complete": True}


@router.post("/analyze")
async def analyze(body: AnalyzeRequest, background_tasks: BackgroundTasks):
    session_id = str(uuid.uuid4())
    analysis_sessions[session_id] = {"session_id": session_id, "complete": False, "job_title": body.job_title}
    background_tasks.add_task(run_analysis, session_id, body)
    return {"session_id": session_id}


@router.websocket("/ws/analyze/{session_id}")
async def analyze_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        while not analysis_sessions.get(session_id, {}).get("complete"):
            await asyncio.sleep(0.3)

        stored = analysis_sessions.get(session_id, {})
        session = stored if stored.get("complete") else _mock_session(session_id, AnalyzeRequest(job_title=stored.get("job_title", "Software Engineer")))
        if session.get("error"):
            await websocket.send_json({"phase": "ERROR", "message": session["error"]})
            return

        messages = [
            {"phase": "PROCESSING", "message": "Searching job market..."},
            {"phase": "JOB_INSIGHT", "data": session["job_data"]},
            {"phase": "SKILL_TREE", "data": {"skill_tree": session["skill_tree"], "market_skills": session.get("market_skills", [])}},
            {"phase": "GAP_MAP", "data": session["gap_map"]},
            {"phase": "RESOURCES", "data": session["resources"]},
            {"phase": "ROADMAP", "data": session["roadmap"]},
            {"phase": "COMPLETE", "session_id": session_id},
        ]
        for message in messages:
            await websocket.send_json(message)
            if message["phase"] != "COMPLETE":
                await asyncio.sleep(0.3)
    except WebSocketDisconnect:
        return
