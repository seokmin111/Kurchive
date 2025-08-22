# add_admin_column.py
# 기존 DB에 is_admin 열을 추가 (1회용)

import sqlite3
from sqlite3 import OperationalError
import os


DB_PATH = "BE/DB/Data.db"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_ABS_PATH = os.path.join(BASE_DIR, DB_PATH)

print(f"Connecting to database at: {DB_ABS_PATH}")

try:
    conn = sqlite3.connect(DB_ABS_PATH)
    cursor = conn.cursor()

    print("Attempting to add 'is_admin' column to 'users' table...")
    cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE")
    
    print("Success! 'is_admin' column added to the 'users' table.")

except OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column 'is_admin' already exists. No action needed.")
    else:
        print(f"An unexpected database error occurred: {e}")

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    if 'conn' in locals() and conn:
        conn.close()
        print("Database connection closed.")