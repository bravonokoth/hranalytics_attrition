from sqlmodel import SQLModel, Field
from typing import Optional

class Model(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    version: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1: Optional[float] = None
    training_data_size: Optional[int] = None