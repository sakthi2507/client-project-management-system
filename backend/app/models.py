# Create professional SQLAlchemy models for a Project Management System.
# Include:
# - User model with roles (Admin, ProjectManager, TeamMember)
# - Client model
# - Project model with ProjectStatus enum
# - Task model with TaskStatus enum
# - ProjectAssignment model (Many-to-Many between User and Project)
# - Payment model
# Include proper relationships and foreign keys.
# Use DateTime fields with default=datetime.utcnow.
# Use SQLAlchemy 2.0 style.
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SqlEnum
from sqlalchemy.orm import relationship
from app.database import Base
class UserRole(str, Enum):
    Admin = "Admin"
    ProjectManager = "ProjectManager"
    TeamMember = "TeamMember"
class ProjectStatus(str, Enum):
    NotStarted = "Not Started"
    InProgress = "In Progress"
    Completed = "Completed"
class TaskStatus(str, Enum):
    ToDo = "To Do"
    InProgress = "In Progress"
    Done = "Done"
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SqlEnum(UserRole), nullable=False)
    project_assignments = relationship("ProjectAssignment", back_populates="user")
class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact_info = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    projects = relationship("Project", back_populates="client")
class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    status = Column(SqlEnum(ProjectStatus), default=ProjectStatus.NotStarted)
    client_id = Column(Integer, ForeignKey("clients.id"))
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    client = relationship("Client", back_populates="projects")
    tasks = relationship("Task", back_populates="project")
    project_assignments = relationship("ProjectAssignment", back_populates="project")
    payments = relationship("Payment", back_populates="project")
class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    status = Column(SqlEnum(TaskStatus), default=TaskStatus.ToDo)
    project_id = Column(Integer, ForeignKey("projects.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", foreign_keys=[assigned_to])
class ProjectAssignment(Base):
    __tablename__ = "project_assignments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="project_assignments")
    project = relationship("Project", back_populates="project_assignments")
class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Integer, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    project_id = Column(Integer, ForeignKey("projects.id"))
    project = relationship("Project", back_populates="payments")