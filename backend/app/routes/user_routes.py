# Create User listing routes:
# - List users (Admin, ProjectManager)
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from app import models
from app.auth import require_role
from app.database import get_db

router = APIRouter(prefix="/users", tags=["users"])


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: Optional[str] = None
    email: str
    role: str


@router.get("/", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin", "ProjectManager"))
):
    return db.query(models.User).all()
