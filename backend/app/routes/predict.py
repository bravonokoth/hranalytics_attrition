from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import joblib
import io

from app.db.session import get_session
from app.models.employee import Employee
from app.models.prediction import Prediction

router = APIRouter()

# Load model and encoders
try:
    model = joblib.load("model/model.pkl")
    encoders = joblib.load("model/encoder.pkl")
except Exception as e:
    print(f"Warning: Could not load model files: {e}")
    model = None
    encoders = None


class EmployeePredictionInput(BaseModel):
    age: int
    business_travel: str
    daily_rate: Optional[int] = None
    department: str
    distance_from_home: int
    education: int
    education_field: str
    environment_satisfaction: int
    gender: str
    hourly_rate: Optional[int] = None
    job_involvement: int
    job_level: int
    job_role: str
    job_satisfaction: int
    marital_status: str
    monthly_income: int
    monthly_rate: Optional[int] = None
    num_companies_worked: int
    over_time: str
    percent_salary_hike: Optional[int] = None
    performance_rating: Optional[int] = None
    relationship_satisfaction: int
    stock_option_level: int
    total_working_years: int
    training_times_last_year: int
    work_life_balance: int
    years_at_company: int
    years_in_current_role: int
    years_since_last_promotion: int
    years_with_curr_manager: int


class PredictionResponse(BaseModel):
    prediction: int  # 0 or 1
    probability: float
    riskLevel: str


@router.post("/single", response_model=PredictionResponse)
def predict_single(
    data: EmployeePredictionInput,
    session: Session = Depends(get_session)
):
    """Predict attrition for a single employee"""
    if model is None or encoders is None:
        raise HTTPException(
            status_code=503,
            detail="Model not available. Please train the model first."
        )
    
    try:
        # Convert to DataFrame
        df = pd.DataFrame([data.dict()])
        
        # Encode categorical features
        for col, encoder in encoders.items():
            if col in df.columns:
                try:
                    df[col] = encoder.transform(df[col])
                except:
                    # Handle unknown categories
                    df[col] = -1
        
        # Make prediction
        prediction = int(model.predict(df)[0])
        probability = float(model.predict_proba(df)[0][1])
        
        # Determine risk level
        if probability < 0.3:
            risk_level = "Low"
        elif probability < 0.7:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        return {
            "prediction": prediction,
            "probability": round(probability, 4),
            "riskLevel": risk_level
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/batch")
async def predict_batch(
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """Predict attrition for multiple employees from CSV file"""
    if model is None or encoders is None:
        raise HTTPException(
            status_code=503,
            detail="Model not available. Please train the model first."
        )
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are accepted"
        )
    
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Store original data
        original_df = df.copy()
        
        # Encode categorical features
        for col, encoder in encoders.items():
            if col in df.columns:
                try:
                    df[col] = encoder.transform(df[col])
                except:
                    df[col] = -1
        
        # Make predictions
        predictions = model.predict(df)
        probabilities = model.predict_proba(df)[:, 1]
        
        # Add results to original dataframe
        original_df['prediction'] = predictions
        original_df['probability'] = probabilities
        original_df['riskLevel'] = original_df['probability'].apply(
            lambda x: 'Low' if x < 0.3 else ('Medium' if x < 0.7 else 'High')
        )
        
        # Convert to list of dicts
        results = original_df.to_dict('records')
        
        return {
            "total": len(results),
            "predictions": results
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Batch prediction failed: {str(e)}"
        )


@router.get("/history")
def get_prediction_history(
    limit: int = 50,
    session: Session = Depends(get_session)
):
    """Get prediction history"""
    from sqlmodel import select
    predictions = session.exec(
        select(Prediction).order_by(Prediction.id.desc()).limit(limit)
    ).all()
    
    return predictions