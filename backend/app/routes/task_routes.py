# Create Task CRUD routes:
# - Create task (Admin, ProjectManager)
# - Update task (Admin, ProjectManager)
# - Delete task (Admin only)
# - Get all tasks (Authenticated users)
# - Get tasks by project_id
# - Get tasks by assigned user
# Validate project exists, assigned user exists, and user is assigned to project.
from datetime import datetime
from enum import Enum
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, aliased
from app import models
from app.database import get_db
from app.auth import require_role, get_current_user
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Schema-layer enum (API layer)
class TaskStatusEnum(str, Enum):
    ToDo = "ToDo"
    InProgress = "InProgress"
    Done = "Done"

# Mapping between API and DB enums
def api_to_db_task_status(api_status: TaskStatusEnum) -> models.TaskStatus:
    mapping = {
        TaskStatusEnum.ToDo: models.TaskStatus.ToDo,
        TaskStatusEnum.InProgress: models.TaskStatus.InProgress,
        TaskStatusEnum.Done: models.TaskStatus.Done,
    }
    return mapping[api_status]

def db_to_api_task_status(db_status: models.TaskStatus) -> TaskStatusEnum:
    mapping = {
        models.TaskStatus.ToDo: TaskStatusEnum.ToDo,
        models.TaskStatus.InProgress: TaskStatusEnum.InProgress,
        models.TaskStatus.Done: TaskStatusEnum.Done,
    }
    return mapping[db_status]


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    assigned_to: Optional[int] = None
    status: Optional[TaskStatusEnum] = TaskStatusEnum.ToDo
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[int] = None
    assigned_to: Optional[int] = None
    status: Optional[TaskStatusEnum] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    description: Optional[str] = None
    project_id: int
    assigned_to: Optional[int] = None
    status: TaskStatusEnum
    due_date: Optional[datetime] = None
    created_at: datetime
    
    @staticmethod
    def from_db(db_task: models.Task) -> "TaskResponse":
        return TaskResponse(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description,
            project_id=db_task.project_id,
            assigned_to=db_task.assigned_to,
            status=db_to_api_task_status(db_task.status),
            due_date=db_task.due_date,
            created_at=db_task.created_at
        )


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin", "ProjectManager"))
):
    # Validate project exists
    project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # If assigned_to is provided, validate user exists and is assigned to project
    if task.assigned_to is not None:
        user = db.query(models.User).filter(models.User.id == task.assigned_to).first()
        if not user:
            raise HTTPException(status_code=404, detail="Assigned user not found")
        
        # Check if user is assigned to the project
        assignment = db.query(models.ProjectAssignment).filter(
            models.ProjectAssignment.user_id == task.assigned_to,
            models.ProjectAssignment.project_id == task.project_id
        ).first()
        if not assignment:
            raise HTTPException(
                status_code=400, 
                detail="User must be assigned to the project before being assigned tasks"
            )
    
    # Create task
    new_task = models.Task(
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        assigned_to=task.assigned_to,
        status=api_to_db_task_status(task.status),
        due_date=task.due_date
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return TaskResponse.from_db(new_task)


@router.get("/", response_model=list[TaskResponse])
def get_all_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Admin sees all tasks
    if current_user.role == models.UserRole.Admin:
        tasks = db.query(models.Task).all()
    # ProjectManager sees tasks from projects they're assigned to
    elif current_user.role == models.UserRole.ProjectManager:
        tasks = (
            db.query(models.Task)
            .join(models.Project)
            .join(models.ProjectAssignment)
            .filter(models.ProjectAssignment.user_id == current_user.id)
            .all()
        )
    # TeamMember sees only tasks assigned to them
    else:
        tasks = db.query(models.Task).filter(models.Task.assigned_to == current_user.id).all()
    
    return [TaskResponse.from_db(t) for t in tasks]


@router.get("/project/{project_id}", response_model=list[TaskResponse])
def get_tasks_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Validate project exists
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Enforce role-based access
    if current_user.role != models.UserRole.Admin:
        assignment = db.query(models.ProjectAssignment).filter(
            models.ProjectAssignment.user_id == current_user.id,
            models.ProjectAssignment.project_id == project_id
        ).first()
        if not assignment:
            raise HTTPException(
                status_code=403,
                detail="Access forbidden: You are not assigned to this project"
            )

    tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
    return [TaskResponse.from_db(t) for t in tasks]


@router.get("/user/{user_id}", response_model=list[TaskResponse])
def get_tasks_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Validate user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Enforce role-based access
    if current_user.role == models.UserRole.Admin:
        pass
    elif current_user.role == models.UserRole.TeamMember:
        if current_user.id != user_id:
            raise HTTPException(status_code=403, detail="Access forbidden")
    elif current_user.role == models.UserRole.ProjectManager:
        pm_assignment = aliased(models.ProjectAssignment)
        user_assignment = aliased(models.ProjectAssignment)
        shared_assignment = (
            db.query(pm_assignment)
            .join(user_assignment, pm_assignment.project_id == user_assignment.project_id)
            .filter(
                pm_assignment.user_id == current_user.id,
                user_assignment.user_id == user_id
            )
            .first()
        )
        if not shared_assignment:
            raise HTTPException(status_code=403, detail="Access forbidden")
    else:
        raise HTTPException(status_code=403, detail="Access forbidden")

    tasks = db.query(models.Task).filter(models.Task.assigned_to == user_id).all()
    return [TaskResponse.from_db(t) for t in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Enforce role-based access
    if current_user.role == models.UserRole.Admin:
        return TaskResponse.from_db(task)

    if current_user.role == models.UserRole.ProjectManager:
        assignment = db.query(models.ProjectAssignment).filter(
            models.ProjectAssignment.user_id == current_user.id,
            models.ProjectAssignment.project_id == task.project_id
        ).first()
        if not assignment:
            raise HTTPException(
                status_code=403,
                detail="Access forbidden: You are not assigned to this project"
            )
    elif current_user.role == models.UserRole.TeamMember:
        if task.assigned_to != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Access forbidden: You are not assigned to this task"
            )
    else:
        raise HTTPException(status_code=403, detail="Access forbidden")

    return TaskResponse.from_db(task)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin", "ProjectManager"))
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Validate project_id if being updated
    if task_update.project_id is not None:
        project = db.query(models.Project).filter(models.Project.id == task_update.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        task.project_id = task_update.project_id
    
    # Validate assigned_to if being updated
    if task_update.assigned_to is not None:
        user = db.query(models.User).filter(models.User.id == task_update.assigned_to).first()
        if not user:
            raise HTTPException(status_code=404, detail="Assigned user not found")
        
        # Check if user is assigned to the project
        assignment = db.query(models.ProjectAssignment).filter(
            models.ProjectAssignment.user_id == task_update.assigned_to,
            models.ProjectAssignment.project_id == task.project_id
        ).first()
        if not assignment:
            raise HTTPException(
                status_code=400,
                detail="User must be assigned to the project before being assigned tasks"
            )
        task.assigned_to = task_update.assigned_to
    
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.status is not None:
        task.status = api_to_db_task_status(task_update.status)
    if task_update.due_date is not None:
        task.due_date = task_update.due_date
    
    db.commit()
    db.refresh(task)
    return TaskResponse.from_db(task)


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status: TaskStatusEnum,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update task status. Allowed for:
    - Admin: any task
    - ProjectManager: tasks in their assigned projects
    - TeamMember: tasks assigned to them
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions based on role
    if current_user.role == models.UserRole.Admin:
        # Admin can update any task
        pass
    elif current_user.role == models.UserRole.ProjectManager:
        # ProjectManager can update tasks in their projects
        assignment = db.query(models.ProjectAssignment).filter(
            models.ProjectAssignment.user_id == current_user.id,
            models.ProjectAssignment.project_id == task.project_id
        ).first()
        if not assignment:
            raise HTTPException(
                status_code=403,
                detail="Access forbidden: You are not assigned to this project"
            )
    elif current_user.role == models.UserRole.TeamMember:
        # TeamMember can only update their assigned tasks
        if task.assigned_to != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Access forbidden: You can only update tasks assigned to you"
            )
    else:
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    # Update status
    task.status = api_to_db_task_status(status)
    db.commit()
    db.refresh(task)
    return TaskResponse.from_db(task)


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Admin"))
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"msg": "Task deleted successfully"}
