"""
Integration tests for the 6 intelligence nodes — all run in MOCK_MODE=True.
Validates every output matches mockData.ts shapes exactly.

Run from pathforge/backend/:
    .venv\\Scripts\\activate && pytest tests/test_intelligence_nodes.py -v
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

import mock_mode
mock_mode.MOCK_MODE = True

from agent.mock_data import (
    MOCK_GAP_MAP,
    MOCK_SKILL_CATEGORIES,
    MOCK_RESOURCES,
    MOCK_ROADMAP,
    MOCK_PROGRESS,
    MOCK_MATCH_SCORE,
)
from agent.nodes.skill_tree_builder import skill_tree_builder
from agent.nodes.gap_analyzer import gap_analyzer, _calculate_match_score, _tag_status
from agent.nodes.resource_finder import resource_finder
from agent.nodes.roadmap_generator import roadmap_generator
from agent.nodes.memory_saver import memory_saver, mock_db
from agent.nodes.followup_handler import followup_handler


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def full_state():
    """Simulates a state that has passed through input_parser + job_researcher."""
    from agent.mock_data import MOCK_JOB_DATA, MOCK_SKILL_FREQUENCY
    return {
        "raw_input": "Senior ML Engineer",
        "input_type": "text",
        "job_data": MOCK_JOB_DATA,
        "user_profile": {
            "hasResume": False,
            "resumeSkills": ["Python", "SQL"],
            "currentRole": "Student",
            "timeAvailable": "2 hours",
            "mainGoal": "Get hired fast",
        },
        "market_skills": MOCK_SKILL_FREQUENCY,
        "skill_tree": {},
        "gap_map": {},
        "resources": {},
        "roadmap": {},
        "session_id": "",
        "match_score": 0,
        "error": "",
        "phase": "market_researched",
        "reply": "",
    }


@pytest.fixture
def post_gap_state(full_state):
    """State after skill_tree_builder and gap_analyzer have run."""
    return {
        **full_state,
        "skill_tree": {
            "matchScore": MOCK_GAP_MAP["matchScore"],
            "categories": MOCK_SKILL_CATEGORIES,
        },
        "gap_map": MOCK_GAP_MAP,
        "match_score": MOCK_GAP_MAP["matchScore"],
        "phase": "gap_analyzed",
    }


@pytest.fixture
def post_resources_state(post_gap_state):
    return {**post_gap_state, "resources": MOCK_RESOURCES, "phase": "resources_found"}


@pytest.fixture
def complete_state(post_resources_state):
    return {
        **post_resources_state,
        "roadmap": {"months": MOCK_ROADMAP, "progress": MOCK_PROGRESS},
        "match_score": MOCK_GAP_MAP["matchScore"],
        "phase": "roadmap_generated",
    }


# ── TASK 1: skill_tree_builder ────────────────────────────────────────────────

class TestSkillTreeBuilder:
    def test_returns_skill_tree_and_gap_map(self, full_state):
        result = skill_tree_builder(full_state)
        assert "skill_tree" in result
        assert "gap_map" in result
        assert result["phase"] == "skill_tree_built"
        assert result["error"] == ""

    def test_skill_tree_has_match_score_and_categories(self, full_state):
        result = skill_tree_builder(full_state)
        tree = result["skill_tree"]
        assert "matchScore" in tree
        assert "categories" in tree
        assert isinstance(tree["categories"], list)
        assert len(tree["categories"]) > 0

    def test_each_skill_has_required_fields(self, full_state):
        result = skill_tree_builder(full_state)
        required = {"id", "name", "proficiency", "match", "status",
                    "required_level", "sub_topics", "why_needed", "job_mention_frequency"}
        for cat in result["skill_tree"]["categories"]:
            for skill in cat["skills"]:
                assert required.issubset(skill.keys()), (
                    f"Skill {skill.get('name')} missing fields: {required - skill.keys()}"
                )

    def test_status_values_are_valid(self, full_state):
        result = skill_tree_builder(full_state)
        valid = {"good", "partial", "learn"}
        for cat in result["skill_tree"]["categories"]:
            for skill in cat["skills"]:
                assert skill["status"] in valid

    def test_proficiency_range(self, full_state):
        result = skill_tree_builder(full_state)
        for cat in result["skill_tree"]["categories"]:
            for skill in cat["skills"]:
                assert 1 <= skill["proficiency"] <= 4

    def test_match_score_is_integer_in_range(self, full_state):
        result = skill_tree_builder(full_state)
        score = result["match_score"]
        assert isinstance(score, int)
        assert 0 <= score <= 100

    def test_gap_map_matches_mockdata_shape(self, full_state):
        result = skill_tree_builder(full_state)
        gap = result["gap_map"]
        assert "matchScore" in gap
        assert "categories" in gap


# ── TASK 2: gap_analyzer ─────────────────────────────────────────────────────

class TestGapAnalyzer:
    def test_returns_gap_map_and_match_score(self, full_state):
        result = gap_analyzer(full_state)
        assert "gap_map" in result
        assert "match_score" in result
        assert result["phase"] == "gap_analyzed"
        assert result["error"] == ""

    def test_gap_map_matches_mock(self, full_state):
        result = gap_analyzer(full_state)
        assert result["gap_map"] == MOCK_GAP_MAP

    def test_match_score_equals_mock(self, full_state):
        result = gap_analyzer(full_state)
        assert result["match_score"] == MOCK_GAP_MAP["matchScore"]

    def test_calculate_match_score_logic(self):
        categories = [
            {"skills": [
                {"proficiency": 4, "match": 100},  # 4/4 * 100 = 100 weighted
                {"proficiency": 2, "match": 50},   # 2/4 * 50  = 25 weighted
            ]}
        ]
        score = _calculate_match_score(categories)
        # total_weighted = 1.0*100 + 0.5*50 = 125; total_weight = 150
        # score = 125/150 * 100 = 83.3 → 83
        assert score == 83

    def test_calculate_match_score_empty(self):
        assert _calculate_match_score([]) == 0

    def test_tag_status_mapping(self):
        assert _tag_status(4) == "good"
        assert _tag_status(3) == "good"
        assert _tag_status(2) == "partial"
        assert _tag_status(1) == "learn"


# ── TASK 5: resource_finder ───────────────────────────────────────────────────

class TestResourceFinder:
    def test_returns_resources_dict(self, post_gap_state):
        result = resource_finder(post_gap_state)
        assert "resources" in result
        assert result["phase"] == "resources_found"
        assert result["error"] == ""

    def test_resources_equals_mock(self, post_gap_state):
        result = resource_finder(post_gap_state)
        assert result["resources"] == MOCK_RESOURCES

    def test_resources_keyed_by_skill(self, post_gap_state):
        result = resource_finder(post_gap_state)
        for skill_name, res_list in result["resources"].items():
            assert isinstance(skill_name, str)
            assert isinstance(res_list, list)

    def test_each_resource_has_required_fields(self, post_gap_state):
        result = resource_finder(post_gap_state)
        required = {"title", "provider", "tags", "rank", "scores"}
        for skill_name, res_list in result["resources"].items():
            for res in res_list:
                assert required.issubset(res.keys()), (
                    f"{skill_name} resource missing: {required - res.keys()}"
                )

    def test_resource_scores_have_6_dimensions(self, post_gap_state):
        result = resource_finder(post_gap_state)
        score_dims = {"quality", "recency", "trust", "relevance", "access", "fit"}
        for res_list in result["resources"].values():
            for res in res_list:
                assert score_dims.issubset(res["scores"].keys())

    def test_rank_values_are_valid(self, post_gap_state):
        result = resource_finder(post_gap_state)
        valid_ranks = {"gold", "silver", "bronze"}
        for res_list in result["resources"].values():
            for res in res_list:
                assert res["rank"] in valid_ranks


# ── TASK 6: roadmap_generator ─────────────────────────────────────────────────

class TestRoadmapGenerator:
    def test_returns_roadmap(self, post_resources_state):
        result = roadmap_generator(post_resources_state)
        assert "roadmap" in result
        assert result["phase"] == "roadmap_generated"
        assert result["error"] == ""

    def test_roadmap_has_months_and_progress(self, post_resources_state):
        result = roadmap_generator(post_resources_state)
        rdm = result["roadmap"]
        assert "months" in rdm
        assert "progress" in rdm

    def test_months_match_mockdata_shape(self, post_resources_state):
        result = roadmap_generator(post_resources_state)
        for month in result["roadmap"]["months"]:
            assert "title" in month
            assert "weeks" in month
            for week in month["weeks"]:
                assert "label" in week
                assert "skill" in week
                assert "tasks" in week
                for task in week["tasks"]:
                    assert {"id", "title", "source", "duration", "completed"}.issubset(task.keys())

    def test_progress_has_required_keys(self, post_resources_state):
        result = roadmap_generator(post_resources_state)
        required = {"matchScore", "currentStreak", "bestStreak", "skillProgress", "todaysTasks"}
        assert required.issubset(result["roadmap"]["progress"].keys())

    def test_months_equals_mock(self, post_resources_state):
        result = roadmap_generator(post_resources_state)
        assert result["roadmap"]["months"] == MOCK_ROADMAP


# ── TASK 7: memory_saver ─────────────────────────────────────────────────────

class TestMemorySaver:
    def test_generates_session_id_when_missing(self, complete_state):
        state = {**complete_state, "session_id": ""}
        result = memory_saver(state)
        assert result["session_id"]
        assert len(result["session_id"]) == 36  # UUID4 format

    def test_preserves_provided_session_id(self, complete_state):
        state = {**complete_state, "session_id": "test-abc-123"}
        result = memory_saver(state)
        assert result["session_id"] == "test-abc-123"

    def test_saves_to_mock_db(self, complete_state):
        state = {**complete_state, "session_id": "db-test-session"}
        memory_saver(state)
        assert "db-test-session" in mock_db
        saved = mock_db["db-test-session"]
        assert "job_data" in saved
        assert "gap_map" in saved
        assert "resources" in saved
        assert "roadmap" in saved
        assert "match_score" in saved

    def test_phase_is_complete(self, complete_state):
        result = memory_saver(complete_state)
        assert result["phase"] == "complete"

    def test_match_score_saved_correctly(self, complete_state):
        state = {**complete_state, "session_id": "score-test", "match_score": 67}
        memory_saver(state)
        assert mock_db["score-test"]["match_score"] == 67


# ── TASK 8: followup_handler ─────────────────────────────────────────────────

class TestFollowupHandler:
    def test_returns_reply_string(self, complete_state):
        state = {**complete_state, "raw_input": "What should I learn first?"}
        result = followup_handler(state)
        assert "reply" in result
        assert isinstance(result["reply"], str)
        assert len(result["reply"]) > 20

    def test_phase_is_followup_complete(self, complete_state):
        state = {**complete_state, "raw_input": "What should I learn first?"}
        result = followup_handler(state)
        assert result["phase"] == "followup_complete"
        assert result["error"] == ""

    def test_mock_reply_references_ml_context(self, complete_state):
        state = {**complete_state, "raw_input": "How do I improve my score?"}
        result = followup_handler(state)
        reply = result["reply"].lower()
        # Mock reply should reference ML-related content
        assert any(kw in reply for kw in ("pytorch", "ml", "machine learning", "python", "skill"))

    def test_empty_message_still_returns_mock(self, complete_state):
        state = {**complete_state, "raw_input": ""}
        result = followup_handler(state)
        # In MOCK_MODE, even empty input returns the mock reply
        assert result["reply"]


# ── Cross-node shape validation ───────────────────────────────────────────────

class TestEndToEndShapes:
    def test_skill_tree_feeds_into_gap_analyzer(self, full_state):
        tree_result = skill_tree_builder(full_state)
        merged = {**full_state, **tree_result}
        gap_result = gap_analyzer(merged)
        assert gap_result["match_score"] == MOCK_GAP_MAP["matchScore"]

    def test_gap_feeds_into_resource_finder(self, full_state):
        tree_result = skill_tree_builder(full_state)
        gap_result = gap_analyzer({**full_state, **tree_result})
        resource_result = resource_finder({**full_state, **tree_result, **gap_result})
        assert resource_result["resources"] == MOCK_RESOURCES

    def test_full_chain_returns_session_id(self, full_state):
        s = full_state
        s.update(skill_tree_builder(s))
        s.update(gap_analyzer(s))
        s.update(resource_finder(s))
        s.update(roadmap_generator(s))
        final = memory_saver(s)
        assert final["session_id"]
        assert final["phase"] == "complete"
