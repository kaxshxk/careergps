import asyncio
import json
import re
from typing import Any

import anthropic
from tenacity import retry, stop_after_attempt, wait_exponential

from mock_mode import MOCK_MODE
from agent.mock_data import (
    MOCK_SKILL_FREQUENCY,
    MOCK_COMPENSATION_TIERS,
    MOCK_JOB_DATA,
)
from agent.state import AgentState


# ── Tavily query templates ─────────────────────────────────────────────────────

def _build_queries(job_title: str) -> list[str]:
    return [
        f"{job_title} required skills 2025",
        f"{job_title} salary compensation 2025",
        f"{job_title} job market demand trends 2025",
        f"{job_title} top tools and technologies hiring",
        f"{job_title} entry mid senior level requirements",
    ]


# ── Async Tavily search ────────────────────────────────────────────────────────

async def _tavily_search_async(query: str) -> dict:
    from tavily import AsyncTavilyClient
    client = AsyncTavilyClient()
    return await client.search(query=query, max_results=5)


async def _run_all_searches(queries: list[str]) -> list[dict]:
    return await asyncio.gather(*[_tavily_search_async(q) for q in queries])


# ── Claude aggregation ─────────────────────────────────────────────────────────

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def _aggregate_with_claude(job_title: str, search_results: list[dict]) -> dict:
    from prompts.templates import JOB_RESEARCHER_PROMPT

    combined_text = "\n\n---\n\n".join(
        f"Query: {r.get('query', '')}\n" +
        "\n".join(
            f"- {hit.get('title', '')}: {hit.get('content', '')[:400]}"
            for hit in r.get("results", [])
        )
        for r in search_results
    )

    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        temperature=0,
        system=JOB_RESEARCHER_PROMPT,
        messages=[{
            "role": "user",
            "content": (
                f"Job title: {job_title}\n\n"
                f"Search results:\n{combined_text}\n\n"
                "Return the JSON object now."
            ),
        }],
    )

    raw = response.content[0].text
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)


# ── Node ───────────────────────────────────────────────────────────────────────

def job_researcher(state: AgentState) -> dict[str, Any]:
    """
    Runs 5 concurrent Tavily searches for the job title extracted by input_parser,
    then uses Claude to aggregate skill frequency counts and compensation tiers.
    """
    if MOCK_MODE:
        enriched_job = dict(state.get("job_data") or MOCK_JOB_DATA)
        return {
            "market_skills": MOCK_SKILL_FREQUENCY,
            "job_data": {**enriched_job, "compensationTiers": MOCK_COMPENSATION_TIERS},
            "phase": "market_researched",
            "error": "",
        }

    job_data = state.get("job_data") or {}
    job_title = job_data.get("title", "")
    if not job_title:
        return {"error": "job_data.title is missing", "phase": "error"}

    try:
        queries = _build_queries(job_title)
        search_results = asyncio.run(_run_all_searches(queries))

        aggregated = _aggregate_with_claude(job_title, search_results)

        market_skills = aggregated.get("skillFrequency", [])
        compensation_tiers = aggregated.get("compensationTiers", [])

        enriched_job = {**job_data, "compensationTiers": compensation_tiers}

        return {
            "market_skills": market_skills,
            "job_data": enriched_job,
            "phase": "market_researched",
            "error": "",
        }
    except Exception as exc:
        return {"error": str(exc), "phase": "error"}
