from pydantic import BaseModel, Field, RootModel
from typing import List, Optional, Dict, Any, Union
from langchain.chat_models import init_chat_model
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from datetime import datetime
import mimetypes
import json

# Pydantic models
class WorkflowSummary(BaseModel):
    name: str
    description: str

class Step(BaseModel):
    actor: str
    action: str
    substeps: Optional[List["Step"]] = None
    ai_recommendation: Optional[Union[str, Dict[str, Any]]] = None  # Accept string or dict
    type: Optional[str] = None  # For icon/visualization

Step.model_rebuild()

class WorkflowDetail(BaseModel):
    name: str
    actors: List[str]
    steps: List[Step]
    inputs: Optional[List[str]] = None
    outputs: Optional[List[str]] = None
    connections: Optional[List[str]] = None
    extra: Optional[Dict[str, Any]] = None
    subworkflows: Optional[List["WorkflowDetail"]] = None

WorkflowDetail.model_rebuild()

class WorkflowSummaryList(RootModel[List[WorkflowSummary]]):
    pass

# React Flow conversion
import uuid

def workflowdetail_to_reactflow(workflow):
    nodes = []
    edges = []
    def add_step_nodes(step, parent_id=None, depth=0):
        step_id = str(uuid.uuid4())
        node = {
            "id": step_id,
            "type": "default",
            "data": {
                "label": f"{step.actor}: {step.action}" if step.actor else step.action,
                "nodeType": getattr(step, "type", None),
                "description": getattr(step, "ai_recommendation", None)
            },
            "position": {"x": depth * 200, "y": len(nodes) * 100},
        }
        if parent_id:
            node["parentNode"] = parent_id
            node["extent"] = "parent"
        nodes.append(node)
        last_id = step_id
        if getattr(step, "substeps", None):
            prev_sub_id = None
            for sub in step.substeps:
                sub_id = add_step_nodes(sub, parent_id=step_id, depth=depth+1)
                if prev_sub_id is None:
                    edges.append({"id": f"e{step_id}-{sub_id}", "source": step_id, "target": sub_id, "type": "default"})
                else:
                    edges.append({"id": f"e{prev_sub_id}-{sub_id}", "source": prev_sub_id, "target": sub_id, "type": "default"})
                prev_sub_id = sub_id
            last_id = prev_sub_id
        return step_id
    prev_id = None
    for step in workflow.steps:
        step_id = add_step_nodes(step)
        if prev_id:
            edges.append({"id": f"e{prev_id}-{step_id}", "source": prev_id, "target": step_id, "type": "default"})
        prev_id = step_id
    return {"nodes": nodes, "edges": edges}

def reactflow_to_workflowdetail(nodes, edges):
    node_lookup = {node['id']: node for node in nodes}
    children = {}
    for node in nodes:
        parent = node.get('parentNode')
        if parent:
            children.setdefault(parent, []).append(node['id'])
    edge_map = {}
    for edge in edges:
        edge_map.setdefault(edge['source'], []).append(edge['target'])
    def build_step(node_id):
        node = node_lookup[node_id]
        label = node['data']['label']
        if ':' in label:
            actor, action = label.split(':', 1)
            actor = actor.strip()
            action = action.strip()
        else:
            actor, action = '', label
        substeps = [build_step(child_id) for child_id in children.get(node_id, [])]
        return {
            'actor': actor,
            'action': action,
            'substeps': substeps if substeps else None
        }
    top_level = [n['id'] for n in nodes if not n.get('parentNode')]
    steps = [build_step(node_id) for node_id in top_level]
    actors = list({step['actor'] for step in steps if step['actor']})
    return {
        'name': 'Reconstructed Workflow',
        'actors': actors,
        'steps': steps,
    }

# LangChain Gemini model
model = init_chat_model("gemini-2.0-flash", model_provider="google_genai")

def extract_workflow_summaries(context: dict, files: List[Any]) -> Optional[WorkflowSummary]:
    parser = PydanticOutputParser(pydantic_object=WorkflowSummary)
    prompt = PromptTemplate(
        template="""
Given the following business process information, summarize the overall process as a single workflow. Provide its name and a short description. Return the result as a JSON object with 'name' and 'description' fields.

Department Function: {department_function}
Team Size: {team_size}
Budget: {budget}
Description: {description}
(Attached files may include images or PDFs.)

JSON object:
""",
        input_variables=["department_function", "team_size", "budget", "description"]
    )
    multimodal_input = []
    formatted_prompt = prompt.format(**context)
    multimodal_input.append(formatted_prompt)
    for f in files:
        content = f.file.read()
        mime = f.content_type or mimetypes.guess_type(f.filename)[0] or "application/octet-stream"
        multimodal_input.append({"mime_type": mime, "data": content})
    response = model.invoke(multimodal_input)
    try:
        summary = parser.parse(response.content)
        return summary
    except Exception as e:
        print("Error parsing workflow summary:", e)
        print("Raw response was:\n", response.content)
        return None

def extract_workflow_details(summary: WorkflowSummary, context: str = "") -> WorkflowDetail:
    parser = PydanticOutputParser(pydantic_object=WorkflowDetail)
    prompt = PromptTemplate(
        template="""
Given the following workflow summary, provide a detailed workflow structure as a JSON object with the following fields:
- name: string
- actors: list of strings (roles or people involved)
- steps: list of objects with 'actor', 'action', and optional 'substeps' fields.
  Every step and substep must include both 'actor' and 'action' fields, even if the actor is the same as the parent.
- inputs: list of strings (optional)
- outputs: list of strings (optional)
- connections: list of strings (names of related workflows, optional)
- extra: object (optional, for any additional info)
- subworkflows: list of workflow objects (optional, for nested sub-workflows)

If a step is itself a process, represent it as a step with a 'substeps' field (a list of steps). If a workflow contains sub-workflows, include them in a 'subworkflows' field. Group consecutive steps by the same actor under a single step with a 'substeps' field if they are logically related.

Workflow summary:
Name: {name}
Description: {description}
{context}

JSON object:
""",
        input_variables=["name", "description", "context"]
    )
    formatted_prompt = prompt.format(name=summary.name, description=summary.description, context=context)
    response = model.invoke(formatted_prompt)
    try:
        detail = parser.parse(response.content)
    except Exception as e:
        # Fallback: try to fill missing 'actor' in substeps
        import json as pyjson
        import copy
        try:
            data = pyjson.loads(response.content.strip('`\n '))
            def fill_actors(steps, parent_actor=None):
                for step in steps:
                    if 'actor' not in step or not step['actor']:
                        step['actor'] = parent_actor or ''
                    if 'substeps' in step and step['substeps']:
                        fill_actors(step['substeps'], step['actor'])
            if 'steps' in data:
                fill_actors(data['steps'])
            detail = WorkflowDetail(**data)
        except Exception as e2:
            detail = WorkflowDetail(name=summary.name, actors=[], steps=[])
    return detail

def multimodal_pipeline(context: dict, images: List[Any], pdfs: List[Any]):
    files = (images or []) + (pdfs or [])
    summary = extract_workflow_summaries(context, files)
    if summary:
        detail = extract_workflow_details(summary)
        reactflow = workflowdetail_to_reactflow(detail)
        return detail, reactflow
    return None, {"nodes": [], "edges": []}


def group_and_automate_workflow(workflow_json: dict, icon_list: Optional[list] = None) -> WorkflowDetail:
    parser = PydanticOutputParser(pydantic_object=WorkflowDetail)
    # icon_list is not used in the prompt anymore, but kept for compatibility
    prompt = PromptTemplate(
        template="""
Available icons/types and their use cases:
- chatgpt: LLM-powered text generation, email drafting, chatbots, summarization
- claude: LLM-powered document analysis, contract review
- googleCalendar: Scheduling meetings, calendar invites, reminders
- googleSheets: Data entry, reporting, spreadsheet automation
- hubspot: CRM automation, lead management, sales pipeline
- salesforce: CRM automation, customer data management

Example 1:
Original steps:
- "Send welcome email to customer"
- "Draft personalized onboarding message"
AI pipeline node:
{{
  "actor": "AI System",
  "action": "Automated Onboarding Email",
  "type": "chatgpt",
  "ai_recommendation": "Use chatgpt to draft and send personalized onboarding emails to new customers, replacing manual drafting and sending."
}}

Example 2:
Original steps:
- "Schedule onboarding meeting"
- "Send calendar invite"
AI pipeline node:
{{
  "actor": "AI System",
  "action": "Automated Meeting Scheduling",
  "type": "googleCalendar",
  "ai_recommendation": "Use googleCalendar integration to automatically schedule onboarding meetings and send invites."
}}

Given the following business workflow, your goal is to produce the most compact, high-level AI-augmented workflow possible. Group as many consecutive or logically related automatable steps as possible into a single AI pipeline node. Assign the most appropriate 'type' from the available icons/types list for each AI node, based on the examples above. Only keep manual steps as separate nodes if they cannot be automated or grouped. The output workflow should be as simple and high-level as possible, while preserving the overall process logic.

Workflow:
{workflow_json}

JSON object:
""",
        input_variables=["workflow_json"]
    )
    formatted_prompt = prompt.format(workflow_json=json.dumps(workflow_json, indent=2))
    response = model.invoke(formatted_prompt)
    def stringify_ai_recommendation(step):
        if isinstance(step.get('ai_recommendation'), dict):
            d = step['ai_recommendation']
            step['ai_recommendation'] = f"{d.get('type', '')}: {d.get('description', '')} (Replaces: {d.get('replaced_steps', '')})"
        if step.get('substeps'):
            for sub in step['substeps']:
                stringify_ai_recommendation(sub)
    try:
        detail = parser.parse(response.content)
    except Exception as e:
        print("Pydantic parse error:", e)
        print("Raw response was:\n", response.content)
        import json as pyjson
        try:
            data = pyjson.loads(response.content.strip('`\n '))
            if 'steps' in data:
                for step in data['steps']:
                    stringify_ai_recommendation(step)
            detail = WorkflowDetail(**data)
        except Exception as e2:
            print("Fallback parse error:", e2)
            detail = None
    return detail 