import json
import re
from typing import Any

import anthropic
from pydantic import BaseModel, Field
from tenacity import retry, stop_after_attempt, wait_exponential

from mock_mode import MOCK_MODE
from agent.mock_data import MOCK_GAP_MAP
from agent.state import AgentState


# ── Pydantic models ────────────────────────────────────────────────────────────

class GapSkillModel(BaseModel):
    name: str
    proficiency: int = Field(..., ge=1, le=4)
    match: int = Field(..., ge=0, le=100)
    status: str = Field(..., pattern="^(good|partial|learn)$")


class GapCategoryModel(BaseModel):
    name: str
    skills: list[GapSkillModel]


class GapMapOutput(BaseModel):
    matchScore: int = Field(..., ge=0, le=100)
    categories: list[GapCategoryModel]


# ── Match-score calculation ────────────────────────────────────────────────────

def _calculate_match_score(categories: list) -> int:
    """Weighted average: (proficiency/4) × market_match, weighted by market_match."""
    total_weighted = 0.0
    total_weight = 0.0
    for cat in categories:
        for skill in cat.get("skills", []):
            weight = float(skill.get("match", 0))
            prof = float(skill.get("proficiency", 1))
            total_weighted += (prof / 4.0) * weight
            total_weight += weight
    if total_weight == 0:
        return 0
    return round((total_weighted / total_weight) * 100)


def _tag_status(proficiency: int) -> str:
    if proficiency >= 3:
        return "good"
    if proficiency == 2:
        return "partial"
    return "learn"


# ── Real Claude call ───────────────────────────────────────────────────────────

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def _call_claude(skill_tree: dict, user_profile: dict) -> dict:
    from prompts.templates import GAP_ANALYZER_PROMPT

    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=3000,
        temperature=0,
        system=GAP_ANALYZER_PROMPT,
        messages=[{
            "role": "user",
            "content": (
                f"Skill tree: {json.dumps(skill_tree)}\n"
                f"User profile: {json.dumps(user_profile)}\n"
                "Return the gap analysis JSON now."
            ),
        }],
    )
    raw = re.sub(r"^```(?:json)?\s*", "", response.content[0].text.strip())
    raw = re.sub(r"\s*```$", "", raw)
    parsed = json.loads(raw)
    validated = GapMapOutput(**parsed)
    return validated.model_dump()


# ── Node ───────────────────────────────────────────────────────────────────────

def gap_analyzer(state: AgentState) -> dict[str, Any]:
    """
    Compares skill_tree against user_profile to tag each skill:
    LEARN (proficiency 1), PARTIAL (2), or GOOD (3–4).
    Calculates overall match_score as a weighted integer 0–100.
    """
    if MOCK_MODE:
        return {
            "gap_map": MOCK_GAP_MAP,
            "match_score": MOCK_GAP_MAP["matchScore"],
            "phase": "gap_analyzed",
            "error": "",
        }

    skill_tree = state.get("skill_tree", {})
    user_profile = state.get("user_profile", {})

    try:
        result = _call_claude(skill_tree, user_profile)

        # Re-enforce status tags and recalculate match_score locally as a
        # safety net in case Claude returns inconsistent values.
        for cat in result.get("categories", []):
            for skill in cat.get("skills", []):
                skill["status"] = _tag_status(skill.get("proficiency", 1))

        match_score = _calculate_match_score(result.get("categories", []))
        result["matchScore"] = match_score

        gap_map = {
            "matchScore": match_score,
            "categories": result.get("categories", []),
        }
        return {
            "gap_map": gap_map,
            "match_score": match_score,
            "phase": "gap_analyzed",
            "error": "",
        }
    except Exception as exc:
        return {"error": str(exc), "phase": "error"}
