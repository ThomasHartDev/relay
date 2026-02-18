import { describe, it, expect, beforeEach } from "vitest";
import { useWorkflowCanvasStore } from "./workflow-canvas-store";
import type { WorkflowNodeData } from "./workflow-canvas-store";
import type { Node, Edge } from "@xyflow/react";

function makeNode(overrides: Partial<Node<WorkflowNodeData>> = {}): Node<WorkflowNodeData> {
  const id = overrides.id ?? `node-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    position: { x: 0, y: 0 },
    data: {
      label: "Test Node",
      nodeType: "ACTION",
      config: {},
    },
    ...overrides,
  };
}

function makeEdge(overrides: Partial<Edge> = {}): Edge {
  return {
    id: overrides.id ?? `edge-${Math.random().toString(36).slice(2, 8)}`,
    source: "node-a",
    target: "node-b",
    ...overrides,
  };
}

describe("workflow-canvas-store", () => {
  beforeEach(() => {
    useWorkflowCanvasStore.getState().reset();
  });

  it("initializes with empty state", () => {
    const state = useWorkflowCanvasStore.getState();
    expect(state.workflowId).toBeNull();
    expect(state.nodes).toHaveLength(0);
    expect(state.edges).toHaveLength(0);
    expect(state.selectedNodeId).toBeNull();
    expect(state.isDirty).toBe(false);
    expect(state.historyIndex).toBe(-1);
  });

  it("setWorkflow loads nodes and edges", () => {
    const nodes = [makeNode({ id: "n1" }), makeNode({ id: "n2" })];
    const edges = [makeEdge({ id: "e1", source: "n1", target: "n2" })];

    useWorkflowCanvasStore.getState().setWorkflow("wf-1", nodes, edges);

    const state = useWorkflowCanvasStore.getState();
    expect(state.workflowId).toBe("wf-1");
    expect(state.nodes).toHaveLength(2);
    expect(state.edges).toHaveLength(1);
    expect(state.isDirty).toBe(false);
    expect(state.selectedNodeId).toBeNull();
    expect(state.historyIndex).toBe(0);
    expect(state.history).toHaveLength(1);
  });

  it("addNode appends to nodes and marks dirty", () => {
    useWorkflowCanvasStore.getState().setWorkflow("wf-1", [], []);
    useWorkflowCanvasStore.getState().addNode(makeNode({ id: "n1" }));

    const state = useWorkflowCanvasStore.getState();
    expect(state.nodes).toHaveLength(1);
    expect(state.nodes[0]?.id).toBe("n1");
    expect(state.isDirty).toBe(true);
  });

  it("removeNode filters nodes and connected edges", () => {
    const nodes = [makeNode({ id: "n1" }), makeNode({ id: "n2" }), makeNode({ id: "n3" })];
    const edges = [
      makeEdge({ id: "e1", source: "n1", target: "n2" }),
      makeEdge({ id: "e2", source: "n2", target: "n3" }),
    ];

    useWorkflowCanvasStore.getState().setWorkflow("wf-1", nodes, edges);
    useWorkflowCanvasStore.getState().removeNode("n2");

    const state = useWorkflowCanvasStore.getState();
    expect(state.nodes).toHaveLength(2);
    expect(state.nodes.map((n) => n.id)).toEqual(["n1", "n3"]);
    expect(state.edges).toHaveLength(0);
    expect(state.isDirty).toBe(true);
  });

  it("removeNode clears selection if removing selected node", () => {
    useWorkflowCanvasStore.getState().setWorkflow("wf-1", [makeNode({ id: "n1" })], []);
    useWorkflowCanvasStore.getState().selectNode("n1");
    useWorkflowCanvasStore.getState().removeNode("n1");

    expect(useWorkflowCanvasStore.getState().selectedNodeId).toBeNull();
  });

  it("removeNode keeps selection if removing different node", () => {
    const nodes = [makeNode({ id: "n1" }), makeNode({ id: "n2" })];
    useWorkflowCanvasStore.getState().setWorkflow("wf-1", nodes, []);
    useWorkflowCanvasStore.getState().selectNode("n1");
    useWorkflowCanvasStore.getState().removeNode("n2");

    expect(useWorkflowCanvasStore.getState().selectedNodeId).toBe("n1");
  });

  it("selectNode updates selectedNodeId", () => {
    useWorkflowCanvasStore.getState().selectNode("n1");
    expect(useWorkflowCanvasStore.getState().selectedNodeId).toBe("n1");

    useWorkflowCanvasStore.getState().selectNode(null);
    expect(useWorkflowCanvasStore.getState().selectedNodeId).toBeNull();
  });

  it("updateNodeData merges partial data", () => {
    const node = makeNode({
      id: "n1",
      data: { label: "Old Label", nodeType: "TRIGGER", config: { key: "val" } },
    });
    useWorkflowCanvasStore.getState().setWorkflow("wf-1", [node], []);
    useWorkflowCanvasStore.getState().updateNodeData("n1", { label: "New Label" });

    const updated = useWorkflowCanvasStore.getState().nodes[0];
    expect(updated?.data.label).toBe("New Label");
    expect(updated?.data.nodeType).toBe("TRIGGER");
    expect(updated?.data.config).toEqual({ key: "val" });
    expect(useWorkflowCanvasStore.getState().isDirty).toBe(true);
  });

  it("undo restores previous state", () => {
    useWorkflowCanvasStore.getState().setWorkflow("wf-1", [], []);
    useWorkflowCanvasStore.getState().addNode(makeNode({ id: "n1" }));
    useWorkflowCanvasStore.getState().addNode(makeNode({ id: "n2" }));

    expect(useWorkflowCanvasStore.getState().nodes).toHaveLength(2);

    useWorkflowCanvasStore.getState().undo();
    expect(useWorkflowCanvasStore.getState().nodes).toHaveLength(1);
    expect(useWorkflowCanvasStore.getState().nodes[0]?.id).toBe("n1");
  });

  it("redo re-applies undone state", () => {
    useWorkflowCanvasStore.getState().setWorkflow("wf-1", [], []);
    useWorkflowCanvasStore.getState().addNode(makeNode({ id: "n1" }));
    useWorkflowCanvasStore.getState().addNode(makeNode({ id: "n2" }));

    useWorkflowCanvasStore.getState().undo();
    expect(useWorkflowCanvasStore.getState().nodes).toHaveLength(1);

    useWorkflowCanvasStore.getState().redo();
    expect(useWorkflowCanvasStore.getState().nodes).toHaveLength(2);
  });

  it("undo does nothing at beginning of history", () => {
    useWorkflowCanvasStore.getState().setWorkflow("wf-1", [], []);
    const before = useWorkflowCanvasStore.getState().historyIndex;

    useWorkflowCanvasStore.getState().undo();
    expect(useWorkflowCanvasStore.getState().historyIndex).toBe(before);
  });

  it("redo does nothing at end of history", () => {
    useWorkflowCanvasStore.getState().setWorkflow("wf-1", [], []);
    useWorkflowCanvasStore.getState().addNode(makeNode({ id: "n1" }));
    const before = useWorkflowCanvasStore.getState().historyIndex;

    useWorkflowCanvasStore.getState().redo();
    expect(useWorkflowCanvasStore.getState().historyIndex).toBe(before);
  });

  it("new action after undo truncates future history", () => {
    useWorkflowCanvasStore.getState().setWorkflow("wf-1", [], []);
    useWorkflowCanvasStore.getState().addNode(makeNode({ id: "n1" }));
    useWorkflowCanvasStore.getState().addNode(makeNode({ id: "n2" }));
    useWorkflowCanvasStore.getState().addNode(makeNode({ id: "n3" }));

    // Undo twice to go back to just n1
    useWorkflowCanvasStore.getState().undo();
    useWorkflowCanvasStore.getState().undo();
    expect(useWorkflowCanvasStore.getState().nodes).toHaveLength(1);

    // New action should fork history
    useWorkflowCanvasStore.getState().addNode(makeNode({ id: "n4" }));
    expect(useWorkflowCanvasStore.getState().nodes).toHaveLength(2);

    // Redo should have nothing — future was truncated
    const idx = useWorkflowCanvasStore.getState().historyIndex;
    useWorkflowCanvasStore.getState().redo();
    expect(useWorkflowCanvasStore.getState().historyIndex).toBe(idx);
  });

  it("markClean resets isDirty", () => {
    useWorkflowCanvasStore.getState().setWorkflow("wf-1", [], []);
    useWorkflowCanvasStore.getState().addNode(makeNode());
    expect(useWorkflowCanvasStore.getState().isDirty).toBe(true);

    useWorkflowCanvasStore.getState().markClean();
    expect(useWorkflowCanvasStore.getState().isDirty).toBe(false);
  });

  it("reset clears all state", () => {
    useWorkflowCanvasStore.getState().setWorkflow("wf-1", [makeNode()], [makeEdge()]);
    useWorkflowCanvasStore.getState().selectNode("n1");

    useWorkflowCanvasStore.getState().reset();
    const state = useWorkflowCanvasStore.getState();
    expect(state.workflowId).toBeNull();
    expect(state.nodes).toHaveLength(0);
    expect(state.edges).toHaveLength(0);
    expect(state.selectedNodeId).toBeNull();
    expect(state.isDirty).toBe(false);
    expect(state.history).toHaveLength(0);
    expect(state.historyIndex).toBe(-1);
  });
});
