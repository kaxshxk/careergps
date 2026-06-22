from typing import TypedDict


class AgentState(TypedDict):
    raw_input: str          # raw user input (text, URL, PDF path, or image path)
    input_type: str         # "text" | "url" | "pdf" | "image"
    job_data: dict          # parsed job details — matches JobData shape in types.ts
    user_profile: dict      # chat answers — matches UserProfile shape in types.ts
    market_skills: list     # skill frequency list — matches SkillFrequencyItem[]
    skill_tree: dict        # skill categories + gap map — matches GapMap shape
    gap_map: dict           # match score + categories — matches GapMap shape
    resources: dict         # skill → resource list — matches resources in mockData.ts
    roadmap: dict           # monthly roadmap — matches Roadmap shape
    session_id: str         # unique session identifier
    match_score: int        # overall match percentage 0–100
    error: str              # last error message; empty string if none
    phase: str              # current pipeline phase for WebSocket streaming
    reply: str              # follow-up handler response text
