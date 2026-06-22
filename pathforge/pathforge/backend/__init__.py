import sys
import os

# Add backend/ to sys.path so internal imports work when the package is
# imported from the project root (e.g. `from backend.agent.graph import graph`).
_here = os.path.dirname(os.path.abspath(__file__))
if _here not in sys.path:
    sys.path.insert(0, _here)
