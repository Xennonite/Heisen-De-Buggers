#!/usr/bin/env python3
"""
MetroVerity History Reset Utility
---------------------------------
This script safely clears the inspection history.
It deletes all records from the 'scan_records' database table 
and clears all uploaded package images from the backend storage.

Usage:
    python scripts/clear_history.py
"""

import sqlite3
import os
import glob
from pathlib import Path

def clear_history():
    project_root = Path(__file__).resolve().parent.parent
    db_path = project_root / 'backend' / 'metroverity.db'
    uploads_dir = project_root / 'backend' / 'uploads'

    print("🗑️  Clearing MetroVerity Inspection History...")

    if db_path.exists():
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM scan_records;")
            conn.commit()
            conn.close()
            print("   - Database records cleared.")
        except Exception as e:
            print(f"   ! Error clearing database: {e}")
    else:
        print("   - Database file not found, skipping DB cleanup.")

    if uploads_dir.exists():
        try:
            files = glob.glob(os.path.join(uploads_dir, '*'))
            count = 0
            for f in files:
                if os.path.isfile(f):
                    os.remove(f)
                    count += 1
            print(f"   - Removed {count} image(s) from uploads.")
        except Exception as e:
            print(f"   ! Error clearing uploads: {e}")
    else:
        print("   - Uploads directory not found, skipping image cleanup.")

    print("✅ History cleared successfully! Refresh your browser to see the empty log.")

if __name__ == "__main__":
    clear_history()
