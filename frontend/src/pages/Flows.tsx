import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { flowsService, type Flow } from "../services/flowsService";

interface FlowListItemProps {
  flow: Flow;
}

const FlowListItem: React.FC<FlowListItemProps> = ({ flow }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{flow.name}</h3>
          <p className="text-muted-foreground text-sm mb-3">
            {flow.description || "No description available"}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Created: {new Date(flow.createdAt).toLocaleDateString()}
            </span>
            <span>
              Updated: {new Date(flow.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2">
            <Link
              to={`/apps/flows/${flow.id}`}
              className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to={`/apps/flows/${flow.id}/edit`}
              className="px-3 py-1 text-xs border border-border rounded hover:bg-muted transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Flows: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await flowsService.getFlows();
        // Map API response to Flow interface
        const mappedFlows: Flow[] = response.map((item: any) => ({
          id: item.project_id,
          name: item.name || "Unnamed Flow",
          status: "Active" as const,
          description: item.description || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setFlows(mappedFlows);
      } catch (err) {
        console.error("Error fetching flows:", err);
        setError("Failed to load flows. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Sidebar />
        <main className="flex-1 ml-48 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold">Flows</h1>
                <p className="text-muted-foreground mt-2">
                  Manage and monitor your automated workflows
                </p>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Sidebar />
        <main className="flex-1 ml-48 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold">Flows</h1>
                <p className="text-muted-foreground mt-2">
                  Manage and monitor your automated workflows
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/apps/new-flow"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create New Flow
                </Link>
              </div>
            </div>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-destructive mb-2">
                Error Loading Flows
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
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
              <h1 className="text-4xl font-bold">Flows</h1>
              <p className="text-muted-foreground mt-2">
                Manage and monitor your automated workflows
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/apps/new-flow"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create New Flow
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {flows.map((flow) => (
              <FlowListItem key={flow.id} flow={flow} />
            ))}

            {flows.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No flows found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first workflow
                </p>
                <Link
                  to="/apps/new-flow"
                  className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create New Flow
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Flows;
