import api from "../lib/api";

// Flow-related interfaces
export interface Flow {
  id: string;
  name: string;
  status: "Active" | "Draft" | "Inactive";
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

export interface FlowsResponse {
  flows: Flow[];
  total: number;
}

export interface AnalyticsData {
  totalFlows: number;
  monthlyLLMCalls: number;
  monthlyCost: string;
  costBenefit: string;
}

// Flows API service
export const flowsService = {
  // Get all flows
  getFlows: async (): Promise<FlowsResponse> => {
    return api.get<FlowsResponse>("/flows");
  },

  // Get single flow by ID
  getFlow: async (id: string): Promise<Flow> => {
    return api.get<Flow>(`/flows/${id}`);
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
};

export default flowsService;
