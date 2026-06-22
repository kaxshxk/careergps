import json
import re
from typing import Any

import anthropic
from pydantic import BaseModel, Field
from tenacity import retry, stop_after_attempt, wait_exponential

from mock_mode import MOCK_MODE
from agent.mock_data import MOCK_SKILL_CATEGORIES, MOCK_GAP_MAP
from agent.state import AgentState


# ── Pydantic models ────────────────────────────────────────────────────────────

class SkillModel(BaseModel):
    id: str
    name: str
    proficiency: int = Field(..., ge=1, le=4)
    match: int = Field(..., ge=0, le=100)
    status: str = Field(..., pattern="^(good|partial|learn)$")
    required_level: str
    sub_topics: list[str] = []
    why_needed: str = ""
    job_mention_frequency: int = Field(..., ge=0, le=100)


class CategoryModel(BaseModel):
    name: str
    skills: list[SkillModel]


class SkillTreeOutput(BaseModel):
    matchScore: int = Field(..., ge=0, le=100)
    categories: list[CategoryModel]


# ── Real Claude call ───────────────────────────────────────────────────────────

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def _call_claude(job_data: dict, market_skills: list, user_profile: dict) -> dict:
    from prompts.templates import SKILL_TREE_BUILDER_PROMPT

    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        temperature=0,
        system=SKILL_TREE_BUILDER_PROMPT,
        messages=[{
            "role": "user",
            "content": (
                f"Job data: {json.dumps(job_data)}\n"
                f"Market skills: {json.dumps(market_skills)}\n"
                f"User profile: {json.dumps(user_profile)}\n"
                "Return the skill tree JSON now."
            ),
        }],
    )
    raw = re.sub(r"^```(?:json)?\s*", "", response.content[0].text.strip())
    raw = re.sub(r"\s*```$", "", raw)
    parsed = json.loads(raw)
    validated = SkillTreeOutput(**parsed)
    return validated.model_dump()


# ── Mock enrichment helper ─────────────────────────────────────────────────────

_LEVEL_MAP = {4: "expert", 3: "advanced", 2: "intermediate", 1: "beginner"}

def _enrich_mock_skills(categories: list) -> list:
    """Add richer fields to each mock skill so shape is consistent with real mode."""
    enriched = []
    for cat in categories:
        skills = []
        for s in cat["skills"]:
            skills.append({
                **s,
                "id": s["name"].lower().replace("/", "-").replace(" ", "-").replace("(", "").replace(")", ""),
                "required_level": _LEVEL_MAP.get(max(s["proficiency"], 1), "beginner"),
                "sub_topics": [],
                "why_needed": f"Required by {s['match']}% of target job postings.",
                "job_mention_frequency": s["match"],
            })
        enriched.append({"name": cat["name"], "skills": skills})
    return enriched


# ── Node ───────────────────────────────────────────────────────────────────────

def skill_tree_builder(state: AgentState) -> dict[str, Any]:
    """
    Builds a hierarchical skill tree with proficiency, market match, and gap status.
    Categories: Technical Skills, Soft Skills, Domain Knowledge.
    """
    if MOCK_MODE:
        enriched = _enrich_mock_skills(MOCK_SKILL_CATEGORIES)
        skill_tree = {
            "matchScore": MOCK_GAP_MAP["matchScore"],
            "categories": enriched,
        }
        return {
            "skill_tree": skill_tree,
            "gap_map": MOCK_GAP_MAP,
            "match_score": MOCK_GAP_MAP["matchScore"],
            "phase": "skill_tree_built",
            "error": "",
        }

    try:
        result = _call_claude(
            state.get("job_data", {}),
            state.get("market_skills", []),
            state.get("user_profile", {}),
        )
        gap_map = {
            "matchScore": result["matchScore"],
            "categories": result["categories"],
        }
        return {
            "skill_tree": result,
            "gap_map": gap_map,
            "match_score": result["matchScore"],
            "phase": "skill_tree_built",
            "error": "",
        }
    except Exception as exc:
        return {"error": str(exc), "phase": "error"}
