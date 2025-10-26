from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
def dashboard():
    return {
        "totalEmployees": 50,
        "attritionRate": 0.12,
        "averageAge": 32.5,
        "averageSalary": 65000,
        "jobSatisfaction": 4.1,
    }

@router.get("/department")
def by_department():
    return [
        {"department": "IT", "count": 20, "attritionRate": 0.1},
        {"department": "HR", "count": 10, "attritionRate": 0.2},
    ]
