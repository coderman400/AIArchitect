from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.db import db
from backend.models import ProjectModel, OrgViewModel
from backend.langchain_pipeline import multimodal_pipeline, reactflow_to_workflowdetail
import copy

class OrgViewService:
    def __init__(self):
        pass

    async def generate_org_view(self, user_id, project_name, department_function, team_size, budget, description, images, pdfs):
        context = {
            "department_function": department_function,
            "team_size": team_size,
            "budget": budget,
            "description": description
        }
        react_flow_json = multimodal_pipeline(context, images, pdfs)

        # 3. Store org view
        project = ProjectModel(user_id=user_id, name=project_name, created_at=datetime.utcnow())
        project_dict = project.dict(by_alias=True, exclude={"id"})
        project_result = await db.projects.insert_one(project_dict)
        project_id = str(project_result.inserted_id)
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

    def patch_workflow_detail(self, original, updated):
        patched = copy.deepcopy(updated)
        for key in ['inputs', 'outputs', 'connections', 'extra', 'subworkflows']:
            if not patched.get(key):
                patched[key] = original.get(key)
        def patch_steps(orig_steps, upd_steps):
            orig_map = {(s['actor'], s['action']): s for s in orig_steps}
            for upd in upd_steps:
                key = (upd['actor'], upd['action'])
                orig = orig_map.get(key)
                if orig:
                    for k in ['inputs', 'outputs', 'connections', 'extra', 'subworkflows']:
                        if not upd.get(k) and orig.get(k):
                            upd[k] = orig[k]
                    if upd.get('substeps') and orig.get('substeps'):
                        patch_steps(orig['substeps'], upd['substeps'])
        if original.get('steps') and patched.get('steps'):
            patch_steps(original['steps'], patched['steps'])
        return patched 