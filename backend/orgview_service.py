from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.db import db
from backend.models import ProjectModel, OrgViewModel
from backend.langchain_pipeline import multimodal_pipeline, workflowdetail_to_reactflow, group_and_automate_workflow
import copy
from langchain.prompts import PromptTemplate
import json as pyjson
from pydantic import BaseModel
from langchain.output_parsers import PydanticOutputParser

class ProjectNameDesc(BaseModel):
    name: str
    description: str

class OrgViewService:
    def __init__(self):
        pass

    async def suggest_project_name_and_description(self, department_function, team_size, budget, description):
        prompt = PromptTemplate(
            template="""
Given the following business context, suggest a concise, descriptive project name and a one-sentence project description for an AI workflow automation project. Output as a JSON object with 'name' and 'description' fields.

Department Function: {department_function}
Team Size: {team_size}
Budget: {budget}
Description: {description}

JSON object:
""",
            input_variables=["department_function", "team_size", "budget", "description"]
        )
        formatted_prompt = prompt.format(
            department_function=department_function,
            team_size=team_size,
            budget=budget,
            description=description
        )
        from backend.langchain_pipeline import model
        parser = PydanticOutputParser(pydantic_object=ProjectNameDesc)
        response = model.invoke(formatted_prompt)
        try:
            result = parser.parse(response.content)
            return result.name, result.description
        except Exception as e:
            print("Pydantic parse error:", e)
            print("Raw response was:\n", response.content)
            return 'AI Project', ''

    async def generate_org_view(self, user_id, department_function, team_size, budget, description, images, pdfs):
        context = {
            "department_function": department_function,
            "team_size": team_size,
            "budget": budget,
            "description": description
        }
        # Suggest project name/description if not provided
        project_name, project_desc = await self.suggest_project_name_and_description(department_function, team_size, budget, description)
        print(project_name, project_desc)
 
        workflow_detail, react_flow_json = multimodal_pipeline(context, images, pdfs)
        workflow_json = workflow_detail.model_dump() if workflow_detail else None
        ai_workflow_detail = group_and_automate_workflow(workflow_json) if workflow_json else None
        ai_workflow_json = ai_workflow_detail.model_dump() if ai_workflow_detail else None
        ai_react_flow_json = workflowdetail_to_reactflow(ai_workflow_detail) if ai_workflow_detail else {"nodes": [], "edges": []}
        # Extract node_list from ai_react_flow_json
        node_list = []
        for node in ai_react_flow_json.get("nodes", []):
            data = node.get("data", {})
            node_type = data.get("nodeType")
            if node_type is None:
                node_type = "default"
            node_list.append({
                "name": data.get("label"),
                "type": node_type,
                "description": data.get("description")
            })
        project = ProjectModel(user_id=user_id, name=project_name, description=project_desc, created_by=user_id, created_at=datetime.utcnow())
        project_dict = project.dict(by_alias=True, exclude={"id"})
        project_result = await db.projects.insert_one(project_dict)
        project_id = str(project_result.inserted_id)
        org_view = OrgViewModel(
            project_id=project_id,
            react_flow_json=react_flow_json,
            workflow_json=workflow_json,
            ai_workflow_json=ai_workflow_json,
            node_list=node_list,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        org_view_dict = org_view.dict(by_alias=True, exclude={"id"})
        org_view_result = await db.orgviews.insert_one(org_view_dict)
        org_view_id = str(org_view_result.inserted_id)
        return {
            "project_id": project_id,
            # "org_view_id": org_view_id,
            # "react_flow_json": react_flow_json,
            # "ai_react_flow_json": ai_react_flow_json
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

