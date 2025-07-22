import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import type { Node, Edge, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";

interface WorkflowData {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: { label: string };
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

interface FlowCardProps {
  title: string;
  description: string;
  workflowData: WorkflowData;
  height?: string;
  className?: string;
}

const FlowEditor: React.FC<{ workflowData: WorkflowData; height: string }> = ({
  workflowData,
  height,
}) => {
  // Load nodes and edges from the provided workflow data
  const initialNodes: Node[] = useMemo(() => {
    return workflowData.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      ...(node.parentNode && { parentNode: node.parentNode }),
      ...(node.extent && { extent: node.extent as "parent" }),
      style: {
        background: "#121212",
        border: node.parentNode ? "2px solid #0ea5e9" : "2px solid #6366f1",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "12px",
        width: "220px",
        color: "#ffffff",
        fontWeight: "500",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      },
    }));
  }, [workflowData]);

  const initialEdges: Edge[] = useMemo(() => {
    return workflowData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      animated: edge.animated ?? true,
      label: edge.label,
      style: {
        stroke: "#6366f1",
        strokeWidth: 2,
      },
    }));
  }, [workflowData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
  const nodeIdRef = useRef(1000);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "editEdge">(
    "add"
  );
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [currentEdgeId, setCurrentEdgeId] = useState<string | null>(null);
  const [nodeName, setNodeName] = useState("");
  const [edgeLabel, setEdgeLabel] = useState("");
  const [edgeType, setEdgeType] = useState<
    "default" | "straight" | "step" | "smoothstep"
  >("default");
  const [edgeAnimated, setEdgeAnimated] = useState(true);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: {
              stroke: "#6366f1",
              strokeWidth: 2,
            },
          },
          eds
        )
      ),
    [setEdges]
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
      setDialogOpen(false);
    },
    [setEdges]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      // Also remove any edges connected to this node
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      setDialogOpen(false);
    },
    [setNodes, setEdges]
  );

  const openAddNodeDialog = useCallback(() => {
    setDialogMode("add");
    setNodeName("");
    setCurrentNodeId(null);
    setDialogOpen(true);
  }, []);

  const openEditNodeDialog = useCallback((node: Node) => {
    setDialogMode("edit");
    setNodeName(String(node.data.label));
    setCurrentNodeId(node.id);
    setDialogOpen(true);
  }, []);

  const openEditEdgeDialog = useCallback((edge: Edge) => {
    setDialogMode("editEdge");
    setEdgeLabel(edge.label ? String(edge.label) : "");
    setEdgeType(
      (edge.type as "default" | "straight" | "step" | "smoothstep") || "default"
    );
    setEdgeAnimated(edge.animated ?? true);
    setCurrentEdgeId(edge.id);
    setDialogOpen(true);
  }, []);

  const handleDialogSubmit = useCallback(() => {
    if (dialogMode === "editEdge") {
      if (!currentEdgeId) return;

      setEdges((eds) =>
        eds.map((e) =>
          e.id === currentEdgeId
            ? {
                ...e,
                label: edgeLabel || undefined,
                type: edgeType,
                animated: edgeAnimated,
                style: {
                  ...e.style,
                  stroke:
                    edgeType === "step"
                      ? "#10b981"
                      : edgeType === "straight"
                      ? "#f59e0b"
                      : edgeType === "smoothstep"
                      ? "#8b5cf6"
                      : "#6366f1",
                },
              }
            : e
        )
      );
    } else {
      if (!nodeName.trim()) return;

      if (dialogMode === "add") {
        const newNode: Node = {
          id: `node-${nodeIdRef.current++}`,
          type: "default",
          position: screenToFlowPosition({ x: 100, y: 100 }),
          data: { label: nodeName },
          style: {
            background: "#121212",
            border: "2px solid #6366f1",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "12px",
            width: "220px",
            color: "#ffffff",
            fontWeight: "500",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          },
        };
        setNodes((nds) => [...nds, newNode]);
      } else if (dialogMode === "edit" && currentNodeId) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === currentNodeId
              ? { ...n, data: { ...n.data, label: nodeName } }
              : n
          )
        );
      }
    }

    setDialogOpen(false);
    setNodeName("");
    setEdgeLabel("");
    setEdgeAnimated(true);
    setCurrentNodeId(null);
    setCurrentEdgeId(null);
  }, [
    dialogMode,
    nodeName,
    edgeLabel,
    edgeType,
    edgeAnimated,
    currentNodeId,
    currentEdgeId,
    screenToFlowPosition,
    setNodes,
    setEdges,
  ]);

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation();
      openEditNodeDialog(node);
    },
    [openEditNodeDialog]
  );

  const onEdgeDoubleClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      event.stopPropagation();
      openEditEdgeDialog(edge);
    },
    [openEditEdgeDialog]
  );

  const onEdgesDelete = useCallback(
    (edges: Edge[]) => {
      setEdges((eds) =>
        eds.filter((edge) => !edges.some((e) => e.id === edge.id))
      );
    },
    [setEdges]
  );

  const onNodesDelete = useCallback(
    (nodes: Node[]) => {
      const nodeIds = nodes.map((n) => n.id);
      setNodes((nds) => nds.filter((node) => !nodeIds.includes(node.id)));
      // Also remove any edges connected to these nodes
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
        )
      );
    },
    [setNodes, setEdges]
  );

  return (
    <>
      <div className={`w-full ${height}`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          nodesDraggable={true}
          fitView
          fitViewOptions={{
            padding: 0.1,
          }}
        >
          <Background />
          <Panel position="top-right" className="space-x-2">
            <Button onClick={openAddNodeDialog} size="sm">
              Add Node
            </Button>
          </Panel>
        </ReactFlow>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Add New Node"
                : dialogMode === "edit"
                ? "Edit Node"
                : "Edit Edge"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Enter a name for the new node."
                : dialogMode === "edit"
                ? "Update the node name."
                : "Customize the edge properties."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {dialogMode !== "editEdge" ? (
              <Input
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                placeholder="Node name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleDialogSubmit();
                  }
                }}
              />
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Edge Label (optional)
                  </label>
                  <Input
                    value={edgeLabel}
                    onChange={(e) => setEdgeLabel(e.target.value)}
                    placeholder="Edge label..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleDialogSubmit();
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Edge Type</label>
                  <Select
                    value={edgeType}
                    onValueChange={(value) =>
                      setEdgeType(
                        value as "default" | "straight" | "step" | "smoothstep"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (Bezier)</SelectItem>
                      <SelectItem value="straight">Straight</SelectItem>
                      <SelectItem value="step">Step</SelectItem>
                      <SelectItem value="smoothstep">Smooth Step</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="animated"
                    checked={edgeAnimated}
                    onCheckedChange={(checked) =>
                      setEdgeAnimated(checked === true)
                    }
                  />
                  <label
                    htmlFor="animated"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Animated (moving dots)
                  </label>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {dialogMode === "editEdge" && currentEdgeId && (
                <Button
                  variant="destructive"
                  onClick={() => deleteEdge(currentEdgeId)}
                >
                  Delete Edge
                </Button>
              )}
              {dialogMode === "edit" && currentNodeId && (
                <Button
                  variant="destructive"
                  onClick={() => deleteNode(currentNodeId)}
                >
                  Delete Node
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDialogSubmit}
                disabled={dialogMode !== "editEdge" && !nodeName.trim()}
              >
                {dialogMode === "add"
                  ? "Add Node"
                  : dialogMode === "edit"
                  ? "Update Node"
                  : "Update Edge"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const FlowCard: React.FC<FlowCardProps> = ({
  title,
  description,
  workflowData,
  height = "h-[600px]",
  className = "",
}) => {
  return (
    <div
      className={`bg-card rounded-lg border border-border shadow-lg overflow-hidden ${className}`}
    >
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            • Drag nodes to rearrange • Double-click nodes to edit/delete •
            Double-click edges to edit/delete • Select nodes/edges and press
            Delete key • Drag from node handles to create connections
          </p>
        </div>
      </div>
      <ReactFlowProvider>
        <FlowEditor workflowData={workflowData} height={height} />
      </ReactFlowProvider>
    </div>
  );
};

export default FlowCard;
export type { WorkflowData, FlowCardProps };
