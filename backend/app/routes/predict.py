from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session
from pydantic import BaseModel
from typing import Optional, List, Dict
import pandas as pd
import joblib
import io
import traceback

from app.db.session import get_session
from app.models.employee import Employee
from app.models.prediction import Prediction

router = APIRouter()

# Hard-coded label encodings (matching your training data)
LABEL_ENCODINGS = {
    "BusinessTravel": {"Non-Travel": 0, "Travel_Rarely": 1, "Travel_Frequently": 2},
    "Department": {
        "Sales": 0,
        "Research & Development": 1,
        "Human Resources": 2,
        "IT": 3,
        "Finance": 4,
        "Marketing": 5,
        "Operations": 6,
    },
    "EducationField": {
        "Life Sciences": 0,
        "Medical": 1,
        "Marketing": 2,
        "Technical Degree": 3,
        "Other": 4,
        "Human Resources": 5,
    },
    "Gender": {"Female": 0, "Male": 1},
    "JobRole": {
        "Sales Executive": 0,
        "Research Scientist": 1,
        "Laboratory Technician": 2,
        "Manufacturing Director": 3,
        "Healthcare Representative": 4,
        "Manager": 5,
        "Sales Representative": 6,
        "Research Director": 7,
        "Human Resources": 8,
        "Senior Engineer": 9,
        "Software Engineer": 10,
        "Marketing Manager": 11,
    },
    "MaritalStatus": {"Single": 0, "Married": 1, "Divorced": 2},
    "OverTime": {"No": 0, "Yes": 1},
}

# Column name mapping: snake_case (API) -> PascalCase (Model)
COLUMN_MAPPING = {
    'age': 'Age',
    'business_travel': 'BusinessTravel',
    'daily_rate': 'DailyRate',
    'department': 'Department',
    'distance_from_home': 'DistanceFromHome',
    'education': 'Education',
    'education_field': 'EducationField',
    'environment_satisfaction': 'EnvironmentSatisfaction',
    'gender': 'Gender',
    'hourly_rate': 'HourlyRate',
    'job_involvement': 'JobInvolvement',
    'job_level': 'JobLevel',
    'job_role': 'JobRole',
    'job_satisfaction': 'JobSatisfaction',
    'marital_status': 'MaritalStatus',
    'monthly_income': 'MonthlyIncome',
    'monthly_rate': 'MonthlyRate',
    'num_companies_worked': 'NumCompaniesWorked',
    'over_time': 'OverTime',
    'percent_salary_hike': 'PercentSalaryHike',
    'performance_rating': 'PerformanceRating',
    'relationship_satisfaction': 'RelationshipSatisfaction',
    'stock_option_level': 'StockOptionLevel',
    'total_working_years': 'TotalWorkingYears',
    'training_times_last_year': 'TrainingTimesLastYear',
    'work_life_balance': 'WorkLifeBalance',
    'years_at_company': 'YearsAtCompany',
    'years_in_current_role': 'YearsInCurrentRole',
    'years_since_last_promotion': 'YearsSinceLastPromotion',
    'years_with_curr_manager': 'YearsWithCurrManager',
}

# Expected features in the model (30 features)
EXPECTED_FEATURES = [
    'Age', 'BusinessTravel', 'DailyRate', 'Department', 'DistanceFromHome',
    'Education', 'EducationField', 'EnvironmentSatisfaction', 'Gender',
    'HourlyRate', 'JobInvolvement', 'JobLevel', 'JobRole', 'JobSatisfaction',
    'MaritalStatus', 'MonthlyIncome', 'MonthlyRate', 'NumCompaniesWorked',
    'OverTime', 'PercentSalaryHike', 'PerformanceRating', 'RelationshipSatisfaction',
    'StockOptionLevel', 'TotalWorkingYears', 'TrainingTimesLastYear',
    'WorkLifeBalance', 'YearsAtCompany', 'YearsInCurrentRole',
    'YearsSinceLastPromotion', 'YearsWithCurrManager'
]

# Load model
try:
    model = joblib.load("model/model.pkl")
    print("✓ Model loaded successfully")
except Exception as e:
    print(f"⚠ Warning: Could not load model file: {e}")
    model = None


class EmployeePredictionInput(BaseModel):
    # Required fields (most important for prediction)
    age: int
    department: str = "Research & Development"
    job_role: str = "Software Engineer"
    monthly_income: int = 50000
    
    # Optional fields with sensible defaults
    business_travel: str = "Travel_Rarely"
    daily_rate: int = 800
    distance_from_home: int = 10
    education: int = 3
    education_field: str = "Life Sciences"
    environment_satisfaction: int = 3
    gender: str = "Male"
    hourly_rate: int = 65
    job_involvement: int = 3
    job_level: int = 2
    job_satisfaction: int = 3
    marital_status: str = "Single"
    monthly_rate: int = 22000
    num_companies_worked: int = 1
    over_time: str = "No"
    percent_salary_hike: int = 14
    performance_rating: int = 3
    relationship_satisfaction: int = 3
    stock_option_level: int = 1
    total_working_years: int = 5
    training_times_last_year: int = 3
    work_life_balance: int = 3
    years_at_company: int = 5
    years_in_current_role: int = 3
    years_since_last_promotion: int = 0
    years_with_curr_manager: int = 3


class PredictionResponse(BaseModel):
    prediction: int  # 0 or 1
    probability: float
    riskLevel: str


def prepare_features_for_model(data_dict: dict) -> pd.DataFrame:
    """
    Prepare features for model prediction:
    1. Convert snake_case to PascalCase
    2. Encode categorical features
    3. Select only the features the model expects
    4. Ensure correct order
    """
    # Create DataFrame from input
    df = pd.DataFrame([data_dict])
    
    # Rename columns from snake_case to PascalCase
    df = df.rename(columns=COLUMN_MAPPING)
    
    # Encode categorical features using PascalCase names
    for col, mapping in LABEL_ENCODINGS.items():
        if col in df.columns:
            df[col] = df[col].map(mapping).fillna(-1).astype(int)
    
    # Select only the features expected by the model (removes extra columns)
    # Keep only columns that exist in both df and EXPECTED_FEATURES
    available_features = [col for col in EXPECTED_FEATURES if col in df.columns]
    df_model = df[available_features]
    
    # Ensure all expected features are present (add missing with 0)
    for feature in EXPECTED_FEATURES:
        if feature not in df_model.columns:
            df_model[feature] = 0
    
    # Reorder columns to match model expectations
    df_model = df_model[EXPECTED_FEATURES]
    
    return df_model


@router.post("/single", response_model=PredictionResponse)
def predict_single(
    data: EmployeePredictionInput,
    session: Session = Depends(get_session)
):
    """Predict attrition for a single employee"""
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not available. Please train the model first."
        )
    
    try:
        # Convert to dict (snake_case from API)
        input_dict = data.dict()
        
        print(f"📥 Received data keys: {list(input_dict.keys())}")
        
        # Prepare features for model (convert to PascalCase and encode)
        df_model = prepare_features_for_model(input_dict)
        
        print(f"🔢 Model input shape: {df_model.shape}")
        print(f"📊 Model input columns: {df_model.columns.tolist()}")
        print(f"📋 Sample values: {df_model.iloc[0].to_dict()}")
        
        # Make prediction
        prediction = int(model.predict(df_model)[0])
        probability = float(model.predict_proba(df_model)[0][1])
        
        # Determine risk level
        if probability < 0.3:
            risk_level = "Low"
        elif probability < 0.7:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        print(f"✓ Prediction: {prediction}, Probability: {probability:.4f}, Risk: {risk_level}")
        
        return {
            "prediction": prediction,
            "probability": round(probability, 4),
            "riskLevel": risk_level
        }
    
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        print(traceback.format_exc())
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
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not available. Please train the model first."
        )
    
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are accepted"
        )
    
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        print(f"📥 Batch upload: {len(df)} rows, columns: {df.columns.tolist()}")
        
        # Store original data
        original_df = df.copy()
        
        # Process each row
        predictions_list = []
        probabilities_list = []
        
        for idx, row in df.iterrows():
            row_dict = row.to_dict()
            df_model = prepare_features_for_model(row_dict)
            
            pred = int(model.predict(df_model)[0])
            prob = float(model.predict_proba(df_model)[0][1])
            
            predictions_list.append(pred)
            probabilities_list.append(prob)
        
        # Add results to original dataframe
        original_df['prediction'] = predictions_list
        original_df['probability'] = probabilities_list
        original_df['riskLevel'] = original_df['probability'].apply(
            lambda x: 'Low' if x < 0.3 else ('Medium' if x < 0.7 else 'High')
        )
        
        # Convert to list of dicts
        results = original_df.to_dict('records')
        
        print(f"✓ Batch prediction complete: {len(results)} employees")
        
        return {
            "total": len(results),
            "predictions": results
        }
    
    except Exception as e:
        print(f"❌ Batch prediction error: {str(e)}")
        print(traceback.format_exc())
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
    
    try:
        predictions = session.exec(
            select(Prediction).order_by(Prediction.id.desc()).limit(limit)
        ).all()
        return predictions
    except Exception as e:
        return []


@router.get("/encodings")
def get_encodings():
    """Get the label encoding mappings (useful for frontend validation)"""
    return LABEL_ENCODINGS


@router.get("/features")
def get_expected_features():
    """Get list of features expected by the model"""
    return {
        "features": EXPECTED_FEATURES,
        "count": len(EXPECTED_FEATURES),
        "column_mapping": COLUMN_MAPPING
    }