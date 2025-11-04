from _fix_path import *

# scripts/seed.py
import pandas as pd
from sqlmodel import Session
from app.db.engine import engine
from app.models.employee import Employee

# 1. Read CSV
df = pd.read_csv("data/ibm_hr_attrition.csv")

# 2. Convert column names from PascalCase to snake_case
df.columns = df.columns.str.replace(r'(?<!^)(?=[A-Z])', '_', regex=True).str.lower()

# 3. Clean
df = df.replace({"": None, "NA": None})

# 4. Insert
with Session(engine) as s:
    for _, row in df.iterrows():
        s.add(Employee(**row.to_dict()))
    s.commit()

print("1470 employees loaded!")