# Create authentication routes:
# - Register user (Admin only)
# - Login user (return JWT token)
# Use OAuth2PasswordRequestForm
# Use authenticate_user and create_access_token
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
from app.auth import authenticate_user, create_access_token, get_current_user, get_password_hash, require_role
from pydantic import BaseModel
from typing import Optional
router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    full_name: Optional[str] = None
    email: str
    password: str
    role: models.UserRole = models.UserRole.TeamMember


@router.post("/register")
def register_user(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin"))
):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(payload.password)
    new_user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hashed_password,
        role=payload.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"msg": "User registered successfully"}
@router.post("/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
    }
