from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "testsecret")
ALGORITHM = "HS256"

fake_users_db = {
    "admin@example.com": {"password": "123456", "name": "Admin User", "role": "admin"},
}

class RegisterModel(BaseModel):
    name: str
    email: str
    password: str
    department: str | None = None
    role: str | None = None

class LoginModel(BaseModel):
    email: str
    password: str

def create_token(email: str):
    return jwt.encode({"sub": email}, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register")
def register(user: RegisterModel):
    if user.email in fake_users_db:
        raise HTTPException(status_code=400, detail="User already exists.")
    fake_users_db[user.email] = {
        "password": user.password,
        "name": user.name,
        "department": user.department,
        "role": user.role,
    }
    token = create_token(user.email)
    return {"token": token, "user": user.dict()}

@router.post("/login")
def login(user: LoginModel):
    db_user = fake_users_db.get(user.email)
    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    token = create_token(user.email)
    return {"token": token, "user": db_user}

@router.get("/me")
def get_me(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        return {"email": email, "user": fake_users_db.get(email)}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token.")
