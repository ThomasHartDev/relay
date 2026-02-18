/**
 * Graph utilities for workflow validation and traversal.
 */

export interface GraphNode {
  id: string;
  type: string;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a workflow graph for activation readiness.
 * Checks: has exactly one trigger, all nodes reachable from trigger,
 * no orphan nodes, and no cycles.
 */
export function validateWorkflowGraph(nodes: GraphNode[], edges: GraphEdge[]): ValidationResult {
  const errors: string[] = [];

  if (nodes.length === 0) {
    errors.push("Workflow must have at least one node");
    return { valid: false, errors };
  }

  // Must have exactly one TRIGGER node
  const triggers = nodes.filter((n) => n.type === "TRIGGER");
  if (triggers.length === 0) {
    errors.push("Workflow must have a trigger node");
  } else if (triggers.length > 1) {
    errors.push("Workflow must have exactly one trigger node");
  }

  // Build adjacency map
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  for (const node of nodes) {
    outgoing.set(node.id, []);
    incoming.set(node.id, []);
  }

  for (const edge of edges) {
    const out = outgoing.get(edge.sourceNodeId);
    if (out) out.push(edge.targetNodeId);
    const inc = incoming.get(edge.targetNodeId);
    if (inc) inc.push(edge.sourceNodeId);
  }

  // Trigger should have no incoming edges
  for (const trigger of triggers) {
    const inc = incoming.get(trigger.id);
    if (inc && inc.length > 0) {
      errors.push("Trigger node should not have incoming connections");
    }
  }

  // Check all nodes reachable from trigger via BFS
  if (triggers.length === 1) {
    const trigger = triggers[0]!;
    const visited = new Set<string>();
    const queue = [trigger.id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const neighbors = outgoing.get(current) ?? [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }

    const unreachable = nodes.filter((n) => !visited.has(n.id));
    if (unreachable.length > 0) {
      errors.push(
        `${unreachable.length} node(s) not reachable from trigger: ${unreachable.map((n) => n.id).join(", ")}`,
      );
    }
  }

  // Check for cycles using DFS
  if (hasCycle(nodes, outgoing)) {
    errors.push("Workflow contains a cycle");
  }

  return { valid: errors.length === 0, errors };
}

function hasCycle(nodes: GraphNode[], outgoing: Map<string, string[]>): boolean {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;

  const color = new Map<string, number>();
  for (const node of nodes) color.set(node.id, WHITE);

  function dfs(nodeId: string): boolean {
    color.set(nodeId, GRAY);
    const neighbors = outgoing.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      const c = color.get(neighbor);
      if (c === GRAY) return true; // Back edge = cycle
      if (c === WHITE && dfs(neighbor)) return true;
    }
    color.set(nodeId, BLACK);
    return false;
  }

  for (const node of nodes) {
    if (color.get(node.id) === WHITE) {
      if (dfs(node.id)) return true;
    }
  }
  return false;
}

/**
 * Topological sort of workflow nodes (for execution order).
 * Returns null if graph has a cycle.
 */
export function topologicalSort(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] | null {
  const outgoing = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    outgoing.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    const out = outgoing.get(edge.sourceNodeId);
    if (out) out.push(edge.targetNodeId);
    inDegree.set(edge.targetNodeId, (inDegree.get(edge.targetNodeId) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const sorted: GraphNode[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = nodeMap.get(current);
    if (node) sorted.push(node);

    for (const neighbor of outgoing.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  return sorted.length === nodes.length ? sorted : null;
}

/**
 * Get outgoing edges from a specific node, useful for graph walking.
 */
export function getOutgoingEdges(nodeId: string, edges: GraphEdge[]): GraphEdge[] {
  return edges.filter((e) => e.sourceNodeId === nodeId);
}
