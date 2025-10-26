from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class Employee(BaseModel):
    id: int
    name: str
    department: str
    age: int
    salary: float
    attrition: bool

# In-memory data
employees_db = [
    Employee(id=1, name="John Doe", department="IT", age=29, salary=70000, attrition=False),
    Employee(id=2, name="Mary Jane", department="HR", age=35, salary=65000, attrition=True),
]

@router.get("/")
def list_employees():
    return employees_db

@router.get("/{id}")
def get_employee(id: int):
    for emp in employees_db:
        if emp.id == id:
            return emp
    raise HTTPException(status_code=404, detail="Employee not found")

@router.post("/")
def create_employee(employee: Employee):
    employees_db.append(employee)
    return employee
