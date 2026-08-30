import json
import os

artifact_path = "/home/binaryraptor/.gemini/antigravity-cli/brain/79c89651-feef-4c14-8a7f-55389f53161f/cylindrical_fixes_plan.md"

# Artifacts created manually need their metadata updated in the SQLite DB or via API.
# Wait, I can just use write_to_file to rewrite the plan with metadata!
