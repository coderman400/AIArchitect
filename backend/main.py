import logging
from fastapi import FastAPI, UploadFile, File, Form, Depends, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from backend.auth import router as auth_router, get_current_user
from backend.orgview_service import OrgViewService
from backend.db import db
import uuid

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

# logger = logging.getLogger("uvicorn.access")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    return response

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/projects")
async def list_projects(user=Depends(get_current_user)):
    # TODO: implement project listing for user
    return {"projects": []}

@app.post("/orgview/generate")
async def generate_orgview(
    project_name: Optional[str] = Form(None),
    department_function: str = Form(...),
    team_size: str = Form(...),
    budget: str = Form(...),
    description: str = Form(...),
    images: Optional[List[UploadFile]] = File(None),
    pdfs: Optional[List[UploadFile]] = File(None),
    user=Depends(get_current_user)
):
    if not project_name:
        project_name = str(uuid.uuid4())
    service = OrgViewService()
    result = await service.generate_org_view(
        user_id=user.id,
        project_name=project_name,
        department_function=department_function,
        team_size=team_size,
        budget=budget,
        description=description,
        images=images or [],
        pdfs=pdfs or []
    )
    return result

@app.post("/orgview/patch")
async def patch_orgview(
    original: dict = Body(...),
    updated: dict = Body(...),
    user=Depends(get_current_user)
):
    service = OrgViewService()
    patched = service.patch_workflow_detail(original, updated)
    return patched 