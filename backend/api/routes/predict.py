# backend/app/api/predict.py
from fastapi import APIRouter
from pydantic import BaseModel
import pickle
import numpy as np

router = APIRouter()

# Load model
with open("model/hr_attrition_model.pkl", "rb") as f:
    model = pickle.load(f)

class EmployeeData(BaseModel):
    age: int
    job_satisfaction: int
    monthly_income: float
    overtime: int
    years_at_company: int

@router.post("/predict")
async def predict_attrition(data: EmployeeData):
    input_data = np.array([[data.age, data.job_satisfaction, data.monthly_income, data.overtime, data.years_at_company]])
    prediction = model.predict(input_data)[0]
    probability = model.predict_proba(input_data)[0][1]

    if prediction == 1:
        readable_result = (
            f"This employee has a high risk of leaving. "
            f"The likelihood is {probability*100:.1f}%. "
            "Consider reviewing workload, salary satisfaction, or work-life balance."
        )
    else:
        readable_result = (
            f"This employee is likely to stay. "
            f"Retention likelihood is {100 - probability*100:.1f}%. "
            "Keep up engagement and maintain current motivation levels."
        )

    return {
        "prediction": int(prediction),
        "probability": round(float(probability), 3),
        "summary": readable_result
    }
