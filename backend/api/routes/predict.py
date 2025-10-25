from fastapi import APIRouter
import joblib
import pandas as pd

router = APIRouter(prefix="/predict", tags=["Predict"])

model = joblib.load("model/model.pkl")
encoders = joblib.load("model/encoder.pkl")

@router.post("/")
def predict_employee_attrition(data: dict):
    df = pd.DataFrame([data])

    # Encode fields if needed
    for col, le in encoders.items():
        if col in df.columns:
            df[col] = le.transform(df[col])

    prediction = model.predict(df)[0]
    probability = model.predict_proba(df)[0][1]

    return {
        "prediction": "Yes" if prediction == 1 else "No",
        "attrition_probability": round(float(probability), 3)
    }
