from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.engine import create_db_and_tables
from app.routes import auth, employees, analytics, predict
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="HR Analytics Attrition Predictor API", version="1.0")

# ✅ CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",  # Alternative port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include routers with /api prefix
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
#app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
#app.include_router(predict.router, prefix="/api/predict", tags=["Prediction"])


@app.get("/")
def root():
    return {
        "message": "Welcome to HR Analytics Attrition API",
        "version": "1.0",
        "endpoints": {
            "auth": "/api/auth",
            "employees": "/api/employees",
            "analytics": "/api/analytics",
            "predict": "/api/predict",
            "docs": "/docs"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    print("✅ Database tables ready!")
    print("✅ Server running on http://127.0.0.1:8000")
    print("✅ API docs available at http://127.0.0.1:8000/docs")