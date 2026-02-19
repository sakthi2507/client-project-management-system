# Create Project CRUD routes:
# - Create project (Admin, ProjectManager)
# - Get all projects (Authenticated users)
# - Get single project by id (Authenticated users)
# - Update project (Admin, ProjectManager)
# - Delete project (Admin only)
# Use Pydantic schemas for request and response models.
# Use role-based protection with require_role.
# Validate client_id exists before creating project.
from datetime import date, datetime
from enum import Enum
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
from app.auth import require_role, get_current_user
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/projects", tags=["projects"])

# Schema-layer enum (API layer)
class ProjectStatusEnum(str, Enum):
    NotStarted = "NotStarted"
    InProgress = "InProgress"
    Completed = "Completed"

# Mapping between API and DB enums
def api_to_db_status(api_status: ProjectStatusEnum) -> models.ProjectStatus:
    mapping = {
        ProjectStatusEnum.NotStarted: models.ProjectStatus.NotStarted,
        ProjectStatusEnum.InProgress: models.ProjectStatus.InProgress,
        ProjectStatusEnum.Completed: models.ProjectStatus.Completed,
    }
    return mapping[api_status]

def db_to_api_status(db_status: models.ProjectStatus) -> ProjectStatusEnum:
    mapping = {
        models.ProjectStatus.NotStarted: ProjectStatusEnum.NotStarted,
        models.ProjectStatus.InProgress: ProjectStatusEnum.InProgress,
        models.ProjectStatus.Completed: ProjectStatusEnum.Completed,
    }
    return mapping[db_status]

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    client_id: int
    status: Optional[ProjectStatusEnum] = ProjectStatusEnum.NotStarted
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[int] = None
    status: Optional[ProjectStatusEnum] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    description: Optional[str] = None
    client_id: int
    status: ProjectStatusEnum
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    created_at: datetime
    
    @staticmethod
    def from_db(db_project: models.Project) -> "ProjectResponse":
        return ProjectResponse(
            id=db_project.id,
            name=db_project.name,
            description=db_project.description,
            client_id=db_project.client_id,
            status=db_to_api_status(db_project.status),
            start_date=db_project.start_date,
            end_date=db_project.end_date,
            created_at=db_project.created_at
        )


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project: ProjectCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(require_role("Admin", "ProjectManager"))
):
    # Validate client_id exists
    client = db.query(models.Client).filter(models.Client.id == project.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    new_project = models.Project(
        name=project.name,
        description=project.description,
        client_id=project.client_id,
        status=api_to_db_status(project.status),
        start_date=project.start_date,
        end_date=project.end_date
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return ProjectResponse.from_db(new_project)


@router.get("/", response_model=list[ProjectResponse])
def get_projects(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Admin sees all projects
    if current_user.role == models.UserRole.Admin:
        projects = db.query(models.Project).all()
    else:
        # ProjectManager and TeamMember see only assigned projects
        projects = (
            db.query(models.Project)
            .join(models.ProjectAssignment)
            .filter(models.ProjectAssignment.user_id == current_user.id)
            .all()
        )
    return [ProjectResponse.from_db(p) for p in projects]


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Admin can access any project
    if current_user.role != models.UserRole.Admin:
        # Non-admin users must be assigned to the project
        assignment = db.query(models.ProjectAssignment).filter(
            models.ProjectAssignment.user_id == current_user.id,
            models.ProjectAssignment.project_id == project_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Access forbidden: You are not assigned to this project")
    
    return ProjectResponse.from_db(project)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int, 
    project_update: ProjectUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(require_role("Admin", "ProjectManager"))
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate client_id if being updated
    if project_update.client_id is not None:
        client = db.query(models.Client).filter(models.Client.id == project_update.client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        project.client_id = project_update.client_id
    
    if project_update.name is not None:
        project.name = project_update.name
    if project_update.description is not None:
        project.description = project_update.description
    if project_update.status is not None:
        project.status = api_to_db_status(project_update.status)
    if project_update.start_date is not None:
        project.start_date = project_update.start_date
    if project_update.end_date is not None:
        project.end_date = project_update.end_date
    
    db.commit()
    db.refresh(project)
    return ProjectResponse.from_db(project)


@router.patch("/{project_id}/status", response_model=ProjectResponse)
def update_project_status(
    project_id: int,
    status: ProjectStatusEnum,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update project status. Allowed for:
    - Admin: any project
    - ProjectManager: projects they're assigned to
    - TeamMember: projects they're assigned to (can mark progress)
    """
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check permissions based on role
    if current_user.role == models.UserRole.Admin:
        # Admin can update any project
        pass
    else:
        # ProjectManager and TeamMember must be assigned to the project
        assignment = db.query(models.ProjectAssignment).filter(
            models.ProjectAssignment.user_id == current_user.id,
            models.ProjectAssignment.project_id == project_id
        ).first()
        if not assignment:
            raise HTTPException(
                status_code=403,
                detail="Access forbidden: You are not assigned to this project"
            )
    
    # Update status
    project.status = api_to_db_status(status)
    db.commit()
    db.refresh(project)
    return ProjectResponse.from_db(project)


@router.delete("/{project_id}")
def delete_project(
    project_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(require_role("Admin"))
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"msg": "Project deleted successfully"}
