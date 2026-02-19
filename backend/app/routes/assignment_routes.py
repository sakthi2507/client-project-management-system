# Create ProjectAssignment routes:
# - Assign user to project (Admin, ProjectManager)
# - Remove user from project (Admin)
# - Get all users assigned to a project
# - Get all projects assigned to a user
# Validate project_id and user_id exist before creating assignment.
# Prevent duplicate assignments.
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
from app.auth import require_role, get_current_user
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/assignments", tags=["assignments"])


class AssignmentCreate(BaseModel):
    user_id: int
    project_id: int


class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    project_id: int
    created_at: datetime


class UserBasicInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    role: str


class ProjectBasicInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    description: Optional[str] = None


@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_user_to_project(
    assignment: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin", "ProjectManager"))
):
    # Validate user_id exists
    user = db.query(models.User).filter(models.User.id == assignment.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate project_id exists
    project = db.query(models.Project).filter(models.Project.id == assignment.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check for duplicate assignment
    existing = db.query(models.ProjectAssignment).filter(
        models.ProjectAssignment.user_id == assignment.user_id,
        models.ProjectAssignment.project_id == assignment.project_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already assigned to this project")
    
    # Create assignment
    new_assignment = models.ProjectAssignment(
        user_id=assignment.user_id,
        project_id=assignment.project_id
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment


@router.delete("/{assignment_id}")
def remove_user_from_project(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin"))
):
    assignment = db.query(models.ProjectAssignment).filter(
        models.ProjectAssignment.id == assignment_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    db.delete(assignment)
    db.commit()
    return {"msg": "Assignment removed successfully"}


@router.get("/project/{project_id}", response_model=list[UserBasicInfo])
def get_users_assigned_to_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Validate project exists
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get users using JOIN for better performance
    users = (
        db.query(models.User)
        .join(models.ProjectAssignment)
        .filter(models.ProjectAssignment.project_id == project_id)
        .all()
    )
    return users


@router.get("/user/{user_id}", response_model=list[ProjectBasicInfo])
def get_projects_assigned_to_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Validate user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get projects using JOIN for better performance
    projects = (
        db.query(models.Project)
        .join(models.ProjectAssignment)
        .filter(models.ProjectAssignment.user_id == user_id)
        .all()
    )
    return projects
