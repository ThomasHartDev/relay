"use client";

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Zap } from "lucide-react";
import type { WorkflowNodeData } from "@/lib/stores/workflow-canvas-store";

type TriggerNode = Node<WorkflowNodeData, "trigger">;

export function TriggerNode({ data, selected }: NodeProps<TriggerNode>) {
  return (
    <div
      className={`rounded-xl border-2 bg-white px-4 py-3 shadow-sm transition-all ${
        selected ? "border-emerald-400 shadow-md" : "border-emerald-200"
      }`}
      style={{ minWidth: 180 }}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
          <Zap className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-500">
            Trigger
          </p>
          <p className="text-sm font-medium text-gray-900">{data.label}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-emerald-400 !bg-white"
      />
    </div>
  );
}
