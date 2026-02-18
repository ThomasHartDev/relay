"use client";

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Clock } from "lucide-react";
import type { WorkflowNodeData } from "@/lib/stores/workflow-canvas-store";

type DelayNode = Node<WorkflowNodeData, "delay">;

export function DelayNode({ data, selected }: NodeProps<DelayNode>) {
  return (
    <div
      className={`rounded-xl border-2 bg-white px-4 py-3 shadow-sm transition-all ${
        selected ? "border-gray-400 shadow-md" : "border-gray-200"
      }`}
      style={{ minWidth: 180 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-gray-400 !bg-white"
      />
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
          <Clock className="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Delay</p>
          <p className="text-sm font-medium text-gray-900">{data.label}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-gray-400 !bg-white"
      />
    </div>
  );
}
