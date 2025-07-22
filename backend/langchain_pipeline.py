from pydantic import BaseModel, Field, RootModel
from typing import List, Optional, Dict, Any
from langchain.chat_models import init_chat_model
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from datetime import datetime
import mimetypes

# Pydantic models
class WorkflowSummary(BaseModel):
    name: str
    description: str

class Step(BaseModel):
    actor: str
    action: str
    substeps: Optional[List["Step"]] = None

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

def workflowdetail_to_reactflow(workflow: WorkflowDetail):
    nodes = []
    edges = []
    def add_step_nodes(step, parent_id=None, depth=0):
        step_id = str(uuid.uuid4())
        label = f"{step.actor}: {step.action}" if step.actor else step.action
        node = {
            "id": step_id,
            "type": "default",
            "data": {"label": label},
            "position": {"x": depth * 200, "y": len(nodes) * 100},
        }
        if parent_id:
            node["parentNode"] = parent_id
            node["extent"] = "parent"
        nodes.append(node)
        last_id = step_id
        if step.substeps:
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

# LangChain Gemini model
model = init_chat_model("gemini-2.0-flash", model_provider="google_genai")

def extract_workflow_summaries(texts: List[str], files: List[Any]) -> Optional[WorkflowSummary]:
    parser = PydanticOutputParser(pydantic_object=WorkflowSummary)
    prompt = PromptTemplate(
        template="""
Given the following business process information (text, images, and PDFs), summarize the overall process as a single workflow. Provide its name and a short description. Return the result as a JSON object with 'name' and 'description' fields.

Business process information:
{text}

(Attached files may include images or PDFs.)

JSON object:
""",
        input_variables=["text"]
    )
    multimodal_input = []
    if texts:
        multimodal_input.append("\n".join(texts))
    for f in files:
        content = f.file.read()
        mime = f.content_type or mimetypes.guess_type(f.filename)[0] or "application/octet-stream"
        multimodal_input.append({"mime_type": mime, "data": content})
    formatted_prompt = prompt.format(text="\n".join(texts))
    response = model.invoke([formatted_prompt] + multimodal_input)
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
- steps: list of objects with 'actor', 'action', and optional 'substeps' fields (use 'substeps' to group logically related or sequential steps by the same actor, or to represent nested/conditional actions)
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
        print(f"Error parsing workflow detail for {summary.name}:", e)
        print("Raw response was:\n", response.content)
        detail = WorkflowDetail(name=summary.name, actors=[], steps=[])
    return detail

def multimodal_pipeline(texts: List[str], images: List[Any], pdfs: List[Any]) -> Dict[str, Any]:
    files = (images or []) + (pdfs or [])
    summary = extract_workflow_summaries(texts, files)
    if summary:
        detail = extract_workflow_details(summary)
        return workflowdetail_to_reactflow(detail)
    return {"nodes": [], "edges": []} 