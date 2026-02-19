from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    total_clients = db.query(models.Client).count()
    active_projects = db.query(models.Project).filter(models.Project.status == "active").count()
    completed_tasks = db.query(models.Task).filter(models.Task.status == "completed").count()

    return {
        "total_clients": total_clients,
        "active_projects": active_projects,
        "completed_tasks": completed_tasks,
    }