"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowStatusBadge } from "@/components/workflows/workflow-status-badge";
import { WorkflowCanvas } from "@/components/workflows/workflow-canvas";
import { NodePalette } from "@/components/workflows/node-palette";
import { NodeConfigPanel } from "@/components/workflows/node-config-panel";
import { useWorkflowCanvasStore, type WorkflowNodeData } from "@/lib/stores/workflow-canvas-store";
import type { WorkflowStatus, WorkflowTriggerType } from "@relay/shared";
import type { Node, Edge } from "@xyflow/react";

interface WorkflowDetail {
  id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  triggerType: WorkflowTriggerType | null;
  createdAt: string;
  updatedAt: string;
  nodes: {
    id: string;
    type: string;
    label: string;
    config: Record<string, unknown>;
    positionX: number;
    positionY: number;
  }[];
  edges: {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    label: string | null;
  }[];
  _count: { executions: number };
}

function toFlowNodes(dbNodes: WorkflowDetail["nodes"]): Node<WorkflowNodeData>[] {
  return dbNodes.map((n) => ({
    id: n.id,
    type: n.type.toLowerCase(),
    position: { x: n.positionX, y: n.positionY },
    data: {
      label: n.label,
      nodeType: n.type as WorkflowNodeData["nodeType"],
      config: n.config,
    },
  }));
}

function toFlowEdges(dbEdges: WorkflowDetail["edges"]): Edge[] {
  return dbEdges.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    label: e.label ?? undefined,
    animated: true,
    style: { strokeWidth: 2, stroke: "#94A3B8" },
  }));
}

export default function WorkflowDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    nodes,
    edges,
    selectedNodeId,
    isDirty,
    historyIndex,
    history,
    setWorkflow: setCanvasWorkflow,
    undo,
    redo,
    markClean,
    reset,
  } = useWorkflowCanvasStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const fetchWorkflow = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workflows/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        const wf = json.data as WorkflowDetail;
        setWorkflow(wf);
        setCanvasWorkflow(wf.id, toFlowNodes(wf.nodes), toFlowEdges(wf.edges));
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.id, setCanvasWorkflow]);

  useEffect(() => {
    void fetchWorkflow();
    return () => reset();
  }, [fetchWorkflow, reset]);

  async function handleSave() {
    if (!workflow) return;
    setIsSaving(true);

    try {
      // Save nodes: delete all existing, recreate from canvas state
      // Simpler than diffing — reliable for canvas editors
      const existingNodeIds = new Set(workflow.nodes.map((n) => n.id));
      const existingEdgeIds = new Set(workflow.edges.map((e) => e.id));
      const currentNodeIds = new Set(nodes.map((n) => n.id));
      const currentEdgeIds = new Set(edges.map((e) => e.id));

      // Delete removed nodes
      for (const dbNode of workflow.nodes) {
        if (!currentNodeIds.has(dbNode.id)) {
          await fetch(`/api/workflows/${workflow.id}/nodes/${dbNode.id}`, {
            method: "DELETE",
          });
        }
      }

      // Create or update nodes
      for (const node of nodes) {
        const payload = {
          type: node.data.nodeType,
          label: node.data.label,
          config: node.data.config,
          positionX: node.position.x,
          positionY: node.position.y,
        };

        if (existingNodeIds.has(node.id)) {
          await fetch(`/api/workflows/${workflow.id}/nodes/${node.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          await fetch(`/api/workflows/${workflow.id}/nodes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      }

      // Delete removed edges
      for (const dbEdge of workflow.edges) {
        if (!currentEdgeIds.has(dbEdge.id)) {
          await fetch(`/api/workflows/${workflow.id}/edges/${dbEdge.id}`, {
            method: "DELETE",
          });
        }
      }

      // Create new edges
      for (const edge of edges) {
        if (!existingEdgeIds.has(edge.id)) {
          await fetch(`/api/workflows/${workflow.id}/edges`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sourceNodeId: edge.source,
              targetNodeId: edge.target,
              label: edge.label ?? null,
            }),
          });
        }
      }

      markClean();
      await fetchWorkflow();
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Workflow not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/workflows")}>
          Back to Workflows
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-3">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => router.push("/workflows")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{workflow.name}</h2>
              <WorkflowStatusBadge status={workflow.status} />
            </div>
            <p className="text-xs text-gray-400">
              {nodes.length} node{nodes.length !== 1 ? "s" : ""} &middot; {edges.length} connection
              {edges.length !== 1 ? "s" : ""} &middot; {workflow._count.executions} run
              {workflow._count.executions !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={historyIndex <= 0}
            onClick={undo}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={historyIndex >= history.length - 1}
            onClick={redo}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
          <Button onClick={handleSave} disabled={!isDirty || isSaving} isLoading={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex min-h-0 flex-1 gap-3">
        {/* Left: Node palette */}
        <div className="w-52 shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3">
          <NodePalette />
        </div>

        {/* Center: Canvas */}
        <div className="min-w-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <WorkflowCanvas />
        </div>

        {/* Right: Config panel */}
        <div className="w-64 shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
          {selectedNode ? (
            <NodeConfigPanel node={selectedNode} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-sm text-gray-400">Select a node to configure it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
