import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import FlowCard from "../components/FlowCard";
import type { WorkflowData } from "../components/FlowCard";
import workflowData from "../workflow_flow.json";
import {
  flowsService,
  type Flow,
  type AnalyticsData,
  type FlowApiResponse,
} from "../services/flowsService";

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
}) => (
  <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
    <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
    <p className="text-2xl font-bold mb-1">{value}</p>
    {description && (
      <p className="text-sm text-muted-foreground">{description}</p>
    )}
  </div>
);

interface IntegrationNodeProps {
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
}

const IntegrationNode: React.FC<IntegrationNodeProps> = ({
  name,
  type,
  status,
}) => {
  const statusDots = {
    active: "bg-green-500",
    inactive: "bg-gray-400",
    error: "bg-red-500",
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">{name}</h4>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDots[status]}`}></div>
          <span className="text-xs text-muted-foreground capitalize">
            {status}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{type}</p>
    </div>
  );
};

const FlowDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiWorkflow, setAiWorkflow] = useState<WorkflowData | null>(null);
  const [reactWorkflow, setReactWorkflow] = useState<WorkflowData | null>(null);

  // Mock integration nodes data - replace with actual API call
  const integrationNodes: IntegrationNodeProps[] = [
    { name: "Salesforce CRM", type: "CRM Integration", status: "active" },
    { name: "Slack Notifications", type: "Messaging", status: "active" },
    { name: "Email Service", type: "Communication", status: "active" },
    { name: "Analytics Database", type: "Data Storage", status: "inactive" },
    { name: "Payment Gateway", type: "Financial", status: "error" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        // Fetch flow data from /orgview/retrieve/{projectId}
        const flowResponse: FlowApiResponse = await flowsService.getFlow(
          projectId
        );
        console.log("Flow API response:", flowResponse);

        // Extract the workflow data from the API response
        if (flowResponse && flowResponse.ai_react_flow_json) {
          setAiWorkflow(flowResponse.ai_react_flow_json);
        }
        if (flowResponse && flowResponse.react_flow_json) {
          setReactWorkflow(flowResponse.react_flow_json);
        }

        // Create a mock flow object for display purposes
        setFlow({
          id: projectId,
          name: "Sales Lead Workflow",
          description:
            "Workflow generated based on your department description",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Fetch analytics data (keep existing mock for now)
        try {
          const analyticsData = await flowsService.getAnalytics();
          setAnalytics(analyticsData);
        } catch (error) {
          console.log("Analytics API not available, using mock data");
          // Use mock analytics data if API fails
          setAnalytics({
            totalFlows: 1,
            monthlyLLMCalls: 1250,
            monthlyCost: "$247",
            costBenefit: "$12,500",
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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

    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Sidebar />
        <main className="flex-1 ml-48 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
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
              <h1 className="text-4xl font-bold">
                {flow?.name || "Flow Dashboard"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {flow?.description ||
                  "Monitor your flow performance and integrations"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  (window.location.href = `/apps/flows/${projectId}/edit`)
                }
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Edit Flow
              </button>
            </div>
          </div>

          {/* Top Level Metrics */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Overall Cost Benefit"
              value={analytics?.costBenefit || "$12,500"}
              description="Monthly savings vs manual process"
            />
            <MetricCard
              title="LLM Costs"
              value={analytics?.monthlyCost || "$247"}
              description={`${
                analytics?.monthlyLLMCalls || 1250
              } API calls this month`}
            />
            <MetricCard
              title="No. of Integrations"
              value={integrationNodes
                .filter((node) => node.status === "active")
                .length.toString()}
              description={`${integrationNodes.length} total configured`}
            />
          </div>

          {/* Integration Nodes */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Integration Nodes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {integrationNodes.map((node, index) => (
                <IntegrationNode
                  key={index}
                  name={node.name}
                  type={node.type}
                  status={node.status}
                />
              ))}
            </div>
          </div>

          {/* Flow Visualization */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Flow Visualization</h2>
            <FlowCard
              title={flow?.name || "Your Workflow"}
              description="AI-improved workflow based on your department description"
              workflowData={aiWorkflow || workflowData}
              height="h-[700px]"
              className="w-full"
              editable={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlowDashboard;
