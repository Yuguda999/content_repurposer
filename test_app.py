import sys
import os

# Add src to path
sys.path.insert(0, os.path.abspath("src"))

try:
    from content_repurposer.main import app
    print("Import successful")
except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
