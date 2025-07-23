import api from "../lib/api";

// Flow-related interfaces
export interface Flow {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlowRequest {
  name: string;
  description?: string;
  departmentFunction: string;
  teamSize: number;
  quarterlyBudget: string;
  workflowDescription: string;
}

export interface FlowsResponse
  extends Array<{
    project_id: string;
    name: string;
    description: string;
  }> {}

export interface AnalyticsData {
  totalFlows: number;
  monthlyLLMCalls: number;
  monthlyCost: string;
  costBenefit: string;
}

export interface FlowWorkflowData {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      label: string;
      nodeType?: string;
      description?: string;
    };
    parentNode?: string;
    extent?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string;
    animated?: boolean;
  }>;
}

export interface FlowApiResponse {
  react_flow_json: FlowWorkflowData;
  ai_react_flow_json: FlowWorkflowData;
}

export interface IntegrationNode {
  name: string;
  type: string;
  description: string;
}

export interface IntegrationNodesResponse {
  node_list: IntegrationNode[];
}

// Flows API service
export const flowsService = {
  // Get all flows
  getFlows: async (): Promise<any> => {
    const response = await api.raw.get("/flows");
    return response.data;
  },

  // Get single flow by ID
  getFlow: async (id: string): Promise<FlowApiResponse> => {
    const response = await api.raw.get(`/orgview/retrieve/${id}`);
    return response.data;
  },

  // Create new flow
  createFlow: async (flowData: CreateFlowRequest): Promise<Flow> => {
    return api.post<Flow>("/flows", flowData);
  },

  // Update flow
  updateFlow: async (id: string, flowData: Partial<Flow>): Promise<Flow> => {
    return api.put<Flow>(`/flows/${id}`, flowData);
  },

  // Delete flow
  deleteFlow: async (id: string): Promise<void> => {
    return api.delete<void>(`/flows/${id}`);
  },

  // Get analytics data
  getAnalytics: async (): Promise<AnalyticsData> => {
    return api.get<AnalyticsData>("/analytics");
  },

  // Submit text input form
  submitTextInput: async (formData: CreateFlowRequest): Promise<Flow> => {
    return api.post<Flow>("/flows/text-input", formData);
  },

  // Get integration nodes for a specific flow
  getIntegrationNodes: async (
    projectId: string
  ): Promise<IntegrationNode[]> => {
    const response = await api.raw.get(`/orgview/integrations/${projectId}`);
    return response.data.node_list;
  },
};

export default flowsService;
