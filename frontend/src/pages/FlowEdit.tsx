import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import FlowCard from "../components/FlowCard";
import type { WorkflowData } from "../components/FlowCard";
import workflowData from "../workflow_flow.json";
import {
  flowsService,
  type Flow,
  type FlowApiResponse,
} from "../services/flowsService";

const FlowEdit: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [generatedWorkflow, setGeneratedWorkflow] =
    useState<WorkflowData | null>(null);
  const [generatedAiWorkflow, setGeneratedAiWorkflow] =
    useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlow = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        // Fetch flow data from /orgview/retrieve/{projectId}
        const flowResponse: FlowApiResponse = await flowsService.getFlow(
          projectId
        );
        console.log("Flow API response:", flowResponse);

        // Extract the workflow data from the API response
        if (flowResponse && flowResponse.react_flow_json) {
          setGeneratedWorkflow(flowResponse.react_flow_json);
        }
        if (flowResponse && flowResponse.ai_react_flow_json) {
          setGeneratedAiWorkflow(flowResponse.ai_react_flow_json);
        }

        // Create a mock flow object for display purposes
        setFlow({
          id: projectId,
          name: "AI Generated Workflow",
          description:
            "Workflow generated based on your department description",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error fetching flow:", error);
        // Set fallback data if API fails
        setFlow({
          id: projectId,
          name: "Workflow",
          description: "Unable to load workflow details",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFlow();
  }, [projectId]);

  console.log("Generated workflow state:", generatedWorkflow);
  console.log(
    "Workflow data being passed to FlowCard:",
    generatedWorkflow || workflowData
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Sidebar />
        <main className="flex-1 ml-48 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-[600px] bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-48 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold">Edit Flow</h1>
              <p className="text-muted-foreground mt-2">
                Modify and update your workflow configuration
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  (window.location.href = `/apps/flows/${projectId}`)
                }
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Back to Dashboard
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FlowCard
              key={generatedWorkflow ? "generated" : "default"}
              title={
                generatedWorkflow ? "Current Workflow" : "Sales Lead Workflow"
              }
              description={
                generatedWorkflow
                  ? "What your current company does. You can edit this to make it more accurate."
                  : "AI-generated workflow that improves the current workflow with agentic nodes and improved logic."
              }
              workflowData={generatedWorkflow || workflowData}
              height="h-[600px]"
              editable={true}
            />
            <FlowCard
              title="AI-Improved Workflow"
              description="A better workflow that improves the current workflow with agentic nodes and improved logic."
              workflowData={generatedAiWorkflow || workflowData}
              height="h-[600px]"
              editable={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlowEdit;
