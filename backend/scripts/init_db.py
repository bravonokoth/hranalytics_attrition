#!/usr/bin/env python3
"""
Initialize the database and create tables
Run this before starting the app for the first time
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.engine import create_db_and_tables

def main():
    print("Creating database tables...")
    try:
        create_db_and_tables()
        print("✓ Database tables created successfully!")
    except Exception as e:
        print(f"✗ Error creating database tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()