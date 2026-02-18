import { create } from "zustand";
import type { Node, Edge, OnNodesChange, OnEdgesChange, Connection } from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";

export interface WorkflowNodeData {
  label: string;
  nodeType: "TRIGGER" | "CONDITION" | "ACTION" | "DELAY";
  config: Record<string, unknown>;
  [key: string]: unknown;
}

interface HistoryEntry {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

interface WorkflowCanvasState {
  workflowId: string | null;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  history: HistoryEntry[];
  historyIndex: number;

  setWorkflow: (id: string, nodes: Node<WorkflowNodeData>[], edges: Edge[]) => void;
  onNodesChange: OnNodesChange<Node<WorkflowNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<WorkflowNodeData>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;
  undo: () => void;
  redo: () => void;
  markClean: () => void;
  reset: () => void;
}

function pushHistory(
  state: Pick<WorkflowCanvasState, "nodes" | "edges" | "history" | "historyIndex">,
) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push({ nodes: [...state.nodes], edges: [...state.edges] });
  // Keep max 50 entries
  if (newHistory.length > 50) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

export const useWorkflowCanvasStore = create<WorkflowCanvasState>((set, get) => ({
  workflowId: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  history: [],
  historyIndex: -1,

  setWorkflow: (id, nodes, edges) =>
    set({
      workflowId: id,
      nodes,
      edges,
      isDirty: false,
      selectedNodeId: null,
      history: [{ nodes: [...nodes], edges: [...edges] }],
      historyIndex: 0,
    }),

  onNodesChange: (changes) => {
    const { nodes } = get();
    const updated = applyNodeChanges(changes, nodes);
    set((state) => ({
      nodes: updated as Node<WorkflowNodeData>[],
      isDirty: true,
      ...pushHistory({ ...state, nodes: updated as Node<WorkflowNodeData>[] }),
    }));
  },

  onEdgesChange: (changes) => {
    const { edges } = get();
    const updated = applyEdgeChanges(changes, edges);
    set((state) => ({
      edges: updated,
      isDirty: true,
      ...pushHistory({ ...state, edges: updated }),
    }));
  },

  onConnect: (connection) => {
    const { edges } = get();
    const updated = addEdge(connection, edges);
    set((state) => ({
      edges: updated,
      isDirty: true,
      ...pushHistory({ ...state, edges: updated }),
    }));
  },

  addNode: (node) =>
    set((state) => {
      const nodes = [...state.nodes, node];
      return {
        nodes,
        isDirty: true,
        ...pushHistory({ ...state, nodes }),
      };
    }),

  removeNode: (id) =>
    set((state) => {
      const nodes = state.nodes.filter((n) => n.id !== id);
      const edges = state.edges.filter((e) => e.source !== id && e.target !== id);
      return {
        nodes,
        edges,
        isDirty: true,
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        ...pushHistory({ ...state, nodes, edges }),
      };
    }),

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) =>
    set((state) => {
      const nodes = state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      );
      return {
        nodes,
        isDirty: true,
        ...pushHistory({ ...state, nodes }),
      };
    }),

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    if (!prev) return;
    set({
      nodes: [...prev.nodes],
      edges: [...prev.edges],
      historyIndex: historyIndex - 1,
      isDirty: true,
    });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    if (!next) return;
    set({
      nodes: [...next.nodes],
      edges: [...next.edges],
      historyIndex: historyIndex + 1,
      isDirty: true,
    });
  },

  markClean: () => set({ isDirty: false }),

  reset: () =>
    set({
      workflowId: null,
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isDirty: false,
      history: [],
      historyIndex: -1,
    }),
}));
