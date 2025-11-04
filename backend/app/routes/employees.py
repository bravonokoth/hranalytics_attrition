from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models.employee import Employee

router = APIRouter()

# Use the same get_db function from auth
def get_db():
    from app.db.engine import engine
    with Session(engine) as session:
        yield session

@router.get("/", response_model=list[Employee])
def list_employees(*, session: Session = Depends(get_db), limit: int = 50):
    employees = session.exec(select(Employee).limit(limit)).all()
    return employees

@router.get("/{emp_id}", response_model=Employee)
def get_employee(emp_id: int, session: Session = Depends(get_db)):
    emp = session.get(Employee, emp_id)
    if not emp:
        raise HTTPException(404, "Employee not found")
    return emp