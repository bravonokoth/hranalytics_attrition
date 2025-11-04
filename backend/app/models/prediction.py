from sqlmodel import SQLModel, Field
from typing import Optional

class Prediction(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    employee_id: int = Field(foreign_key="employee.id")
    model_id: int = Field(foreign_key="model.id")
    probability: float
    prediction: str
    feedback: Optional[str] = None