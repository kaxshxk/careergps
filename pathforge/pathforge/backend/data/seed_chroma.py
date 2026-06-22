"""
Seed script — populates the pathforge_resources ChromaDB collection.

Mock mode  : uses fake (zero-vector) embeddings, no API keys needed.
Real mode  : uses OpenAI text-embedding-3-small (requires OPENAI_API_KEY).

Run from pathforge/backend/:
    python data/seed_chroma.py
"""
import os
import sys

# Ensure backend/ is on sys.path
_here = os.path.dirname(os.path.abspath(__file__))
_backend = os.path.dirname(_here)
if _backend not in sys.path:
    sys.path.insert(0, _backend)

import chromadb  # noqa: E402

from mock_mode import MOCK_MODE  # noqa: E402

CHROMA_PATH = os.path.join(_backend, "chroma_db")
COLLECTION_NAME = "pathforge_resources"

# ── Resource catalogue (50 records, 5 per skill × 10 skills) ─────────────────

RESOURCES: list[dict] = [
    # ── Python ────────────────────────────────────────────────────────────────
    {"id": "py-1", "skill_id": "Python", "title": "Python for Everybody Specialization",
     "url": "https://coursera.org/specializations/python", "provider": "Coursera / UMich",
     "format": "course", "cost": "paid", "quality_score": 95, "difficulty": "beginner", "duration": "8 weeks"},
    {"id": "py-2", "skill_id": "Python", "title": "Automate the Boring Stuff with Python",
     "url": "https://automatetheboringstuff.com", "provider": "Al Sweigart",
     "format": "book", "cost": "free", "quality_score": 92, "difficulty": "beginner", "duration": "self-paced"},
    {"id": "py-3", "skill_id": "Python", "title": "Python Official Documentation",
     "url": "https://docs.python.org/3", "provider": "Python.org",
     "format": "docs", "cost": "free", "quality_score": 88, "difficulty": "intermediate", "duration": "reference"},
    {"id": "py-4", "skill_id": "Python", "title": "Real Python Tutorials",
     "url": "https://realpython.com", "provider": "Real Python",
     "format": "article", "cost": "freemium", "quality_score": 90, "difficulty": "intermediate", "duration": "varies"},
    {"id": "py-5", "skill_id": "Python", "title": "Python Crash Course, 3rd Edition",
     "url": "https://nostarch.com/python-crash-course-3rd-edition", "provider": "No Starch Press",
     "format": "book", "cost": "paid", "quality_score": 93, "difficulty": "beginner", "duration": "self-paced"},

    # ── JavaScript ────────────────────────────────────────────────────────────
    {"id": "js-1", "skill_id": "JavaScript", "title": "The Odin Project — JavaScript Path",
     "url": "https://theodinproject.com/paths/full-stack-javascript", "provider": "The Odin Project",
     "format": "course", "cost": "free", "quality_score": 94, "difficulty": "beginner", "duration": "20 weeks"},
    {"id": "js-2", "skill_id": "JavaScript", "title": "JavaScript.info",
     "url": "https://javascript.info", "provider": "javascript.info",
     "format": "article", "cost": "free", "quality_score": 96, "difficulty": "beginner", "duration": "self-paced"},
    {"id": "js-3", "skill_id": "JavaScript", "title": "You Don't Know JS (book series)",
     "url": "https://github.com/getify/You-Dont-Know-JS", "provider": "Kyle Simpson",
     "format": "book", "cost": "free", "quality_score": 91, "difficulty": "intermediate", "duration": "self-paced"},
    {"id": "js-4", "skill_id": "JavaScript", "title": "JavaScript — The Complete Guide",
     "url": "https://udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced", "provider": "Udemy",
     "format": "course", "cost": "paid", "quality_score": 89, "difficulty": "beginner", "duration": "52 hours"},
    {"id": "js-5", "skill_id": "JavaScript", "title": "MDN JavaScript Reference",
     "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "provider": "Mozilla",
     "format": "docs", "cost": "free", "quality_score": 95, "difficulty": "intermediate", "duration": "reference"},

    # ── SQL ───────────────────────────────────────────────────────────────────
    {"id": "sql-1", "skill_id": "SQL", "title": "SQL for Data Science",
     "url": "https://coursera.org/learn/sql-for-data-science", "provider": "Coursera / UC Davis",
     "format": "course", "cost": "paid", "quality_score": 88, "difficulty": "beginner", "duration": "4 weeks"},
    {"id": "sql-2", "skill_id": "SQL", "title": "Mode SQL Tutorial",
     "url": "https://mode.com/sql-tutorial", "provider": "Mode Analytics",
     "format": "article", "cost": "free", "quality_score": 90, "difficulty": "beginner", "duration": "self-paced"},
    {"id": "sql-3", "skill_id": "SQL", "title": "SQLZoo Interactive Exercises",
     "url": "https://sqlzoo.net", "provider": "SQLZoo",
     "format": "interactive", "cost": "free", "quality_score": 86, "difficulty": "beginner", "duration": "self-paced"},
    {"id": "sql-4", "skill_id": "SQL", "title": "LeetCode SQL 50",
     "url": "https://leetcode.com/studyplan/top-sql-50", "provider": "LeetCode",
     "format": "practice", "cost": "freemium", "quality_score": 92, "difficulty": "intermediate", "duration": "50 problems"},
    {"id": "sql-5", "skill_id": "SQL", "title": "Use the Index, Luke",
     "url": "https://use-the-index-luke.com", "provider": "Markus Winand",
     "format": "article", "cost": "free", "quality_score": 89, "difficulty": "advanced", "duration": "reference"},

    # ── React ─────────────────────────────────────────────────────────────────
    {"id": "react-1", "skill_id": "React", "title": "React Official Docs (react.dev)",
     "url": "https://react.dev/learn", "provider": "Meta / React team",
     "format": "docs", "cost": "free", "quality_score": 97, "difficulty": "beginner", "duration": "reference"},
    {"id": "react-2", "skill_id": "React", "title": "Full Stack Open — React Modules",
     "url": "https://fullstackopen.com/en", "provider": "University of Helsinki",
     "format": "course", "cost": "free", "quality_score": 95, "difficulty": "intermediate", "duration": "10 weeks"},
    {"id": "react-3", "skill_id": "React", "title": "Epic React by Kent C. Dodds",
     "url": "https://epicreact.dev", "provider": "Kent C. Dodds",
     "format": "course", "cost": "paid", "quality_score": 96, "difficulty": "intermediate", "duration": "12 weeks"},
    {"id": "react-4", "skill_id": "React", "title": "Scrimba React Course",
     "url": "https://scrimba.com/learn/learnreact", "provider": "Scrimba",
     "format": "interactive", "cost": "freemium", "quality_score": 87, "difficulty": "beginner", "duration": "13 hours"},
    {"id": "react-5", "skill_id": "React", "title": "React Patterns",
     "url": "https://reactpatterns.com", "provider": "Michael Chan",
     "format": "article", "cost": "free", "quality_score": 84, "difficulty": "intermediate", "duration": "reference"},

    # ── Docker ────────────────────────────────────────────────────────────────
    {"id": "docker-1", "skill_id": "Docker", "title": "Docker — Getting Started Tutorial",
     "url": "https://docs.docker.com/get-started", "provider": "Docker Inc.",
     "format": "docs", "cost": "free", "quality_score": 93, "difficulty": "beginner", "duration": "~4 hours"},
    {"id": "docker-2", "skill_id": "Docker", "title": "Docker & Kubernetes — The Practical Guide",
     "url": "https://udemy.com/course/docker-kubernetes-the-practical-guide", "provider": "Udemy",
     "format": "course", "cost": "paid", "quality_score": 91, "difficulty": "intermediate", "duration": "23 hours"},
    {"id": "docker-3", "skill_id": "Docker", "title": "Play with Docker Classroom",
     "url": "https://training.play-with-docker.com", "provider": "Docker Inc.",
     "format": "interactive", "cost": "free", "quality_score": 86, "difficulty": "beginner", "duration": "self-paced"},
    {"id": "docker-4", "skill_id": "Docker", "title": "Docker Deep Dive (Nigel Poulton)",
     "url": "https://nigelpoulton.com/books", "provider": "Nigel Poulton",
     "format": "book", "cost": "paid", "quality_score": 88, "difficulty": "beginner", "duration": "self-paced"},
    {"id": "docker-5", "skill_id": "Docker", "title": "Dockerfile Best Practices",
     "url": "https://docs.docker.com/develop/develop-images/dockerfile_best-practices", "provider": "Docker Inc.",
     "format": "docs", "cost": "free", "quality_score": 90, "difficulty": "intermediate", "duration": "reference"},

    # ── AWS ───────────────────────────────────────────────────────────────────
    {"id": "aws-1", "skill_id": "AWS", "title": "AWS Cloud Practitioner Essentials",
     "url": "https://aws.amazon.com/training/learn-about/cloud-practitioner", "provider": "AWS Training",
     "format": "course", "cost": "free", "quality_score": 92, "difficulty": "beginner", "duration": "6 hours"},
    {"id": "aws-2", "skill_id": "AWS", "title": "AWS Solutions Architect Associate (A Cloud Guru)",
     "url": "https://acloudguru.com/course/aws-certified-solutions-architect-associate-saa-c03", "provider": "A Cloud Guru",
     "format": "course", "cost": "paid", "quality_score": 90, "difficulty": "intermediate", "duration": "40 hours"},
    {"id": "aws-3", "skill_id": "AWS", "title": "AWS Documentation",
     "url": "https://docs.aws.amazon.com", "provider": "Amazon",
     "format": "docs", "cost": "free", "quality_score": 87, "difficulty": "intermediate", "duration": "reference"},
    {"id": "aws-4", "skill_id": "AWS", "title": "AWS Hands-On Tutorials",
     "url": "https://aws.amazon.com/getting-started/hands-on", "provider": "Amazon",
     "format": "interactive", "cost": "free", "quality_score": 88, "difficulty": "beginner", "duration": "varies"},
    {"id": "aws-5", "skill_id": "AWS", "title": "TutorialsDojo AWS Practice Exams",
     "url": "https://tutorialsdojo.com/aws-cheat-sheets", "provider": "Tutorials Dojo",
     "format": "practice", "cost": "paid", "quality_score": 89, "difficulty": "intermediate", "duration": "self-paced"},

    # ── PyTorch ───────────────────────────────────────────────────────────────
    {"id": "pytorch-1", "skill_id": "PyTorch", "title": "Deep Learning Specialization",
     "url": "https://coursera.org/specializations/deep-learning", "provider": "deeplearning.ai",
     "format": "course", "cost": "paid", "quality_score": 95, "difficulty": "intermediate", "duration": "3 months"},
    {"id": "pytorch-2", "skill_id": "PyTorch", "title": "Fast.ai Practical Deep Learning",
     "url": "https://course.fast.ai", "provider": "fast.ai",
     "format": "course", "cost": "free", "quality_score": 94, "difficulty": "intermediate", "duration": "25 hours"},
    {"id": "pytorch-3", "skill_id": "PyTorch", "title": "PyTorch Official Tutorials",
     "url": "https://pytorch.org/tutorials", "provider": "PyTorch / Meta",
     "format": "docs", "cost": "free", "quality_score": 91, "difficulty": "intermediate", "duration": "reference"},
    {"id": "pytorch-4", "skill_id": "PyTorch", "title": "Dive into Deep Learning (d2l.ai)",
     "url": "https://d2l.ai", "provider": "d2l.ai",
     "format": "book", "cost": "free", "quality_score": 92, "difficulty": "advanced", "duration": "self-paced"},
    {"id": "pytorch-5", "skill_id": "PyTorch", "title": "PyTorch Lightning Documentation",
     "url": "https://lightning.ai/docs/pytorch/stable", "provider": "Lightning AI",
     "format": "docs", "cost": "free", "quality_score": 88, "difficulty": "intermediate", "duration": "reference"},

    # ── TypeScript ────────────────────────────────────────────────────────────
    {"id": "ts-1", "skill_id": "TypeScript", "title": "TypeScript Handbook",
     "url": "https://typescriptlang.org/docs/handbook/intro.html", "provider": "Microsoft",
     "format": "docs", "cost": "free", "quality_score": 96, "difficulty": "beginner", "duration": "reference"},
    {"id": "ts-2", "skill_id": "TypeScript", "title": "Execute Program — TypeScript Track",
     "url": "https://executeprogram.com/courses/typescript", "provider": "Execute Program",
     "format": "interactive", "cost": "paid", "quality_score": 93, "difficulty": "intermediate", "duration": "self-paced"},
    {"id": "ts-3", "skill_id": "TypeScript", "title": "Total TypeScript by Matt Pocock",
     "url": "https://totaltypescript.com", "provider": "Matt Pocock",
     "format": "course", "cost": "freemium", "quality_score": 95, "difficulty": "advanced", "duration": "varies"},
    {"id": "ts-4", "skill_id": "TypeScript", "title": "TypeScript Deep Dive",
     "url": "https://basarat.gitbook.io/typescript", "provider": "Basarat Ali Syed",
     "format": "book", "cost": "free", "quality_score": 88, "difficulty": "intermediate", "duration": "self-paced"},
    {"id": "ts-5", "skill_id": "TypeScript", "title": "TypeScript Exercises",
     "url": "https://typescript-exercises.github.io", "provider": "Community",
     "format": "practice", "cost": "free", "quality_score": 85, "difficulty": "intermediate", "duration": "self-paced"},

    # ── Machine Learning ──────────────────────────────────────────────────────
    {"id": "ml-1", "skill_id": "Machine Learning", "title": "Machine Learning Specialization",
     "url": "https://coursera.org/specializations/machine-learning-introduction", "provider": "deeplearning.ai / Stanford",
     "format": "course", "cost": "paid", "quality_score": 97, "difficulty": "beginner", "duration": "3 months"},
    {"id": "ml-2", "skill_id": "Machine Learning", "title": "Hands-On Machine Learning (Aurélien Géron)",
     "url": "https://oreilly.com/library/view/hands-on-machine-learning/9781098125967", "provider": "O'Reilly",
     "format": "book", "cost": "paid", "quality_score": 96, "difficulty": "intermediate", "duration": "self-paced"},
    {"id": "ml-3", "skill_id": "Machine Learning", "title": "Kaggle Learn — ML Courses",
     "url": "https://kaggle.com/learn", "provider": "Kaggle",
     "format": "interactive", "cost": "free", "quality_score": 89, "difficulty": "beginner", "duration": "varies"},
    {"id": "ml-4", "skill_id": "Machine Learning", "title": "Scikit-learn Documentation",
     "url": "https://scikit-learn.org/stable/user_guide.html", "provider": "scikit-learn",
     "format": "docs", "cost": "free", "quality_score": 90, "difficulty": "intermediate", "duration": "reference"},
    {"id": "ml-5", "skill_id": "Machine Learning", "title": "Made With ML — MLOps Course",
     "url": "https://madewithml.com", "provider": "Goku Mohandas",
     "format": "course", "cost": "free", "quality_score": 93, "difficulty": "advanced", "duration": "self-paced"},

    # ── System Design ─────────────────────────────────────────────────────────
    {"id": "sys-1", "skill_id": "System Design", "title": "System Design Interview (Alex Xu)",
     "url": "https://bytebytego.com", "provider": "ByteByteGo",
     "format": "book", "cost": "paid", "quality_score": 95, "difficulty": "intermediate", "duration": "self-paced"},
    {"id": "sys-2", "skill_id": "System Design", "title": "Grokking the System Design Interview",
     "url": "https://designgurus.io/course/grokking-the-system-design-interview", "provider": "Design Gurus",
     "format": "course", "cost": "paid", "quality_score": 91, "difficulty": "intermediate", "duration": "self-paced"},
    {"id": "sys-3", "skill_id": "System Design", "title": "High Scalability Blog",
     "url": "http://highscalability.com", "provider": "Todd Hoff",
     "format": "article", "cost": "free", "quality_score": 85, "difficulty": "advanced", "duration": "reference"},
    {"id": "sys-4", "skill_id": "System Design", "title": "AWS Architecture Center",
     "url": "https://aws.amazon.com/architecture", "provider": "Amazon",
     "format": "article", "cost": "free", "quality_score": 88, "difficulty": "intermediate", "duration": "reference"},
    {"id": "sys-5", "skill_id": "System Design", "title": "Designing Data-Intensive Applications",
     "url": "https://dataintensive.net", "provider": "Martin Kleppmann / O'Reilly",
     "format": "book", "cost": "paid", "quality_score": 97, "difficulty": "advanced", "duration": "self-paced"},
]

assert len(RESOURCES) == 50, f"Expected 50 resources, got {len(RESOURCES)}"


def _doc_text(r: dict) -> str:
    return (
        f"{r['title']} — {r['skill_id']} {r['difficulty']} {r['format']} "
        f"by {r['provider']}. Cost: {r['cost']}. Duration: {r['duration']}."
    )


def seed() -> None:
    client = chromadb.PersistentClient(path=CHROMA_PATH)

    if MOCK_MODE:
        # No embedding function — supply pre-computed fake embeddings (384-dim zeros).
        # This avoids any dependency on onnxruntime or OpenAI in demo/test mode.
        collection = client.get_or_create_collection(COLLECTION_NAME)

        ids = [r["id"] for r in RESOURCES]
        docs = [_doc_text(r) for r in RESOURCES]
        metas = [{k: v for k, v in r.items()} for r in RESOURCES]
        # 384-dim zero vector — sufficient for mock; semantic search won't be meaningful
        # but the collection will be populated and queryable.
        fake_embs = [[0.0] * 384 for _ in RESOURCES]

        collection.upsert(
            ids=ids,
            documents=docs,
            metadatas=metas,
            embeddings=fake_embs,
        )
    else:
        from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
        ef = OpenAIEmbeddingFunction(
            api_key=os.environ["OPENAI_API_KEY"],
            model_name="text-embedding-3-small",
        )
        collection = client.get_or_create_collection(COLLECTION_NAME, embedding_function=ef)

        ids = [r["id"] for r in RESOURCES]
        docs = [_doc_text(r) for r in RESOURCES]
        metas = [{k: v for k, v in r.items()} for r in RESOURCES]

        collection.upsert(ids=ids, documents=docs, metadatas=metas)

    count = collection.count()
    print(f"OK {count} resources inserted into '{COLLECTION_NAME}' at {CHROMA_PATH}")
    assert count == 50, f"Expected 50 but found {count}"
    print("OK 50 resources inserted successfully.")


if __name__ == "__main__":
    seed()
