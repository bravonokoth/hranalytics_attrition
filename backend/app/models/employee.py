from sqlmodel import SQLModel, Field
from typing import Optional

class Employee(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    age: int
    business_travel: Optional[str] = None
    daily_rate: Optional[int] = None
    department: Optional[str] = None
    distance_from_home: Optional[int] = None
    education: Optional[int] = None
    education_field: Optional[str] = None
    employee_count: int = 1
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
    standard_hours: Optional[int] = None
    stock_option_level: Optional[int] = None
    total_working_years: Optional[int] = None
    training_times_last_year: Optional[int] = None
    work_life_balance: Optional[int] = None
    years_at_company: Optional[int] = None
    years_in_current_role: Optional[int] = None
    years_since_last_promotion: Optional[int] = None
    years_with_curr_manager: Optional[int] = None
    attrition: Optional[str] = None