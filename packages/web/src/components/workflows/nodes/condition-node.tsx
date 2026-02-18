"use client";

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import type { WorkflowNodeData } from "@/lib/stores/workflow-canvas-store";

type ConditionNode = Node<WorkflowNodeData, "condition">;

export function ConditionNode({ data, selected }: NodeProps<ConditionNode>) {
  return (
    <div
      className={`rounded-xl border-2 bg-white px-4 py-3 shadow-sm transition-all ${
        selected ? "border-amber-400 shadow-md" : "border-amber-200"
      }`}
      style={{ minWidth: 180 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-amber-400 !bg-white"
      />
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
          <GitBranch className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-amber-500">
            Condition
          </p>
          <p className="text-sm font-medium text-gray-900">{data.label}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        className="!-bottom-1.5 !left-1/3 !h-3 !w-3 !border-2 !border-emerald-400 !bg-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="!-bottom-1.5 !left-2/3 !h-3 !w-3 !border-2 !border-red-400 !bg-white"
      />
    </div>
  );
}
