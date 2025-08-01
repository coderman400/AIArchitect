import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

// Import your SVG icons
import GoogleSheetsIcon from "../../assets/google-sheets-icon.svg";
import GoogleCalendarIcon from "../../assets/google-calendar-icon.svg";
import ChatGPTIcon from "../../assets/chatgpt-icon.svg";
import ClaudeIcon from "../../assets/claude-ai-icon.svg";
import WebhookIcon from "../../assets/webhook.svg";
import NotionIcon from "../../assets/notion-icon.svg";
import HubspotIcon from "../../assets/hubspot-icon.svg";
import SlackIcon from "../../assets/slack-icon.svg";
import StripeIcon from "../../assets/stripe-icon.svg";
import GmailIcon from "../../assets/gmail-icon.svg";
import ToolsIcon from "../../assets/tools-icon.svg";
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

interface CustomNodeData {
  label: string;
  nodeType: NodeType;
  description?: string;
}

// Icon mapping
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

// Color mapping for different node types
const nodeColors: Record<NodeType, string> = {
  googleSheets: "#0F9D58",
  googleCalendar: "#4285F4",
  chatgpt: "#00A67E",
  claude: "#CC785C",
  default: "#6366f1",
  webhook: "#00A67E",
  notion: "#CC785C",
  hubspot: "#6366f1",
  slack: "#00A67E",
  stripe: "#6366f1",
  gmail: "#CC785C",
  tools: "#00A67E",
};

const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as CustomNodeData;
  const IconComponent = iconMap[nodeData.nodeType];
  const nodeColor = nodeColors[nodeData.nodeType];
  const [showModal, setShowModal] = useState(false);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent React Flow's default double-click behavior
    setShowModal(true);
  };

  // If there's an icon, render the modern card with icon and label
  if (IconComponent) {
    return (
      <>
        <div
          className={`modern-node-card ${selected ? "selected" : ""}`}
          style={{
            position: "relative",
            background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
            border: selected ? `2px solid ${nodeColor}` : "1px solid #374151",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "160px",
            boxShadow: selected
              ? `0 4px 20px rgba(99, 102, 241, 0.3)`
              : "0 2px 8px rgba(0, 0, 0, 0.4)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            backdropFilter: "blur(10px)",
          }}
          onDoubleClick={handleDoubleClick}
        >
          {/* Input Handle */}
          <Handle
            type="target"
            position={Position.Top}
            style={{
              background: nodeColor,
              width: "8px",
              height: "8px",
              border: "1px solid white",
              top: "-4px",
            }}
          />

          {/* Icon */}
          {nodeData.nodeType === "tools" || nodeData.nodeType === "default" ? (
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src={IconComponent}
                alt={nodeData.nodeType}
                style={{
                  width: "24px",
                  height: "24px",
                  display: "block",
                }}
              />
            </div>
          ) : (
            <img
              src={IconComponent}
              alt={nodeData.nodeType}
              style={{
                width: "40px",
                height: "40px",
                display: "block",
                flexShrink: 0,
              }}
            />
          )}

          {/* Label */}
          <div
            style={{
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "-0.02em",
              lineHeight: "1.2",
            }}
          >
            {nodeData.label}
          </div>

          {/* Output Handle */}
          <Handle
            type="source"
            position={Position.Bottom}
            style={{
              background: nodeColor,
              width: "8px",
              height: "8px",
              border: "1px solid white",
              bottom: "-4px",
            }}
          />
        </div>

        {/* Shadcn Dialog for showing node details */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{nodeData.nodeType}</DialogTitle>
            </DialogHeader>
            <div>
              {nodeData.description && (
                <p className="text-muted-foreground">{nodeData.description}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Fallback: render the traditional box node for nodes without icons
  return (
    <div
      className={`custom-node ${selected ? "selected" : ""}`}
      style={{
        background: "#121212",
        border: "2px solid #6366f1",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "12px",
        width: "220px",
        color: "#ffffff",
        fontWeight: "500",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease",
      }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: nodeColor,
          width: "12px",
          height: "12px",
          border: "2px solid white",
        }}
      />

      {/* Node Content for non-icon nodes */}
      <div
        style={{
          fontWeight: "600",
          fontSize: "14px",
          color: "#ffffff",
        }}
      >
        {nodeData.label}
      </div>

      {/* Node Description */}
      {nodeData.description && (
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginTop: "4px",
          }}
        >
          {nodeData.description}
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: nodeColor,
          width: "12px",
          height: "12px",
          border: "2px solid white",
        }}
      />
    </div>
  );
};

export default CustomNode;
