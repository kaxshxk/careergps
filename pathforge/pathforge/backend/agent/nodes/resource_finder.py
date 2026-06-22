import asyncio
import json
import re
from typing import Any

import anthropic
from tenacity import retry, stop_after_attempt, wait_exponential

from mock_mode import MOCK_MODE
from agent.mock_data import MOCK_RESOURCES
from agent.state import AgentState


# ── Helpers ────────────────────────────────────────────────────────────────────

def _skills_to_improve(gap_map: dict) -> list[str]:
    """Return skill names tagged 'learn' or 'partial' — highest match first."""
    candidates = []
    for cat in gap_map.get("categories", []):
        for skill in cat.get("skills", []):
            if skill.get("status") in ("learn", "partial"):
                candidates.append((skill.get("match", 0), skill["name"]))
    candidates.sort(reverse=True)
    return [name for _, name in candidates]


# ── Async Tavily fetch ─────────────────────────────────────────────────────────

async def _tavily_fetch(skill: str) -> list[dict]:
    from tavily import AsyncTavilyClient
    client = AsyncTavilyClient()
    result = await client.search(
        query=f"best {skill} learning resources tutorial course 2025",
        max_results=5,
    )
    return result.get("results", [])


async def _fetch_all_tavily(skills: list[str]) -> list[list[dict]]:
    return list(await asyncio.gather(*[_tavily_fetch(s) for s in skills]))


# ── ChromaDB RAG lookup ────────────────────────────────────────────────────────

def _rag_lookup(skill: str) -> list[dict]:
    from tools.rag_tool import RagTool
    tool = RagTool()
    return tool.query(skill, top_k=5)


# ── Claude scoring ─────────────────────────────────────────────────────────────

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def _score_and_merge(
    skill: str,
    curated: list[dict],
    fresh: list[dict],
    job_data: dict,
) -> list[dict]:
    from prompts.templates import RESOURCE_FINDER_PROMPT

    payload = {
        "skill": skill,
        "curated_resources": curated,
        "fresh_results": fresh,
        "job_context": {k: job_data.get(k) for k in ("title", "description")},
    }

    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        temperature=0,
        system=RESOURCE_FINDER_PROMPT,
        messages=[{
            "role": "user",
            "content": (
                f"Merge and rank these resources for skill '{skill}'.\n"
                f"Input: {json.dumps(payload)}\n"
                "Return ONLY the JSON: "
                '{"SkillName": [{title, provider, tags, rank, scores{...}}]}'
            ),
        }],
    )
    raw = re.sub(r"^```(?:json)?\s*", "", response.content[0].text.strip())
    raw = re.sub(r"\s*```$", "", raw)
    parsed = json.loads(raw)
    # Claude returns {skill: [resources]} — grab the first value
    resources = next(iter(parsed.values())) if parsed else []
    return resources[:3]


# ── Node ───────────────────────────────────────────────────────────────────────

def resource_finder(state: AgentState) -> dict[str, Any]:
    """
    For each LEARN / PARTIAL skill:
      1. Query ChromaDB (rag_tool) for curated resources
      2. Run Tavily search for fresh results (async, concurrent)
      3. Claude merges and scores on 6 dimensions, returns top 3
    Output: dict[skill_name → list[Resource]]
    """
    if MOCK_MODE:
        return {
            "resources": MOCK_RESOURCES,
            "phase": "resources_found",
            "error": "",
        }

    gap_map = state.get("gap_map", {})
    job_data = state.get("job_data", {})
    skills = _skills_to_improve(gap_map)

    if not skills:
        return {"resources": {}, "phase": "resources_found", "error": ""}

    try:
        # Concurrent Tavily searches for all skills at once
        all_tavily = asyncio.run(_fetch_all_tavily(skills))

        resources: dict[str, list] = {}
        for skill, tavily_hits in zip(skills, all_tavily):
            curated = _rag_lookup(skill)
            resources[skill] = _score_and_merge(skill, curated, tavily_hits, job_data)

        return {
            "resources": resources,
            "phase": "resources_found",
            "error": "",
        }
    except Exception as exc:
        return {"error": str(exc), "phase": "error"}
