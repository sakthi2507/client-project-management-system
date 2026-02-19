# Create FastAPI app
# Import engine and Base
# Create database tables on startup
# Add root endpoint

import logging
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from sqlalchemy import text
from app import models
from app.auth import get_password_hash
from app.database import engine, Base, SessionLocal
from app.routes import auth_routes, client_routes, project_routes, assignment_routes, task_routes, user_routes
from fastapi.middleware.cors import CORSMiddleware
from app.routes.dashboard import router as dashboard_router 

# Load environment variables from .env file
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get allowed origins from environment
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

# Add production URL if provided
if FRONTEND_URL not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(FRONTEND_URL)

app = FastAPI(title="Project Management API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(client_routes.router)
app.include_router(project_routes.router)
app.include_router(assignment_routes.router)
app.include_router(task_routes.router)
app.include_router(user_routes.router)
app.include_router(dashboard_router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        user_columns = conn.execute(text("PRAGMA table_info(users)")).fetchall()
        if user_columns and not any(col[1] == "full_name" for col in user_columns):
            conn.execute(text("ALTER TABLE users ADD COLUMN full_name TEXT"))
            conn.commit()
        task_columns = conn.execute(text("PRAGMA table_info(tasks)")).fetchall()
        if task_columns and not any(col[1] == "assigned_to" for col in task_columns):
            conn.execute(text("ALTER TABLE tasks ADD COLUMN assigned_to INTEGER"))
            conn.commit()
        if task_columns and not any(col[1] == "due_date" for col in task_columns):
            conn.execute(text("ALTER TABLE tasks ADD COLUMN due_date DATETIME"))
            conn.commit()
        if task_columns and not any(col[1] == "created_at" for col in task_columns):
            conn.execute(text("ALTER TABLE tasks ADD COLUMN created_at DATETIME"))
            conn.commit()
        client_columns = conn.execute(text("PRAGMA table_info(clients)")).fetchall()
        if client_columns and not any(col[1] == "created_at" for col in client_columns):
            conn.execute(text("ALTER TABLE clients ADD COLUMN created_at DATETIME"))
            conn.commit()
        project_columns = conn.execute(text("PRAGMA table_info(projects)")).fetchall()
        if project_columns and not any(col[1] == "start_date" for col in project_columns):
            conn.execute(text("ALTER TABLE projects ADD COLUMN start_date DATETIME"))
            conn.commit()
        if project_columns and not any(col[1] == "end_date" for col in project_columns):
            conn.execute(text("ALTER TABLE projects ADD COLUMN end_date DATETIME"))
            conn.commit()
        if project_columns and not any(col[1] == "created_at" for col in project_columns):
            conn.execute(text("ALTER TABLE projects ADD COLUMN created_at DATETIME"))
            conn.commit()
        assignment_columns = conn.execute(text("PRAGMA table_info(project_assignments)")).fetchall()
        if assignment_columns and not any(col[1] == "created_at" for col in assignment_columns):
            conn.execute(text("ALTER TABLE project_assignments ADD COLUMN created_at DATETIME"))
            conn.commit()
    db = SessionLocal()
    try:
        admin_email = "admin@example.com"
        existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if not existing_admin:
            admin_user = models.User(
                full_name="System Administrator",
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                role=models.UserRole.Admin,
            )
            db.add(admin_user)
            db.commit()
            logger.info("Default admin user created: %s", admin_email)
        else:
            # Update existing admin to have full_name if missing
            if not existing_admin.full_name:
                existing_admin.full_name = "System Administrator"
                db.commit()
            logger.info("Default admin user already exists: %s", admin_email)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Project Management API!"}




