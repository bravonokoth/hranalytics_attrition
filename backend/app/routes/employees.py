from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, or_
from typing import Optional, List
from pydantic import BaseModel

from app.db.session import get_session
from app.models.employee import Employee

router = APIRouter()


class EmployeeCreate(BaseModel):
    age: int
    business_travel: Optional[str] = None
    daily_rate: Optional[int] = None
    department: Optional[str] = None
    distance_from_home: Optional[int] = None
    education: Optional[int] = None
    education_field: Optional[str] = None
    employee_number: Optional[int] = None
    environment_satisfaction: Optional[int] = None
    gender: Optional[str] = None
    hourly_rate: Optional[int] = None
    job_involvement: Optional[int] = None
    job_level: Optional[int] = None
    job_role: Optional[str] = None
    job_satisfaction: Optional[int] = None
    marital_status: Optional[str] = None
    monthly_income: Optional[int] = None
    monthly_rate: Optional[int] = None
    num_companies_worked: Optional[int] = None
    over_18: Optional[str] = None
    over_time: Optional[str] = None
    percent_salary_hike: Optional[int] = None
    performance_rating: Optional[int] = None
    relationship_satisfaction: Optional[int] = None
    standard_hours: Optional[int] = 80
    stock_option_level: Optional[int] = None
    total_working_years: Optional[int] = None
    training_times_last_year: Optional[int] = None
    work_life_balance: Optional[int] = None
    years_at_company: Optional[int] = None
    years_in_current_role: Optional[int] = None
    years_since_last_promotion: Optional[int] = None
    years_with_curr_manager: Optional[int] = None
    attrition: Optional[str] = None


class EmployeeUpdate(BaseModel):
    age: Optional[int] = None
    business_travel: Optional[str] = None
    daily_rate: Optional[int] = None
    department: Optional[str] = None
    distance_from_home: Optional[int] = None
    education: Optional[int] = None
    education_field: Optional[str] = None
    environment_satisfaction: Optional[int] = None
    gender: Optional[str] = None
    hourly_rate: Optional[int] = None
    job_involvement: Optional[int] = None
    job_level: Optional[int] = None
    job_role: Optional[str] = None
    job_satisfaction: Optional[int] = None
    marital_status: Optional[str] = None
    monthly_income: Optional[int] = None
    monthly_rate: Optional[int] = None
    num_companies_worked: Optional[int] = None
    over_time: Optional[str] = None
    percent_salary_hike: Optional[int] = None
    performance_rating: Optional[int] = None
    relationship_satisfaction: Optional[int] = None
    stock_option_level: Optional[int] = None
    total_working_years: Optional[int] = None
    training_times_last_year: Optional[int] = None
    work_life_balance: Optional[int] = None
    years_at_company: Optional[int] = None
    years_in_current_role: Optional[int] = None
    years_since_last_promotion: Optional[int] = None
    years_with_curr_manager: Optional[int] = None
    attrition: Optional[str] = None


@router.get("/", response_model=List[Employee])
def list_employees(
    *,
    session: Session = Depends(get_session),
    limit: int = Query(50, le=500),
    search: Optional[str] = None,
    department: Optional[str] = None,
    attrition: Optional[bool] = None
):
    """List employees with optional filters"""
    query = select(Employee)
    
    # Apply filters
    if search:
        query = query.where(
            or_(
                Employee.job_role.contains(search),
                Employee.department.contains(search)
            )
        )
    
    if department:
        query = query.where(Employee.department == department)
    
    if attrition is not None:
        attrition_str = "Yes" if attrition else "No"
        query = query.where(Employee.attrition == attrition_str)
    
    query = query.limit(limit)
    employees = session.exec(query).all()
    return employees


@router.get("/{emp_id}", response_model=Employee)
def get_employee(emp_id: int, session: Session = Depends(get_session)):
    """Get a single employee by ID"""
    emp = session.get(Employee, emp_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@router.post("/", response_model=Employee)
def create_employee(
    employee_data: EmployeeCreate,
    session: Session = Depends(get_session)
):
    """Create a new employee"""
    employee = Employee(**employee_data.dict())
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


@router.put("/{emp_id}", response_model=Employee)
def update_employee(
    emp_id: int,
    employee_data: EmployeeUpdate,
    session: Session = Depends(get_session)
):
    """Update an existing employee"""
    employee = session.get(Employee, emp_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Update only provided fields
    update_data = employee_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(employee, key, value)
    
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


@router.delete("/{emp_id}")
def delete_employee(emp_id: int, session: Session = Depends(get_session)):
    """Delete an employee"""
    employee = session.get(Employee, emp_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    session.delete(employee)
    session.commit()
    return {"message": "Employee deleted successfully"}