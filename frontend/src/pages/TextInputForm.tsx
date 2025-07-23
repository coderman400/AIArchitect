import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  ArrowLeft,
  HelpCircle,
  Building2,
  Users,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { api } from "../lib/api";

const TextInputForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    departmentFunction: "",
    teamSize: "",
    quarterlyBudget: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear any existing generated workflow when component mounts
  React.useEffect(() => {
    sessionStorage.removeItem("generatedWorkflow");
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("department_function", formData.departmentFunction);
      formDataToSend.append("team_size", formData.teamSize);
      formDataToSend.append("budget", formData.quarterlyBudget);
      formDataToSend.append("description", formData.description);

      // Send POST request to /orgview/generate with FormData using raw axios
      const response = await api.raw.post("/orgview/generate", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Workflow generation response:", response.data);

      // Store the generated workflow data in sessionStorage
      // The workflow data is nested in response.data.react_flow_json
      if (
        response.data &&
        response.data.react_flow_json &&
        (response.data.react_flow_json.nodes ||
          response.data.react_flow_json.edges)
      ) {
        sessionStorage.setItem(
          "generatedWorkflow",
          JSON.stringify(response.data.react_flow_json)
        );
      }

      // Navigate to the specific flow dashboard using the returned project_id
      if (response.data && response.data.project_id) {
        navigate(`/apps/flows/${response.data.project_id}`);
      } else {
        // Fallback to flows listing page if no project_id is returned
        navigate("/apps/flows");
      }
    } catch (err: any) {
      console.error("Error generating workflow:", err);
      setError(
        err.response?.data?.message ||
          "Failed to generate workflow. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                to="/apps/new-flow"
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Input Selection
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <h2 className="text-3xl font-bold">Describe Your Department</h2>
              </div>
              <p className="text-muted-foreground">
                Tell us about your department or business unit to help us create
                tailored workflows
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Department Information
                </h3>

                <div className="space-y-6">
                  {/* Question 1: Department Function */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      What does this part of your company do?
                      <div className="group relative">
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                          Examples: Marketing, Sales, Customer Support, Product
                          Development, Operations, HR, Finance, etc.
                        </div>
                      </div>
                    </label>
                    <Input
                      value={formData.departmentFunction}
                      onChange={(e) =>
                        handleInputChange("departmentFunction", e.target.value)
                      }
                      placeholder="e.g., Marketing - handles brand awareness, lead generation, and customer acquisition"
                      className="w-full"
                      required
                    />
                  </div>

                  {/* Question 2: Team Size */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-primary" />
                      How many people work in this department?
                      <div className="group relative">
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                          Include full-time employees, part-time staff, and
                          contractors who regularly work in this department.
                        </div>
                      </div>
                    </label>
                    <Input
                      type="number"
                      value={formData.teamSize}
                      onChange={(e) =>
                        handleInputChange("teamSize", e.target.value)
                      }
                      placeholder="e.g., 12"
                      className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      min="1"
                      required
                    />
                  </div>

                  {/* Question 3: Quarterly Budget */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <DollarSign className="h-4 w-4 text-primary" />
                      What is the quarterly budget for this department?
                      <div className="group relative">
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                          Include salaries, tools, software, advertising spend,
                          and other operational costs. Use ranges if exact
                          numbers aren't available (e.g., $50K-75K).
                        </div>
                      </div>
                    </label>
                    <Input
                      value={formData.quarterlyBudget}
                      onChange={(e) =>
                        handleInputChange("quarterlyBudget", e.target.value)
                      }
                      placeholder="e.g., $75,000 or $50K-75K"
                      className="w-full"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Department Workflows & Processes
                </h3>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    Describe the workflows and processes in this department
                    <div className="group relative">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-80 z-10">
                        List the main workflows, processes, and activities. For
                        marketing: SEO, lead qualification, email campaigns,
                        social media, content creation, etc. Be specific about
                        current processes and pain points.
                      </div>
                    </div>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Example for Marketing Department:

• SEO and content marketing workflows
• Lead qualification and scoring processes  
• Email marketing campaigns and automation
• Social media management and posting schedules
• Inbound lead nurturing sequences
• Outbound sales outreach campaigns
• Campaign performance tracking and reporting
• Customer onboarding and retention programs

Describe your current processes, tools used, pain points, and areas where automation could help..."
                    className="w-full min-h-[300px] p-4 border border-border rounded-md bg-background resize-y focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-destructive/15 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-muted-foreground">
                  This information helps us create relevant workflow templates
                  for your department
                </p>
                <Button
                  type="submit"
                  size="lg"
                  className="px-8"
                  disabled={
                    isLoading ||
                    !formData.departmentFunction ||
                    !formData.teamSize ||
                    !formData.quarterlyBudget ||
                    !formData.description
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Workflows...
                    </>
                  ) : (
                    "Create Workflows"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TextInputForm;
