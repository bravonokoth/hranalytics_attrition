from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, employees, analytics, predict
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI(title="HR Analytics Attrition Predictor API", version="1.0")

# ✅ Allow frontend requests
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include routes
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(predict.router, prefix="/api/predict", tags=["Prediction"])

@app.get("/")
def root():
    return {"message": "Welcome to HR Analytics Attrition API"}


from app.db.engine import create_db_and_tables

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    print("Database tables ready!")