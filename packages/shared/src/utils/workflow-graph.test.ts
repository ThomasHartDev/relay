import { describe, it, expect } from "vitest";
import {
  validateWorkflowGraph,
  topologicalSort,
  getOutgoingEdges,
  type GraphNode,
  type GraphEdge,
} from "./workflow-graph";

function node(id: string, type: string): GraphNode {
  return { id, type };
}

function edge(
  id: string,
  sourceNodeId: string,
  targetNodeId: string,
  label: string | null = null,
): GraphEdge {
  return { id, sourceNodeId, targetNodeId, label };
}

describe("validateWorkflowGraph", () => {
  it("returns error for empty graph", () => {
    const result = validateWorkflowGraph([], []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Workflow must have at least one node");
  });

  it("returns error when no trigger node", () => {
    const nodes = [node("n1", "ACTION")];
    const result = validateWorkflowGraph(nodes, []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Workflow must have a trigger node");
  });

  it("returns error when multiple trigger nodes", () => {
    const nodes = [node("t1", "TRIGGER"), node("t2", "TRIGGER")];
    const result = validateWorkflowGraph(nodes, []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Workflow must have exactly one trigger node");
  });

  it("validates a simple linear workflow", () => {
    const nodes = [node("t1", "TRIGGER"), node("a1", "ACTION"), node("a2", "ACTION")];
    const edges = [edge("e1", "t1", "a1"), edge("e2", "a1", "a2")];
    const result = validateWorkflowGraph(nodes, edges);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validates a branching workflow with condition", () => {
    const nodes = [
      node("t1", "TRIGGER"),
      node("c1", "CONDITION"),
      node("a1", "ACTION"),
      node("a2", "ACTION"),
    ];
    const edges = [
      edge("e1", "t1", "c1"),
      edge("e2", "c1", "a1", "yes"),
      edge("e3", "c1", "a2", "no"),
    ];
    const result = validateWorkflowGraph(nodes, edges);
    expect(result.valid).toBe(true);
  });

  it("detects unreachable nodes", () => {
    const nodes = [
      node("t1", "TRIGGER"),
      node("a1", "ACTION"),
      node("a2", "ACTION"), // not connected
    ];
    const edges = [edge("e1", "t1", "a1")];
    const result = validateWorkflowGraph(nodes, edges);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("not reachable from trigger");
  });

  it("detects cycles", () => {
    const nodes = [node("t1", "TRIGGER"), node("a1", "ACTION"), node("a2", "ACTION")];
    const edges = [
      edge("e1", "t1", "a1"),
      edge("e2", "a1", "a2"),
      edge("e3", "a2", "a1"), // cycle
    ];
    const result = validateWorkflowGraph(nodes, edges);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Workflow contains a cycle");
  });

  it("detects incoming edges to trigger", () => {
    const nodes = [node("t1", "TRIGGER"), node("a1", "ACTION")];
    const edges = [
      edge("e1", "t1", "a1"),
      edge("e2", "a1", "t1"), // incoming to trigger
    ];
    const result = validateWorkflowGraph(nodes, edges);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Trigger node should not have incoming connections");
  });
});

describe("topologicalSort", () => {
  it("returns sorted order for linear graph", () => {
    const nodes = [node("a", "ACTION"), node("t", "TRIGGER"), node("b", "ACTION")];
    const edges = [edge("e1", "t", "a"), edge("e2", "a", "b")];
    const sorted = topologicalSort(nodes, edges);
    expect(sorted).not.toBeNull();
    const ids = sorted!.map((n) => n.id);
    expect(ids.indexOf("t")).toBeLessThan(ids.indexOf("a"));
    expect(ids.indexOf("a")).toBeLessThan(ids.indexOf("b"));
  });

  it("returns sorted order for branching graph", () => {
    const nodes = [
      node("t", "TRIGGER"),
      node("c", "CONDITION"),
      node("a1", "ACTION"),
      node("a2", "ACTION"),
    ];
    const edges = [edge("e1", "t", "c"), edge("e2", "c", "a1"), edge("e3", "c", "a2")];
    const sorted = topologicalSort(nodes, edges);
    expect(sorted).not.toBeNull();
    expect(sorted).toHaveLength(4);
    const ids = sorted!.map((n) => n.id);
    expect(ids.indexOf("t")).toBeLessThan(ids.indexOf("c"));
    expect(ids.indexOf("c")).toBeLessThan(ids.indexOf("a1"));
    expect(ids.indexOf("c")).toBeLessThan(ids.indexOf("a2"));
  });

  it("returns null for cyclic graph", () => {
    const nodes = [node("a", "ACTION"), node("b", "ACTION")];
    const edges = [edge("e1", "a", "b"), edge("e2", "b", "a")];
    const sorted = topologicalSort(nodes, edges);
    expect(sorted).toBeNull();
  });

  it("handles single node", () => {
    const nodes = [node("t", "TRIGGER")];
    const sorted = topologicalSort(nodes, []);
    expect(sorted).toEqual([{ id: "t", type: "TRIGGER" }]);
  });
});

describe("getOutgoingEdges", () => {
  it("returns edges from the specified node", () => {
    const edges = [edge("e1", "n1", "n2"), edge("e2", "n1", "n3"), edge("e3", "n2", "n3")];
    const result = getOutgoingEdges("n1", edges);
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(["e1", "e2"]);
  });

  it("returns empty array when no outgoing edges", () => {
    const edges = [edge("e1", "n1", "n2")];
    const result = getOutgoingEdges("n2", edges);
    expect(result).toHaveLength(0);
  });
});
