import logging
from fastapi import FastAPI, UploadFile, File, Form, Depends, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from backend.auth import router as auth_router, get_current_user
from backend.orgview_service import OrgViewService
from backend.langchain_pipeline import reactflow_to_workflowdetail, group_and_automate_workflow, workflowdetail_to_reactflow
from backend.db import db
import uuid
from bson import ObjectId
from datetime import datetime
import json
from pydantic import BaseModel

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

@app.get("/flows")
async def list_user_projects(user=Depends(get_current_user)):
    projects = await db.projects.find({"user_id": user.id}).to_list(length=100)
    return [
        {
            "project_id": str(p.get("_id", p.get("id"))),
            "name": p.get("name"),
            "description": p.get("description")
        }
        for p in projects
    ]

@app.post("/orgview/generate")
async def generate_orgview(
    department_function: str = Form(...),
    team_size: str = Form(...),
    budget: str = Form(...),
    description: str = Form(...),
    images: Optional[List[UploadFile]] = File(None),
    pdfs: Optional[List[UploadFile]] = File(None),
    user=Depends(get_current_user)
):
    service = OrgViewService()
    result = await service.generate_org_view(
        user_id=user.id,
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
    project_id: str = Body(...),
    react_flow_json: dict = Body(...),
    user=Depends(get_current_user)
):
    service = OrgViewService()
    # Fetch the latest orgview for this project and user
    orgview = await db.orgviews.find_one({"project_id": project_id})
    if not orgview:
        return {"error": "OrgView not found for this project."}
    original = orgview.get("workflow_json")
    if not original:
        return {"error": "No original workflow_json found in OrgView."}
    # Dump incoming react_flow_json
    with open("debug_incoming_react_flow.json", "w") as f:
        json.dump(react_flow_json, f, indent=2)
    from backend.langchain_pipeline import reactflow_to_workflowdetail
    reconstructed = reactflow_to_workflowdetail(react_flow_json["nodes"], react_flow_json["edges"])
    # Dump reconstructed workflow
    with open("debug_reconstructed_workflow.json", "w") as f:
        json.dump(reconstructed, f, indent=2)
    patched = service.patch_workflow_detail(original, reconstructed)
    # Dump patched workflow
    with open("debug_patched_workflow.json", "w") as f:
        json.dump(patched, f, indent=2)
    # Update the orgview in the database
    await db.orgviews.update_one(
        {"_id": orgview["_id"]},
        {"$set": {"workflow_json": patched, "react_flow_json": react_flow_json, "updated_at": datetime.utcnow()}}
    )
    return {"patched": patched}



@app.get("/orgview/retrieve/{project_id}")
async def retrieve_orgviews(
    project_id: str,
    user=Depends(get_current_user)
):
    orgview = await db.orgviews.find_one({"project_id": project_id})
    if not orgview:
        return {"error": "OrgView not found for this project."}
    return {
        "react_flow_json": orgview.get("react_flow_json"),
        "ai_react_flow_json": workflowdetail_to_reactflow(group_and_automate_workflow(orgview.get("workflow_json"))) if orgview.get("workflow_json") else {"nodes": [], "edges": []}
    } 