from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
import logging

from app.db.engine import engine
from app.routes import auth, employees, analytics, predict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
def create_db_and_tables():
    """Create all database tables"""
    try:
        # Import all models to ensure they're registered with SQLModel
        from app.models.user import User
        from app.models.employee import Employee
        from app.models.model import Model
        from app.models.prediction import Prediction
        
        logger.info("Creating database tables...")
        SQLModel.metadata.create_all(engine)
        logger.info("✓ Database tables created successfully")
    except Exception as e:
        logger.error(f"✗ Error creating database tables: {e}")
        raise

app = FastAPI(
    title="HR Analytics Attrition API",
    version="1.0",
    description="API for HR Analytics and Employee Attrition Prediction"
)

# CORS middleware - configure for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        # Add your production domain here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(predict.router, prefix="/api/predict", tags=["Predictions"])

@app.get("/")
def root():
    return {
        "message": "HR Analytics API",
        "version": "1.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "hr-analytics-api"}