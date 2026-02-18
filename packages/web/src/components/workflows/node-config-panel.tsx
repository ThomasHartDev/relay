"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useWorkflowCanvasStore, type WorkflowNodeData } from "@/lib/stores/workflow-canvas-store";
import type { Node } from "@xyflow/react";

const NODE_TYPE_LABELS = {
  TRIGGER: "Trigger",
  CONDITION: "Condition",
  ACTION: "Action",
  DELAY: "Delay",
} as const;

const NODE_TYPE_COLORS = {
  TRIGGER: "text-emerald-600",
  CONDITION: "text-amber-600",
  ACTION: "text-blue-600",
  DELAY: "text-gray-600",
} as const;

interface NodeConfigPanelProps {
  node: Node<WorkflowNodeData>;
}

export function NodeConfigPanel({ node }: NodeConfigPanelProps) {
  const { updateNodeData, removeNode } = useWorkflowCanvasStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-xs font-medium uppercase tracking-wider ${NODE_TYPE_COLORS[node.data.nodeType]}`}
          >
            {NODE_TYPE_LABELS[node.data.nodeType]}
          </p>
          <p className="text-sm font-semibold text-gray-900">{node.data.label}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
          onClick={() => removeNode(node.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Label</label>
        <Input
          value={node.data.label}
          onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
        />
      </div>

      {node.data.nodeType === "DELAY" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Delay (hours)</label>
          <Input
            type="number"
            min={1}
            value={String((node.data.config.delayHours as number) ?? 24)}
            onChange={(e) =>
              updateNodeData(node.id, {
                config: { ...node.data.config, delayHours: Number(e.target.value) },
              })
            }
          />
        </div>
      )}

      {node.data.nodeType === "CONDITION" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Condition field</label>
          <Input
            placeholder="e.g., contact.status"
            value={String((node.data.config.field as string) ?? "")}
            onChange={(e) =>
              updateNodeData(node.id, {
                config: { ...node.data.config, field: e.target.value },
              })
            }
          />
        </div>
      )}

      {node.data.nodeType === "ACTION" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Action description</label>
          <Input
            placeholder="e.g., Send welcome email"
            value={String((node.data.config.description as string) ?? "")}
            onChange={(e) =>
              updateNodeData(node.id, {
                config: { ...node.data.config, description: e.target.value },
              })
            }
          />
        </div>
      )}

      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Node ID</p>
        <p className="mt-0.5 font-mono text-xs text-gray-500">{node.id}</p>
      </div>
    </div>
  );
}
