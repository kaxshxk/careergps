"""
All tests run with MOCK_MODE = True (no real API calls).
Run from pathforge/backend/:
    .venv\\Scripts\\activate && pytest tests/ -v
"""
import sys
import os

# Ensure backend root is on sys.path so imports work correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

# Guarantee MOCK_MODE is True for all tests
import mock_mode
mock_mode.MOCK_MODE = True

from agent.mock_data import (
    MOCK_JOB_DATA,
    MOCK_SKILL_FREQUENCY,
    MOCK_COMPENSATION_TIERS,
    MOCK_SKILL_CATEGORIES,
    MOCK_GAP_MAP,
    MOCK_RESOURCES,
    MOCK_ROADMAP,
    MOCK_PROGRESS,
    MOCK_MATCH_SCORE,
)
from agent.nodes.input_parser import input_parser, _detect_input_type
from agent.nodes.job_researcher import job_researcher


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def base_state():
    return {
        "raw_input":    "",
        "input_type":   "",
        "job_data":     {},
        "user_profile": {},
        "market_skills": [],
        "skill_tree":   {},
        "gap_map":      {},
        "resources":    {},
        "roadmap":      {},
        "session_id":   "test-session-001",
        "match_score":  0,
        "error":        "",
        "phase":        "",
    }


# ── _detect_input_type ────────────────────────────────────────────────────────

class TestDetectInputType:
    def test_plain_text(self):
        assert _detect_input_type("Senior ML Engineer at Acme Corp") == "text"

    def test_url(self):
        assert _detect_input_type("https://jobs.lever.co/acme/123") == "url"

    def test_http_url(self):
        assert _detect_input_type("http://example.com/jobs/456") == "url"

    def test_pdf_path(self):
        assert _detect_input_type("C:/Users/john/resume.pdf") == "pdf"

    def test_pdf_path_lowercase(self):
        assert _detect_input_type("/tmp/job_posting.PDF") == "pdf"

    def test_image_png(self):
        assert _detect_input_type("/tmp/screenshot.png") == "image"

    def test_image_jpg(self):
        assert _detect_input_type("photo.jpg") == "image"

    def test_image_webp(self):
        assert _detect_input_type("posting.webp") == "image"


# ── input_parser (MOCK_MODE) ──────────────────────────────────────────────────

class TestInputParserMock:
    def test_returns_mock_job_data_for_text(self, base_state):
        state = {**base_state, "raw_input": "Senior ML Engineer at Acme Corp"}
        result = input_parser(state)

        assert result["job_data"] == MOCK_JOB_DATA
        assert result["input_type"] == "text"
        assert result["phase"] == "input_parsed"
        assert result["error"] == ""

    def test_returns_mock_job_data_for_url(self, base_state):
        state = {**base_state, "raw_input": "https://jobs.example.com/ml-engineer"}
        result = input_parser(state)

        assert result["job_data"] == MOCK_JOB_DATA
        assert result["input_type"] == "url"
        assert result["phase"] == "input_parsed"

    def test_returns_mock_job_data_for_pdf(self, base_state):
        state = {**base_state, "raw_input": "/tmp/job_posting.pdf"}
        result = input_parser(state)

        assert result["job_data"] == MOCK_JOB_DATA
        assert result["input_type"] == "pdf"

    def test_job_data_has_required_keys(self, base_state):
        state = {**base_state, "raw_input": "ML Engineer role"}
        result = input_parser(state)

        job = result["job_data"]
        required = {"title", "tags", "description", "dailyOps",
                    "marketSignal", "agentAnalysis", "confidenceScore",
                    "marketTrendSparkline"}
        assert required.issubset(job.keys())

    def test_market_signal_shape(self, base_state):
        state = {**base_state, "raw_input": "ML Engineer role"}
        result = input_parser(state)

        signal = result["job_data"]["marketSignal"]
        assert "value" in signal
        assert "trend" in signal
        assert isinstance(signal["value"], (int, float))

    def test_sparkline_is_list_of_ints(self, base_state):
        state = {**base_state, "raw_input": "ML Engineer role"}
        result = input_parser(state)

        sparkline = result["job_data"]["marketTrendSparkline"]
        assert isinstance(sparkline, list)
        assert len(sparkline) == 12
        assert all(isinstance(v, int) for v in sparkline)

    def test_empty_raw_input_still_returns_mock(self, base_state):
        # In MOCK_MODE empty input still returns mock data (no real call needed)
        result = input_parser(base_state)
        assert result["job_data"] == MOCK_JOB_DATA


# ── job_researcher (MOCK_MODE) ────────────────────────────────────────────────

class TestJobResearcherMock:
    def test_returns_mock_skill_frequency(self, base_state):
        state = {**base_state, "job_data": MOCK_JOB_DATA}
        result = job_researcher(state)

        assert result["market_skills"] == MOCK_SKILL_FREQUENCY
        assert result["phase"] == "market_researched"
        assert result["error"] == ""

    def test_enriches_job_data_with_compensation(self, base_state):
        state = {**base_state, "job_data": MOCK_JOB_DATA}
        result = job_researcher(state)

        assert "compensationTiers" in result["job_data"]
        assert result["job_data"]["compensationTiers"] == MOCK_COMPENSATION_TIERS

    def test_skill_frequency_shape(self, base_state):
        state = {**base_state, "job_data": MOCK_JOB_DATA}
        result = job_researcher(state)

        for item in result["market_skills"]:
            assert "skill" in item
            assert "percentage" in item
            assert 0 <= item["percentage"] <= 100

    def test_compensation_tiers_have_all_levels(self, base_state):
        state = {**base_state, "job_data": MOCK_JOB_DATA}
        result = job_researcher(state)

        levels = {t["level"] for t in result["job_data"]["compensationTiers"]}
        assert {"Entry", "Mid", "Senior"}.issubset(levels)

    def test_works_with_empty_job_data(self, base_state):
        # In MOCK_MODE, falls back to MOCK_JOB_DATA even when job_data is {}
        result = job_researcher(base_state)
        assert result["market_skills"] == MOCK_SKILL_FREQUENCY

    def test_preserves_existing_job_data_fields(self, base_state):
        state = {**base_state, "job_data": MOCK_JOB_DATA}
        result = job_researcher(state)

        # Original fields must still be present
        assert result["job_data"]["title"] == MOCK_JOB_DATA["title"]
        assert result["job_data"]["description"] == MOCK_JOB_DATA["description"]


# ── Mock data shape validation ────────────────────────────────────────────────

class TestMockDataShapes:
    def test_gap_map_has_match_score(self):
        assert "matchScore" in MOCK_GAP_MAP
        assert isinstance(MOCK_GAP_MAP["matchScore"], int)

    def test_skill_categories_structure(self):
        for cat in MOCK_SKILL_CATEGORIES:
            assert "name" in cat
            assert "skills" in cat
            for skill in cat["skills"]:
                assert {"name", "proficiency", "match", "status"}.issubset(skill.keys())
                assert skill["status"] in ("good", "partial", "learn")

    def test_resources_keyed_by_skill(self):
        for skill_name, resources in MOCK_RESOURCES.items():
            assert isinstance(skill_name, str)
            for r in resources:
                assert {"title", "provider", "tags", "rank", "scores"}.issubset(r.keys())
                assert r["rank"] in ("gold", "silver", "bronze")

    def test_roadmap_structure(self):
        for month in MOCK_ROADMAP:
            assert "title" in month
            assert "weeks" in month
            for week in month["weeks"]:
                assert "label" in week
                assert "skill" in week
                assert "tasks" in week
                for task in week["tasks"]:
                    assert {"id", "title", "source", "duration", "completed"}.issubset(task.keys())

    def test_progress_has_required_keys(self):
        required = {"matchScore", "currentStreak", "bestStreak",
                    "skillProgress", "todaysTasks"}
        assert required.issubset(MOCK_PROGRESS.keys())

    def test_match_score_shape(self):
        assert "overall" in MOCK_MATCH_SCORE
        assert "confidence" in MOCK_MATCH_SCORE
        assert 0 <= MOCK_MATCH_SCORE["overall"] <= 100
        assert 0.0 <= MOCK_MATCH_SCORE["confidence"] <= 100.0
