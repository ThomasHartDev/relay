"use client";

import { Zap, Play, GitBranch, Clock } from "lucide-react";
import { useWorkflowCanvasStore, type WorkflowNodeData } from "@/lib/stores/workflow-canvas-store";
import type { Node } from "@xyflow/react";

const NODE_PALETTE = [
  {
    type: "TRIGGER" as const,
    flowType: "trigger",
    label: "Trigger",
    description: "Starts the workflow",
    icon: Zap,
    color: "emerald",
    bgClass: "bg-emerald-50 hover:bg-emerald-100",
    iconClass: "text-emerald-600",
    borderClass: "border-emerald-200",
  },
  {
    type: "ACTION" as const,
    flowType: "action",
    label: "Action",
    description: "Performs an operation",
    icon: Play,
    color: "blue",
    bgClass: "bg-blue-50 hover:bg-blue-100",
    iconClass: "text-blue-600",
    borderClass: "border-blue-200",
  },
  {
    type: "CONDITION" as const,
    flowType: "condition",
    label: "Condition",
    description: "Branches the flow",
    icon: GitBranch,
    color: "amber",
    bgClass: "bg-amber-50 hover:bg-amber-100",
    iconClass: "text-amber-600",
    borderClass: "border-amber-200",
  },
  {
    type: "DELAY" as const,
    flowType: "delay",
    label: "Delay",
    description: "Waits before continuing",
    icon: Clock,
    color: "gray",
    bgClass: "bg-gray-50 hover:bg-gray-100",
    iconClass: "text-gray-600",
    borderClass: "border-gray-200",
  },
] as const;

export function NodePalette() {
  const { nodes, addNode } = useWorkflowCanvasStore();

  function handleAddNode(item: (typeof NODE_PALETTE)[number]) {
    const id = `node-${Date.now()}`;
    // Offset each new node vertically to avoid stacking
    const yOffset = nodes.length * 120;
    const newNode: Node<WorkflowNodeData> = {
      id,
      type: item.flowType,
      position: { x: 250, y: 80 + yOffset },
      data: {
        label: `New ${item.label}`,
        nodeType: item.type,
        config: {},
      },
    };
    addNode(newNode);
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Add Nodes</h3>
      <div className="space-y-1.5">
        {NODE_PALETTE.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors ${item.bgClass} ${item.borderClass}`}
              onClick={() => handleAddNode(item)}
            >
              <Icon className={`h-4 w-4 ${item.iconClass}`} />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-[10px] text-gray-500">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
