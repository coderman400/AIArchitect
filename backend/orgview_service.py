from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.db import db
from backend.models import ProjectModel, OrgViewModel
from backend.langchain_pipeline import multimodal_pipeline

class OrgViewService:
    def __init__(self):
        pass

    async def generate_org_view(self, user_id: str, project_name: str, texts: List[str], images: List[Any], pdfs: List[Any]) -> Dict[str, Any]:
        # 1. Create a new project
        project = ProjectModel(user_id=user_id, name=project_name, created_at=datetime.utcnow())
        project_dict = project.dict(by_alias=True, exclude={"id"})
        project_result = await db.projects.insert_one(project_dict)
        project_id = str(project_result.inserted_id)

        # 2. Use multimodal pipeline to generate React Flow JSON
        react_flow_json = multimodal_pipeline(texts, images, pdfs)

        # 3. Store org view
        org_view = OrgViewModel(
            project_id=project_id,
            react_flow_json=react_flow_json,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        org_view_dict = org_view.dict(by_alias=True, exclude={"id"})
        org_view_result = await db.orgviews.insert_one(org_view_dict)
        org_view_id = str(org_view_result.inserted_id)

        return {
            "project_id": project_id,
            "org_view_id": org_view_id,
            "react_flow_json": react_flow_json
        } 