# Create Client CRUD routes:
# - Create client (Admin, ProjectManager)
# - Get all clients (Admin, ProjectManager)
# - Get single client by id
# - Update client (Admin, ProjectManager)
# - Delete client (Admin only)
# Use Pydantic schemas for request and response models.
# Use role-based protection with require_role.
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
from app.auth import require_role
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/clients", tags=["clients"])

class ClientCreate(BaseModel):
    name: str
    contact_info: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    contact_info: Optional[str] = None

class ClientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    contact_info: Optional[str] = None
    created_at: datetime
@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(client: ClientCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role("Admin", "ProjectManager"))):
    new_client = models.Client(name=client.name, contact_info=client.contact_info)
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return new_client
@router.get("/", response_model=list[ClientResponse])
def get_clients(db: Session = Depends(get_db), current_user: models.User = Depends(require_role("Admin", "ProjectManager"))):
    return db.query(models.Client).all()
@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_role("Admin", "ProjectManager"))):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client
@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client_update: ClientUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(require_role("Admin", "ProjectManager"))):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client_update.name is not None:
        client.name = client_update.name
    if client_update.contact_info is not None:
        client.contact_info = client_update.contact_info
    db.commit()
    db.refresh(client)
    return client
@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_role("Admin"))):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
    return {"msg": "Client deleted successfully"}
