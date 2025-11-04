from fastapi import FastAPI
import joblib, json, pandas as pd
from pydantic import BaseModel

app = FastAPI(title="HR Analytics Attrition API", version="1.0")

model = joblib.load("model/model.pkl")
encoders = joblib.load("model/encoder.pkl")

class EmployeeData(BaseModel):
    features: dict

@app.post("/predict")
def predict(data: EmployeeData):
    df = pd.DataFrame([data.features])
    
    # Encode using saved label encoders
    for col, encoder in encoders.items():
        if col in df.columns:
            df[col] = encoder.transform(df[col])

    pred = model.predict(df)[0]
    prob = model.predict_proba(df)[0][1]
    return {
        "attrition": int(pred),
        "probability": round(float(prob), 4)
    }

@app.get("/metrics")
def get_metrics():
    with open("outputs/metrics.json", "r") as f:
        metrics = json.load(f)
    return metrics
