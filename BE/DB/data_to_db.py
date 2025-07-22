import sqlite3
import pandas as pd

# CSV 불러오기
df = pd.read_csv("restaurants_ready.csv")
print(df.head())
# DB 연결
conn = sqlite3.connect("BE/DB/Data.db")
cursor = conn.cursor()


# DataFrame → DB 삽입
conn.execute("PRAGMA foreign_keys = OFF;")
df.to_sql("restaurants", conn, if_exists="replace", index=False)

conn.commit()
conn.close()
print("업로드 완료")

import sqlite3
conn = sqlite3.connect("Data.db")
cursor = conn.cursor()

import os
print(os.path.abspath("Data.db"))
