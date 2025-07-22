from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any, Dict
from datetime import datetime

class UserModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: EmailStr
    password_hash: str
    created_at: Optional[datetime] = None

class ProjectModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    name: str
    created_at: Optional[datetime] = None

class OrgViewModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    project_id: str
    react_flow_json: Dict[str, Any]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None 