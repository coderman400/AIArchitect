from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from backend.auth import router as auth_router, get_current_user
from backend.orgview_service import OrgViewService
from backend.db import db

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/projects")
async def list_projects(user=Depends(get_current_user)):
    # TODO: implement project listing for user
    return {"projects": []}

@app.post("/orgview/generate")
async def generate_orgview(
    project_name: str = Form(...),
    texts: Optional[List[str]] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    pdfs: Optional[List[UploadFile]] = File(None),
    user=Depends(get_current_user)
):
    service = OrgViewService()
    result = await service.generate_org_view(user_id=user.id, project_name=project_name, texts=texts or [], images=images or [], pdfs=pdfs or [])
    return result 