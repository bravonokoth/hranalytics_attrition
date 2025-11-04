from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Prediction(SQLModel, table=True):
    __tablename__ = "prediction"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: Optional[int] = None  # No foreign key constraint
    model_version: Optional[str] = None  # Store version string instead
    probability: float
    prediction: str  # "Yes" or "No" for attrition
    risk_level: Optional[str] = None  # "Low", "Medium", "High"
    feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)