from sqlmodel import create_engine, SQLModel
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hranalytics.db")

# Create engine with echo for debugging
engine = create_engine(
    DATABASE_URL, 
    echo=True,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

def create_db_and_tables():
    """Create all database tables"""
    # Import all models to ensure they're registered with SQLModel
    from app.models.user import User
    from app.models.employee import Employee
    from app.models.model import Model
    from app.models.prediction import Prediction
    
    # Create all tables
    SQLModel.metadata.create_all(engine)