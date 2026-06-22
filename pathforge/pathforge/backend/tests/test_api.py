import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient

import mock_mode
mock_mode.MOCK_MODE = True

from main import app
from routers import analyze


@pytest.fixture(autouse=True)
def fast_stream(monkeypatch):
    monkeypatch.setattr(analyze, "STREAM_DELAY_SECONDS", 0)


@pytest.fixture
def client():
    return TestClient(app)


def auth_headers():
    return {"Authorization": "Bearer mock-pathforge-jwt"}


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_mock_status(client):
    response = client.get("/api/mock-status")
    assert response.status_code == 200
    assert response.json() == {"mock_mode": True, "message": "Running in demo mode"}


def test_signup_login_me(client):
    signup = client.post("/api/auth/signup", json={"email": "demo@example.com", "full_name": "Demo", "password": "x"})
    assert signup.status_code == 200
    assert signup.json()["access_token"] == "mock-pathforge-jwt"

    login = client.post("/api/auth/login", json={"email": "demo@example.com", "password": "x"})
    assert login.status_code == 200
    assert login.json()["user"]["id"] == "mock-user-001"

    me = client.get("/api/auth/me", headers=auth_headers())
    assert me.status_code == 200
    assert me.json()["email"] == "demo@pathforge.ai"


def test_analyze_returns_session_id(client):
    response = client.post("/api/analyze", json={"job_title": "Senior ML Engineer", "user_profile": {}})
    assert response.status_code == 200
    assert response.json()["session_id"]


def test_websocket_streams_all_phases(client):
    response = client.post("/api/analyze", json={"job_title": "Senior ML Engineer", "user_profile": {}})
    session_id = response.json()["session_id"]

    with client.websocket_connect(f"/api/ws/analyze/{session_id}") as websocket:
        messages = [websocket.receive_json() for _ in range(7)]

    assert [message["phase"] for message in messages] == [
        "PROCESSING",
        "JOB_INSIGHT",
        "SKILL_TREE",
        "GAP_MAP",
        "RESOURCES",
        "ROADMAP",
        "COMPLETE",
    ]
    assert messages[1]["data"]["title"] == "Senior ML Engineer"
    assert messages[-1]["session_id"] == session_id


def test_roadmap_endpoints(client):
    headers = auth_headers()
    roadmaps = client.get("/api/roadmaps", headers=headers)
    assert roadmaps.status_code == 200
    roadmap_id = roadmaps.json()[0]["id"]

    assert client.get(f"/api/roadmaps/{roadmap_id}", headers=headers).status_code == 200
    skills = client.get(f"/api/roadmaps/{roadmap_id}/skills", headers=headers)
    assert skills.status_code == 200
    assert skills.json()[0]["name"] == "Technical Skills"

    resources = client.get(f"/api/roadmaps/{roadmap_id}/resources/PyTorch", headers=headers)
    assert resources.status_code == 200
    assert resources.json()[0]["rank"] == "gold"

    plan = client.get(f"/api/roadmaps/{roadmap_id}/roadmap", headers=headers)
    assert plan.status_code == 200
    assert plan.json()[0]["title"].startswith("Month 01")


def test_progress_endpoints(client):
    headers = auth_headers()
    body = {"roadmap_id": "mock-roadmap-001", "task_id": "3", "skill_id": "Python"}
    completed = client.post("/api/progress/complete", json=body, headers=headers)
    assert completed.status_code == 200
    assert completed.json()["matchScore"] >= 67

    progress = client.get("/api/progress/mock-roadmap-001", headers=headers)
    assert progress.status_code == 200
    assert progress.json()[0]["task_id"] == "3"

    streak = client.get("/api/progress/streak", headers=headers)
    assert streak.status_code == 200
    assert streak.json()["current_streak"] >= 1


def test_chat_endpoint(client):
    response = client.post(
        "/api/chat/mock-roadmap-001",
        json={"message": "What should I learn first?"},
        headers=auth_headers(),
    )
    assert response.status_code == 200
    assert "pytorch" in response.json()["response"].lower()


def test_delete_roadmap(client):
    response = client.delete("/api/roadmaps/mock-roadmap-001", headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["deleted"] is True
