import json
from typing import Any

import anthropic
from tenacity import retry, stop_after_attempt, wait_exponential

from mock_mode import MOCK_MODE
from agent.state import AgentState

_MOCK_REPLY = (
    "Great question! Based on your current profile against the Senior ML Engineer "
    "market, I'd focus on PyTorch next — it appears in 88% of postings and builds "
    "directly on your existing Python strength (proficiency 4). Once you reach "
    "proficiency 3 in PyTorch, your overall match score will jump from 67% to ~76%. "
    "Your roadmap's Week 05 Scikit-learn module is the perfect bridge to get there."
)


# ── Real Claude call ───────────────────────────────────────────────────────────

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def _call_claude(message: str, state: AgentState) -> str:
    from prompts.templates import FOLLOWUP_PROMPT
    from prompts.system_prompt import SYSTEM_PROMPT

    context = json.dumps({
        "job_title":   state.get("job_data", {}).get("title", ""),
        "match_score": state.get("match_score", 0),
        "gap_summary": [
            {"skill": s["name"], "status": s["status"]}
            for cat in state.get("gap_map", {}).get("categories", [])
            for s in cat.get("skills", [])
        ],
        "roadmap_months": [
            m.get("title") for m in state.get("roadmap", {}).get("months", [])
        ],
    }, indent=2)

    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        temperature=0.3,
        system=SYSTEM_PROMPT + "\n\n" + FOLLOWUP_PROMPT.format(context=context),
        messages=[{"role": "user", "content": message}],
    )
    return response.content[0].text


# ── Node ───────────────────────────────────────────────────────────────────────

def followup_handler(state: AgentState) -> dict[str, Any]:
    """
    Handles post-analysis follow-up questions using the full pipeline state
    as grounding context. temperature=0.3 for slight conversational variety.
    """
    if MOCK_MODE:
        return {
            "reply": _MOCK_REPLY,
            "phase": "followup_complete",
            "error": "",
        }

    message = state.get("raw_input", "").strip()
    if not message:
        return {"error": "No follow-up message provided", "phase": "error", "reply": ""}

    try:
        reply = _call_claude(message, state)
        return {"reply": reply, "phase": "followup_complete", "error": ""}
    except Exception as exc:
        return {"error": str(exc), "phase": "error", "reply": ""}
