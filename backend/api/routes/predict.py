# backend/api/predict.py
from fastapi import APIRouter
from pydantic import BaseModel
import joblib
import numpy as np
import os

router = APIRouter(prefix="/api/predict", tags=["Prediction"])

# Paths
MODEL_PATH = os.path.join("model", "model.pkl")
ENCODER_PATH = os.path.join("model", "encoder.pkl")

# Load model and encoders
model = joblib.load(MODEL_PATH)
encoders = joblib.load(ENCODER_PATH)

class EmployeeData(BaseModel):
    Age: int
    JobSatisfaction: int
    MonthlyIncome: float
    OverTime: str
    YearsAtCompany: int
    Department: str | None = None
    Gender: str | None = None
    JobRole: str | None = None

@router.post("/single")
async def predict_attrition(data: EmployeeData):
    """
    Predicts whether an employee is likely to leave the company
    based on HR analytics data.
    """

    # Convert categorical values using saved encoders
    input_dict = data.dict()
    for col, le in encoders.items():
        if col in input_dict and isinstance(input_dict[col], str):
            try:
                input_dict[col] = le.transform([input_dict[col]])[0]
            except ValueError:
                # Handle unseen labels gracefully
                input_dict[col] = 0

    # Prepare input data in correct order
    ordered_features = [
        "Age", "JobSatisfaction", "MonthlyIncome", "OverTime", "YearsAtCompany"
    ]
    input_data = np.array([[input_dict.get(f, 0) for f in ordered_features]])

    # Make prediction
    prediction = model.predict(input_data)[0]
    probability = model.predict_proba(input_data)[0][1]

    # Human-readable response
    if prediction == 1:
        risk_level = "High" if probability > 0.7 else "Medium"
        readable_result = (
            f"⚠️ This employee has a **{risk_level} risk** of leaving. "
            f"Likelihood: {probability*100:.1f}%. "
            "Consider reviewing workload, pay, and recognition."
        )
    else:
        readable_result = (
            f"✅ This employee is likely to **stay**. "
            f"Retention likelihood: {100 - probability*100:.1f}%. "
            "Maintain engagement and motivation."
        )

    return {
        "prediction": int(prediction),
        "probability": round(float(probability), 3),
        "summary": readable_result
    }
