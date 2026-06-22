import os

# Set MOCK_MODE=true to run the full app with zero external API calls.
# All LLM, search, DB, and vector-store calls return hardcoded mock data
# that matches frontend/lib/mockData.ts shapes exactly.
#
# To go live: set MOCK_MODE=false and fill in real keys in .env

MOCK_MODE = os.getenv("MOCK_MODE", "true").strip().lower() in {"1", "true", "yes", "on"}
