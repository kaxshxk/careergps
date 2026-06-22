import base64
import re
from typing import Any

import anthropic
import fitz  # PyMuPDF
from pydantic import BaseModel, Field
from tenacity import retry, stop_after_attempt, wait_exponential

from mock_mode import MOCK_MODE
from agent.mock_data import MOCK_JOB_DATA
from agent.state import AgentState


# ── Pydantic model for Claude output validation ────────────────────────────────

class MarketSignalModel(BaseModel):
    value: int = Field(..., ge=0, le=100)
    trend: str = Field(..., pattern="^(up|down|flat)$")


class JobDataModel(BaseModel):
    title: str
    tags: list[str]
    description: str
    dailyOps: list[str]
    marketSignal: MarketSignalModel
    agentAnalysis: str
    confidenceScore: float = Field(..., ge=0.0, le=100.0)
    marketTrendSparkline: list[int]


# ── Helpers ────────────────────────────────────────────────────────────────────

def _detect_input_type(raw: str) -> str:
    """Heuristic detection of input type from raw string."""
    raw = raw.strip()
    if re.match(r"^https?://", raw):
        return "url"
    if raw.lower().endswith(".pdf"):
        return "pdf"
    if raw.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".gif")):
        return "image"
    return "text"


def _extract_text_from_pdf(path: str) -> str:
    doc = fitz.open(path)
    pages = [page.get_text() for page in doc]
    return "\n".join(pages)


def _image_to_base64(path: str) -> tuple[str, str]:
    """Returns (base64_data, media_type)."""
    ext = path.rsplit(".", 1)[-1].lower()
    media_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg",
                 "png": "image/png", "webp": "image/webp", "gif": "image/gif"}
    media_type = media_map.get(ext, "image/png")
    with open(path, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode()
    return data, media_type


# ── Real implementation ────────────────────────────────────────────────────────

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def _call_claude_for_job_data(content_blocks: list[dict]) -> dict:
    from prompts.templates import INPUT_PARSER_PROMPT

    client = anthropic.Anthropic()
    messages = [{"role": "user", "content": content_blocks}]
    system = INPUT_PARSER_PROMPT

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        temperature=0,
        system=system,
        messages=messages,
    )

    import json
    raw_json = response.content[0].text
    # Strip markdown fences if present
    raw_json = re.sub(r"^```(?:json)?\s*", "", raw_json.strip())
    raw_json = re.sub(r"\s*```$", "", raw_json)
    parsed = json.loads(raw_json)
    validated = JobDataModel(**parsed)
    return validated.model_dump()


def _build_content_blocks(raw: str, input_type: str) -> list[dict]:
    if input_type == "text":
        return [{"type": "text", "text": f"Job posting:\n\n{raw}"}]

    if input_type == "url":
        return [{"type": "text",
                 "text": f"Extract the job posting from this URL and return the JSON:\n{raw}"}]

    if input_type == "pdf":
        text = _extract_text_from_pdf(raw)
        return [{"type": "text", "text": f"Job posting (extracted from PDF):\n\n{text}"}]

    if input_type == "image":
        b64, media_type = _image_to_base64(raw)
        return [
            {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": b64}},
            {"type": "text", "text": "Extract the job posting from this image and return the JSON."},
        ]

    return [{"type": "text", "text": raw}]


# ── Node ───────────────────────────────────────────────────────────────────────

def input_parser(state: AgentState) -> dict[str, Any]:
    """
    Parses raw_input into structured job_data.
    Supports: plain text, URL, PDF file path, image file path.
    """
    if MOCK_MODE:
        return {
            "job_data": MOCK_JOB_DATA,
            "input_type": _detect_input_type(state.get("raw_input", "")),
            "phase": "input_parsed",
            "error": "",
        }

    raw = state.get("raw_input", "")
    if not raw:
        return {"error": "raw_input is empty", "phase": "error"}

    input_type = state.get("input_type") or _detect_input_type(raw)

    try:
        content_blocks = _build_content_blocks(raw, input_type)
        job_data = _call_claude_for_job_data(content_blocks)
        return {
            "job_data": job_data,
            "input_type": input_type,
            "phase": "input_parsed",
            "error": "",
        }
    except Exception as exc:
        return {"error": str(exc), "phase": "error"}
