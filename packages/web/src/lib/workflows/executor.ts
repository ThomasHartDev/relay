import { prisma } from "@relay/db";
import { getOutgoingEdges, type GraphEdge } from "@relay/shared";

interface WorkflowWithGraph {
  id: string;
  nodes: {
    id: string;
    type: string;
    label: string;
    config: unknown;
  }[];
  edges: {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    label: string | null;
  }[];
}

interface LogEntry {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  action: string;
  result: string;
  timestamp: string;
}

/**
 * Execute a workflow by walking its graph from the trigger node.
 * Creates an execution record and processes each node in order.
 */
export async function executeWorkflow(
  workflow: WorkflowWithGraph,
  triggerData: Record<string, unknown>,
) {
  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId: workflow.id,
      status: "RUNNING",
      triggerData: triggerData as object,
      log: [],
    },
  });

  const log: LogEntry[] = [];
  const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));
  const edges: GraphEdge[] = workflow.edges.map((e) => ({
    id: e.id,
    sourceNodeId: e.sourceNodeId,
    targetNodeId: e.targetNodeId,
    label: e.label,
  }));

  try {
    // Find the trigger node
    const triggerNode = workflow.nodes.find((n) => n.type === "TRIGGER");
    if (!triggerNode) {
      throw new Error("No trigger node found");
    }

    // Walk the graph starting from the trigger
    await walkNode(triggerNode.id, nodeMap, edges, triggerData, log);

    // Mark execution as completed
    const completed = await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        log: log as object[],
      },
    });

    return completed;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    log.push({
      nodeId: "system",
      nodeLabel: "System",
      nodeType: "ERROR",
      action: "execution_failed",
      result: errorMessage,
      timestamp: new Date().toISOString(),
    });

    const failed = await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        log: log as object[],
      },
    });

    return failed;
  }
}

async function walkNode(
  nodeId: string,
  nodeMap: Map<string, WorkflowWithGraph["nodes"][number]>,
  edges: GraphEdge[],
  context: Record<string, unknown>,
  log: LogEntry[],
): Promise<void> {
  const node = nodeMap.get(nodeId);
  if (!node) return;

  const config = (node.config ?? {}) as Record<string, unknown>;

  switch (node.type) {
    case "TRIGGER": {
      log.push({
        nodeId: node.id,
        nodeLabel: node.label,
        nodeType: node.type,
        action: "trigger_fired",
        result: "Workflow triggered",
        timestamp: new Date().toISOString(),
      });
      break;
    }

    case "ACTION": {
      const actionResult = await executeAction(config, context);
      log.push({
        nodeId: node.id,
        nodeLabel: node.label,
        nodeType: node.type,
        action: (config.actionType as string) ?? "unknown_action",
        result: actionResult,
        timestamp: new Date().toISOString(),
      });
      break;
    }

    case "CONDITION": {
      const conditionResult = evaluateCondition(config, context);
      log.push({
        nodeId: node.id,
        nodeLabel: node.label,
        nodeType: node.type,
        action: "condition_evaluated",
        result: conditionResult ? "yes" : "no",
        timestamp: new Date().toISOString(),
      });

      // Follow the matching branch
      const outgoing = getOutgoingEdges(nodeId, edges);
      const branchLabel = conditionResult ? "yes" : "no";
      const matchingEdge = outgoing.find((e) => e.label === branchLabel);
      if (matchingEdge) {
        await walkNode(matchingEdge.targetNodeId, nodeMap, edges, context, log);
      }
      return; // Don't follow all edges — condition already picked a branch
    }

    case "DELAY": {
      const delayHours = Number(config.delayHours ?? 0);
      log.push({
        nodeId: node.id,
        nodeLabel: node.label,
        nodeType: node.type,
        action: "delay_logged",
        result: `Delay of ${delayHours}h recorded (synchronous execution)`,
        timestamp: new Date().toISOString(),
      });
      break;
    }
  }

  // Follow all outgoing edges (except for CONDITION which returns early)
  const outgoing = getOutgoingEdges(nodeId, edges);
  for (const edge of outgoing) {
    await walkNode(edge.targetNodeId, nodeMap, edges, context, log);
  }
}

async function executeAction(
  config: Record<string, unknown>,
  context: Record<string, unknown>,
): Promise<string> {
  const actionType = config.actionType as string | undefined;

  switch (actionType) {
    case "SEND_EMAIL":
      return `Email action recorded: "${config.subject ?? "No subject"}" to ${context.contactId ?? "unknown"}`;

    case "CREATE_ACTIVITY":
      return `Activity creation recorded: "${config.activityType ?? "task"}" — ${config.description ?? "No description"}`;

    case "UPDATE_FIELD":
      return `Field update recorded: ${config.field ?? "unknown"} = ${config.value ?? "null"}`;

    case "ADD_TAG":
      return `Tag addition recorded: "${config.tagName ?? "unknown"}"`;

    case "REMOVE_TAG":
      return `Tag removal recorded: "${config.tagName ?? "unknown"}"`;

    case "ASSIGN_OWNER":
      return `Owner assignment recorded: ${config.ownerId ?? "unknown"}`;

    case "ENROLL_SEQUENCE":
      return `Sequence enrollment recorded: ${config.sequenceId ?? "unknown"}`;

    default:
      return `Action executed: ${actionType ?? "no type specified"}`;
  }
}

function evaluateCondition(
  config: Record<string, unknown>,
  context: Record<string, unknown>,
): boolean {
  const field = config.field as string | undefined;
  const operator = config.operator as string | undefined;
  const value = config.value;

  if (!field || !operator) return false;

  const contextValue = context[field];

  switch (operator) {
    case "equals":
      return contextValue === value;
    case "not_equals":
      return contextValue !== value;
    case "contains":
      return (
        typeof contextValue === "string" &&
        typeof value === "string" &&
        contextValue.includes(value)
      );
    case "exists":
      return contextValue !== undefined && contextValue !== null;
    case "not_exists":
      return contextValue === undefined || contextValue === null;
    case "greater_than":
      return Number(contextValue) > Number(value);
    case "less_than":
      return Number(contextValue) < Number(value);
    default:
      return false;
  }
}
