import getpass
import os
from dotenv import load_dotenv
load_dotenv()

import uuid
import json


if not os.environ.get("GOOGLE_API_KEY"):
  os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter API key for Google Gemini: ")

from langchain.chat_models import init_chat_model
from pydantic import BaseModel, Field, RootModel
from typing import Any, List, Optional, Dict
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema import BaseOutputParser

model = init_chat_model("gemini-2.0-flash", model_provider="google_genai")

# Pydantic models
class WorkflowSummary(BaseModel):
    name: str
    description: str

class Step(BaseModel):
    actor: str
    action: str
    substeps: Optional[List["Step"]] = None  # Nested steps for grouping or sub-processes

Step.model_rebuild()

class WorkflowDetail(BaseModel):
    name: str
    actors: List[str]
    steps: List[Step]
    inputs: Optional[List[str]] = None
    outputs: Optional[List[str]] = None
    connections: Optional[List[str]] = None
    extra: Optional[Dict[str, Any]] = None
    subworkflows: Optional[List["WorkflowDetail"]] = None  # Nested subworkflows

WorkflowDetail.model_rebuild()

class WorkflowSummaryList(RootModel[List[WorkflowSummary]]):
    pass

# Sample business process input
sample_input = """
Our company has two main processes:
1. Lead Qualification: Sales reps review inbound leads and qualify them. Sales managers approve qualified leads.
2. Customer Onboarding: After a sale is closed, the account manager sends a welcome email and support sets up the account.
"""

# Pipeline skeleton

def extract_workflow_summaries(text: str) -> List[WorkflowSummary]:
    parser = PydanticOutputParser(pydantic_object=WorkflowSummaryList)
    prompt = PromptTemplate(
        template="""
Given the following business process description, extract a list of workflows. For each workflow, provide its name and a short description. Return the result as a JSON list of objects with 'name' and 'description' fields.

Business process description:
{text}

JSON list:
""",
        input_variables=["text"]
    )
    formatted_prompt = prompt.format(text=text)
    response = model.invoke(formatted_prompt)
    try:
        workflows = parser.parse(response.content).root
    except Exception as e:
        print("Error parsing workflow summaries:", e)
        print("Raw response was:\n", response.content)
        workflows = []
    return workflows

def extract_workflow_details(summary: WorkflowSummary) -> WorkflowDetail:
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

JSON object:
""",
        input_variables=["name", "description"]
    )
    formatted_prompt = prompt.format(name=summary.name, description=summary.description)
    response = model.invoke(formatted_prompt)
    try:
        detail = parser.parse(response.content)
    except Exception as e:
        print(f"Error parsing workflow detail for {summary.name}:", e)
        print("Raw response was:\n", response.content)
        detail = WorkflowDetail(name=summary.name, actors=[], steps=[])
    return detail

def workflowdetail_to_reactflow(workflow: WorkflowDetail):
    nodes = []
    edges = []

    def add_step_nodes(step, parent_id=None, parent_label=None, depth=0):
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
        # Add substeps recursively
        if step.substeps:
            prev_sub_id = None
            for sub in step.substeps:
                sub_id = add_step_nodes(sub, parent_id=step_id, parent_label=label, depth=depth+1)
                # Connect parent to first substep, chain substeps
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


if __name__ == "__main__":
    print("Sample input:\n", sample_input)
    summaries = extract_workflow_summaries(sample_input)
    print("\nExtracted workflow summaries:")
    for s in summaries:
        print(s.model_dump_json(indent=2))
    print("\nDetailed workflow structures:")
    details = []
    for s in summaries:
        detail = extract_workflow_details(s)
        print(detail.model_dump_json(indent=2))
        details.append(detail)
    # Convert the first workflow detail to React Flow format and print
    if details:
        print("\nReact Flow JSON for first workflow:")
        reactflow_json = workflowdetail_to_reactflow(details[0])
        print(json.dumps(reactflow_json, indent=2))
        # Save to file
        with open("workflow_flow.json", "w") as f:
            json.dump(reactflow_json, f, indent=2)
        print("\nSaved React Flow JSON to workflow_flow.json")