import json
import re
from typing import Any

import anthropic
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential

from mock_mode import MOCK_MODE
from agent.mock_data import MOCK_ROADMAP, MOCK_PROGRESS, MOCK_MATCH_SCORE, _ml
from agent.state import AgentState


# ── Pydantic models ────────────────────────────────────────────────────────────

class RoadmapTaskModel(BaseModel):
    id: str
    title: str
    source: str
    duration: str
    completed: bool = False
    isToday: bool = False
    badges: list[str] = []


class RoadmapWeekModel(BaseModel):
    label: str
    skill: str
    tasks: list[RoadmapTaskModel]


class RoadmapMonthModel(BaseModel):
    title: str
    weeks: list[RoadmapWeekModel]


class RoadmapOutput(BaseModel):
    months: list[RoadmapMonthModel]


# ── Real Claude call ───────────────────────────────────────────────────────────

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def _call_claude(
    gap_map: dict,
    job_data: dict,
    user_profile: dict,
    resources: dict,
) -> dict:
    from prompts.templates import ROADMAP_GENERATOR_PROMPT

    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=6000,
        temperature=0,
        system=ROADMAP_GENERATOR_PROMPT,
        messages=[{
            "role": "user",
            "content": (
                f"Gap map: {json.dumps(gap_map)}\n"
                f"Job data: {json.dumps({k: job_data.get(k) for k in ('title', 'dailyOps')})}\n"
                f"User profile: {json.dumps(user_profile)}\n"
                f"Resources (top picks per skill): {json.dumps({k: v[:1] for k, v in (resources or {}).items()})}\n"
                "Return the roadmap JSON now. Include at least 3 Resume+ project tasks."
            ),
        }],
    )
    raw = re.sub(r"^```(?:json)?\s*", "", response.content[0].text.strip())
    raw = re.sub(r"\s*```$", "", raw)
    parsed = json.loads(raw)
    validated = RoadmapOutput(**parsed)
    return validated.model_dump()


def _build_initial_progress(months: list, match_score: int) -> dict:
    """Derive initial progress stats from the roadmap (all tasks start at 0%)."""
    skills_seen: dict[str, int] = {}
    for month in months:
        for week in month.get("weeks", []):
            skill = week.get("skill", "")
            if skill and skill not in skills_seen:
                skills_seen[skill] = 0

    return {
        "matchScore": match_score,
        "currentStreak": 0,
        "bestStreak": 0,
        "skillProgress": [{"name": s, "percentage": 0} for s in skills_seen],
        "todaysTasks": [],
    }


# ── Node ───────────────────────────────────────────────────────────────────────

def roadmap_generator(state: AgentState) -> dict[str, Any]:
    """
    Assembles a month/week/task learning plan.
    Skills are ordered by gap severity (learn → partial) and market demand.
    Generates at least 3 Resume+ project tasks.
    """
    if MOCK_MODE:
        return {
            "roadmap": {
                "months": MOCK_ROADMAP,
                "progress": MOCK_PROGRESS,
                "weeklyView": _ml.get("weeklyView") or [],
                "dailyView": _ml.get("dailyView") or [],
            },
            "phase": "roadmap_generated",
            "error": "",
        }

    try:
        result = _call_claude(
            state.get("gap_map", {}),
            state.get("job_data", {}),
            state.get("user_profile", {}),
            state.get("resources", {}),
        )
        months = result.get("months", [])
        match_score = state.get("match_score", MOCK_MATCH_SCORE["overall"])
        progress = _build_initial_progress(months, match_score)

        return {
            "roadmap": {"months": months, "progress": progress},
            "phase": "roadmap_generated",
            "error": "",
        }
    except Exception as exc:
        return {"error": str(exc), "phase": "error"}
