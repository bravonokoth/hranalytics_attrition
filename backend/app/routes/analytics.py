from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app.db.session import get_session
from app.models.employee import Employee

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(session: Session = Depends(get_session)):
    """Get dashboard statistics"""
    total_employees = session.exec(select(func.count(Employee.id))).one()
    
    # Attrition rate
    attrition_count = session.exec(
        select(func.count(Employee.id)).where(Employee.attrition == "Yes")
    ).one()
    attrition_rate = (attrition_count / total_employees * 100) if total_employees > 0 else 0
    
    # Average age
    avg_age = session.exec(select(func.avg(Employee.age))).one() or 0
    
    # Average salary
    avg_salary = session.exec(select(func.avg(Employee.monthly_income))).one() or 0
    
    # Average job satisfaction
    avg_satisfaction = session.exec(
        select(func.avg(Employee.job_satisfaction))
    ).one() or 0
    
    return {
        "totalEmployees": total_employees,
        "attritionRate": round(attrition_rate, 2),
        "averageAge": round(avg_age, 1),
        "averageSalary": round(avg_salary, 2),
        "jobSatisfaction": round(avg_satisfaction, 2)
    }


@router.get("/department")
def get_department_analytics(session: Session = Depends(get_session)):
    """Get analytics by department"""
    employees = session.exec(select(Employee)).all()
    
    dept_stats = {}
    for emp in employees:
        dept = emp.department or "Unknown"
        if dept not in dept_stats:
            dept_stats[dept] = {"total": 0, "attrition": 0}
        
        dept_stats[dept]["total"] += 1
        if emp.attrition == "Yes":
            dept_stats[dept]["attrition"] += 1
    
    result = []
    for dept, stats in dept_stats.items():
        attrition_rate = (stats["attrition"] / stats["total"] * 100) if stats["total"] > 0 else 0
        result.append({
            "department": dept,
            "total": stats["total"],
            "attrition": stats["attrition"],
            "attritionRate": round(attrition_rate, 2)
        })
    
    return result


@router.get("/salary")
def get_salary_analytics(session: Session = Depends(get_session)):
    """Get analytics by salary range"""
    employees = session.exec(select(Employee)).all()
    
    # Define salary ranges
    ranges = [
        (0, 30000, "0-30k"),
        (30000, 60000, "30k-60k"),
        (60000, 90000, "60k-90k"),
        (90000, 120000, "90k-120k"),
        (120000, float('inf'), "120k+")
    ]
    
    salary_stats = {label: {"total": 0, "attrition": 0} for _, _, label in ranges}
    
    for emp in employees:
        salary = emp.monthly_income or 0
        for min_sal, max_sal, label in ranges:
            if min_sal <= salary < max_sal:
                salary_stats[label]["total"] += 1
                if emp.attrition == "Yes":
                    salary_stats[label]["attrition"] += 1
                break
    
    result = []
    for label, stats in salary_stats.items():
        attrition_rate = (stats["attrition"] / stats["total"] * 100) if stats["total"] > 0 else 0
        result.append({
            "range": label,
            "total": stats["total"],
            "attrition": stats["attrition"],
            "attritionRate": round(attrition_rate, 2)
        })
    
    return result


@router.get("/role")
def get_role_analytics(session: Session = Depends(get_session)):
    """Get analytics by job role"""
    employees = session.exec(select(Employee)).all()
    
    role_stats = {}
    for emp in employees:
        role = emp.job_role or "Unknown"
        if role not in role_stats:
            role_stats[role] = {"total": 0, "attrition": 0}
        
        role_stats[role]["total"] += 1
        if emp.attrition == "Yes":
            role_stats[role]["attrition"] += 1
    
    result = []
    for role, stats in role_stats.items():
        attrition_rate = (stats["attrition"] / stats["total"] * 100) if stats["total"] > 0 else 0
        result.append({
            "role": role,
            "total": stats["total"],
            "attrition": stats["attrition"],
            "attritionRate": round(attrition_rate, 2)
        })
    
    return sorted(result, key=lambda x: x["total"], reverse=True)