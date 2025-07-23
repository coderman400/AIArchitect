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
  type IntegrationNode,
} from "../services/flowsService";

// Import the same SVG icons as CustomNode
import GoogleSheetsIcon from "../assets/google-sheets-icon.svg";
import GoogleCalendarIcon from "../assets/google-calendar-icon.svg";
import ChatGPTIcon from "../assets/chatgpt-icon.svg";
import ClaudeIcon from "../assets/claude-ai-icon.svg";
import WebhookIcon from "../assets/webhook.svg";
import NotionIcon from "../assets/notion-icon.svg";
import HubspotIcon from "../assets/hubspot-icon.svg";
import SlackIcon from "../assets/slack-icon.svg";
import StripeIcon from "../assets/stripe-icon.svg";
import GmailIcon from "../assets/gmail-icon.svg";
import ToolsIcon from "../assets/tools-icon.svg";

type NodeType =
  | "webhook"
  | "notion"
  | "hubspot"
  | "googleSheets"
  | "googleCalendar"
  | "chatgpt"
  | "claude"
  | "slack"
  | "stripe"
  | "gmail"
  | "tools"
  | "default";

// Icon mapping (same as CustomNode)
const iconMap: Record<NodeType, string | null> = {
  webhook: WebhookIcon,
  notion: NotionIcon,
  hubspot: HubspotIcon,
  googleSheets: GoogleSheetsIcon,
  googleCalendar: GoogleCalendarIcon,
  chatgpt: ChatGPTIcon,
  claude: ClaudeIcon,
  slack: SlackIcon,
  stripe: StripeIcon,
  gmail: GmailIcon,
  tools: ToolsIcon,
  default: ToolsIcon,
};

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

const IntegrationNodeComponent: React.FC<IntegrationNode> = ({
  name,
  type,
  description,
}) => {
  const IconComponent = iconMap[type as NodeType] || iconMap["default"];
  const isToolsIcon = type === "tools" || type === "default";

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        {/* Icon */}
        {IconComponent && (
          <div className="flex-shrink-0">
            {isToolsIcon ? (
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={IconComponent}
                  alt={type}
                  style={{
                    width: "16px",
                    height: "16px",
                    display: "block",
                  }}
                />
              </div>
            ) : (
              <img
                src={IconComponent}
                alt={type}
                style={{
                  width: "24px",
                  height: "24px",
                  display: "block",
                }}
              />
            )}
          </div>
        )}
        {/* Title */}
        <h4 className="font-medium text-sm flex-1">{name}</h4>
      </div>
      {description !== "default" && (
        <p className="text-xs text-muted-foreground/80 ml-9">{description}</p>
      )}
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
  const [integrationNodes, setIntegrationNodes] = useState<IntegrationNode[]>(
    []
  );

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

        // Fetch integration nodes
        try {
          const nodesData = await flowsService.getIntegrationNodes(projectId);
          setIntegrationNodes(nodesData);
        } catch (error) {
          console.error("Error fetching integration nodes:", error);
          // Use fallback empty array if API fails
          setIntegrationNodes([]);
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
              value={integrationNodes.length.toString()}
              description={`${integrationNodes.length} total configured`}
            />
          </div>

          {/* Integration Nodes */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Integration Nodes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {integrationNodes.map((node, index) => (
                <IntegrationNodeComponent
                  key={index}
                  name={node.name}
                  type={node.type}
                  description={node.description}
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
