import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import FlowCard from "../components/FlowCard";
import type { WorkflowData } from "../components/FlowCard";
import workflowData from "../workflow_flow.json";

const Flows: React.FC = () => {
  const [generatedWorkflow, setGeneratedWorkflow] =
    useState<WorkflowData | null>(null);

  useEffect(() => {
    // Check if there's generated workflow data in sessionStorage
    const storedWorkflow = sessionStorage.getItem("generatedWorkflow");
    console.log("Stored workflow raw:", storedWorkflow);
    if (storedWorkflow) {
      try {
        const parsedWorkflow = JSON.parse(storedWorkflow);
        console.log("Parsed workflow:", parsedWorkflow);
        setGeneratedWorkflow(parsedWorkflow);
      } catch (error) {
        console.error("Error parsing stored workflow:", error);
      }
    }
  }, []);

  console.log("Generated workflow state:", generatedWorkflow);
  console.log(
    "Workflow data being passed to FlowCard:",
    generatedWorkflow || workflowData
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-48 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Flows</h1>
          <div className="grid grid-cols-2 gap-4">
            <FlowCard
              key={generatedWorkflow ? "generated" : "default"}
              title={
                generatedWorkflow ? "Generated Workflow" : "Sales Lead Workflow"
              }
              description={
                generatedWorkflow
                  ? "AI-generated workflow based on your department description."
                  : "Interactive workflow visualization showing the sales lead qualification process."
              }
              workflowData={generatedWorkflow || workflowData}
              height="h-[600px]"
            />
            <FlowCard
              title="Sales Lead Workflow"
              description="Interactive workflow visualization showing the sales lead qualification process."
              workflowData={workflowData}
              height="h-[600px]"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Flows;
