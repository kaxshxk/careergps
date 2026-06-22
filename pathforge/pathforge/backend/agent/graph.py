import os

from langgraph.graph import END, StateGraph

from mock_mode import MOCK_MODE
from agent.state import AgentState
from agent.nodes.input_parser import input_parser
from agent.nodes.job_researcher import job_researcher
from agent.nodes.skill_tree_builder import skill_tree_builder
from agent.nodes.gap_analyzer import gap_analyzer
from agent.nodes.resource_finder import resource_finder
from agent.nodes.roadmap_generator import roadmap_generator
from agent.nodes.memory_saver import memory_saver
from agent.nodes.followup_handler import followup_handler


# ── LangSmith tracing ──────────────────────────────────────────────────────────

if not MOCK_MODE:
    os.environ.setdefault("LANGCHAIN_TRACING_V2", os.getenv("LANGCHAIN_TRACING_V2", "false"))
    os.environ.setdefault("LANGCHAIN_PROJECT", os.getenv("LANGCHAIN_PROJECT", "pathforge"))
else:
    os.environ["LANGCHAIN_TRACING_V2"] = "false"


# ── Error routing helper ───────────────────────────────────────────────────────

def _route(state: AgentState) -> str:
    """Route to 'error_end' if the previous node set an error, otherwise continue."""
    return "error_end" if state.get("error") else "continue"


def _error_end(_state: AgentState) -> dict:
    return {"phase": "error"}


# ── Main pipeline graph ────────────────────────────────────────────────────────

def build_main_graph() -> StateGraph:
    g = StateGraph(AgentState)

    # Register nodes
    g.add_node("input_parser",      input_parser)
    g.add_node("job_researcher",    job_researcher)
    g.add_node("skill_tree_builder", skill_tree_builder)
    g.add_node("gap_analyzer",      gap_analyzer)
    g.add_node("resource_finder",   resource_finder)
    g.add_node("roadmap_generator", roadmap_generator)
    g.add_node("memory_saver",      memory_saver)
    g.add_node("error_end",         _error_end)

    # Entry point
    g.set_entry_point("input_parser")

    # Sequential edges with conditional error routing after each node
    pipeline = [
        "input_parser",
        "job_researcher",
        "skill_tree_builder",
        "gap_analyzer",
        "resource_finder",
        "roadmap_generator",
        "memory_saver",
    ]

    for i, node in enumerate(pipeline):
        next_node = pipeline[i + 1] if i + 1 < len(pipeline) else None

        if next_node:
            g.add_conditional_edges(
                node,
                _route,
                {"continue": next_node, "error_end": "error_end"},
            )
        else:
            # Last node: route to END or error_end
            g.add_conditional_edges(
                node,
                _route,
                {"continue": END, "error_end": "error_end"},
            )

    g.add_edge("error_end", END)

    return g.compile()


# ── Follow-up graph (separate entry point) ────────────────────────────────────

def build_followup_graph() -> StateGraph:
    g = StateGraph(AgentState)

    g.add_node("followup_handler", followup_handler)
    g.add_node("error_end", _error_end)

    g.set_entry_point("followup_handler")
    g.add_conditional_edges(
        "followup_handler",
        _route,
        {"continue": END, "error_end": "error_end"},
    )
    g.add_edge("error_end", END)

    return g.compile()


# ── Compiled singletons ───────────────────────────────────────────────────────

main_graph     = build_main_graph()
followup_graph = build_followup_graph()

# Convenience alias used by E2E tests and the FastAPI app
graph = main_graph
