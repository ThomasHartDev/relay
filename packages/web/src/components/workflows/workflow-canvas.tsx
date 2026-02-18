"use client";

import { useCallback } from "react";
import { ReactFlow, Background, Controls, MiniMap, type NodeTypes, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowCanvasStore, type WorkflowNodeData } from "@/lib/stores/workflow-canvas-store";
import { TriggerNode } from "./nodes/trigger-node";
import { ActionNode } from "./nodes/action-node";
import { ConditionNode } from "./nodes/condition-node";
import { DelayNode } from "./nodes/delay-node";

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

export function WorkflowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode } =
    useWorkflowCanvasStore();

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<WorkflowNodeData>) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2, stroke: "#94A3B8" },
        }}
      >
        <Background gap={20} size={1} color="#E2E8F0" />
        <Controls className="!rounded-lg !border !border-gray-200 !shadow-sm" />
        <MiniMap
          className="!rounded-lg !border !border-gray-200 !shadow-sm"
          maskColor="rgba(0,0,0,0.08)"
          nodeColor={(node) => {
            const data = node.data as WorkflowNodeData;
            switch (data.nodeType) {
              case "TRIGGER":
                return "#22C55E";
              case "ACTION":
                return "#3B82F6";
              case "CONDITION":
                return "#F59E0B";
              case "DELAY":
                return "#6B7280";
              default:
                return "#94A3B8";
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}
