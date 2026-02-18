"use client";

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Play } from "lucide-react";
import type { WorkflowNodeData } from "@/lib/stores/workflow-canvas-store";

type ActionNode = Node<WorkflowNodeData, "action">;

export function ActionNode({ data, selected }: NodeProps<ActionNode>) {
  return (
    <div
      className={`rounded-xl border-2 bg-white px-4 py-3 shadow-sm transition-all ${
        selected ? "border-blue-400 shadow-md" : "border-blue-200"
      }`}
      style={{ minWidth: 180 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-blue-400 !bg-white"
      />
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
          <Play className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-blue-500">Action</p>
          <p className="text-sm font-medium text-gray-900">{data.label}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-blue-400 !bg-white"
      />
    </div>
  );
}
