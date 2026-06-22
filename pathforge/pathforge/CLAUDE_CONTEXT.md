# PathForge — Build Context

## What this project is
AI career navigator agent. User enters job title plus resume 
and answers personalized questions via conversational chat. 
Agent analyzes live job market via Tavily, builds skill gap 
analysis and personalized learning roadmap using Claude Sonnet 4 
orchestrated by LangGraph.
Supports both IT and Non-IT roles including marketing, finance, 
design, healthcare, sales, legal, education, HR, operations, 
consulting, content creation, and entrepreneurship.

## Frontend
Built in Next.js 14 + React + Tailwind + shadcn/ui.
Located in /frontend. Light minimal theme.
All screens complete with mock data.
DO NOT modify any frontend files unless explicitly asked.

## Screens and flow
jobInput → agentChat → loadingScreen → 
intelligenceReport → skillMap → roadmap

## Backend to build
FastAPI + Python 3.12. Located in /backend.
Agent: LangGraph StateGraph.
LLM: Claude Sonnet 4 (claude-sonnet-4-20250514).
Search: Tavily API.
Database: Supabase PostgreSQL.
Vector store: ChromaDB.
Embeddings: OpenAI text-embedding-3-small.
PDF parsing: PyMuPDF.
Observability: LangSmith.

## API contract
Backend must return data in exactly the shapes defined 
in /frontend/lib/mockData.ts. Never change these shapes.

## Environment variables
All keys live in /backend/.env — never hardcode.

## Build rules
- One step at a time
- Write tests after every node
- Commit to GitHub after every completed step
- Never modify frontend files
- Always match mockData.ts shapes exactly

## Current task
STEP 1 — Foundation and infrastructure
