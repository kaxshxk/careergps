"""
ChromaDB semantic search wrapper.
Real mode: queries the 'pathforge_resources' collection.
Mock mode: returns MOCK_RESOURCES filtered by skill name.
"""
import os
from typing import Any

from mock_mode import MOCK_MODE
from agent.mock_data import MOCK_RESOURCES

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA_PATH = os.path.join(_BACKEND_DIR, "chroma_db")
COLLECTION_NAME = "pathforge_resources"


class RagTool:
    """Thin query wrapper over the pathforge_resources ChromaDB collection."""

    def __init__(self) -> None:
        if not MOCK_MODE:
            import chromadb
            self._client = chromadb.PersistentClient(path=CHROMA_PATH)
            self._ef = self._build_ef()
            self._collection = self._client.get_or_create_collection(
                COLLECTION_NAME,
                embedding_function=self._ef,
            )

    # ── Embedding function factory ─────────────────────────────────────────────

    @staticmethod
    def _build_ef():
        """OpenAI embeddings in real mode (requires OPENAI_API_KEY in env)."""
        from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
        return OpenAIEmbeddingFunction(
            api_key=os.environ["OPENAI_API_KEY"],
            model_name="text-embedding-3-small",
        )

    # ── Public query interface ─────────────────────────────────────────────────

    def query(self, skill_name: str, top_k: int = 3) -> list[dict[str, Any]]:
        """
        Returns up to `top_k` resources for a given skill.
        Results are re-ranked by combining semantic distance with quality_score.
        """
        if MOCK_MODE:
            return self._mock_query(skill_name, top_k)

        results = self._collection.query(
            query_texts=[skill_name],
            n_results=min(top_k * 2, 10),  # over-fetch for re-ranking
        )
        return self._rerank(results, top_k)

    # ── Mock fallback ──────────────────────────────────────────────────────────

    @staticmethod
    def _mock_query(skill_name: str, top_k: int) -> list[dict[str, Any]]:
        """Return mock resources for the skill, or PyTorch resources as fallback."""
        hits = MOCK_RESOURCES.get(skill_name) or MOCK_RESOURCES.get("PyTorch", [])
        return list(hits[:top_k])

    # ── Re-ranking ─────────────────────────────────────────────────────────────

    @staticmethod
    def _rerank(results: dict, top_k: int) -> list[dict[str, Any]]:
        """
        Combine chromadb cosine distance with quality_score.
        Final score = 0.6 × (1 - distance) + 0.4 × (quality_score / 100)
        """
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        scored = []
        for meta, dist in zip(metadatas, distances):
            quality = meta.get("quality_score", 50) / 100.0
            semantic = max(0.0, 1.0 - dist)
            score = 0.6 * semantic + 0.4 * quality
            scored.append((score, meta))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [m for _, m in scored[:top_k]]
