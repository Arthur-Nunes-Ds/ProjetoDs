import sys
import os

# Add src to path
sys.path.append(os.path.abspath("src"))

try:
    from src.routes import st_schema
    from src.services import st_security, st_service
    print("Imports successful!")
except Exception as e:
    print(f"Import failed: {e}")
    sys.exit(1)
