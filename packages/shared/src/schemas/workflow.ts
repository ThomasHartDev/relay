import { z } from "zod";

export const WORKFLOW_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export const WORKFLOW_NODE_TYPES = ["TRIGGER", "CONDITION", "ACTION", "DELAY"] as const;
export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPES)[number];

export const WORKFLOW_TRIGGER_TYPES = [
  "CONTACT_CREATED",
  "DEAL_STAGE_CHANGED",
  "TAG_ADDED",
  "FORM_SUBMITTED",
  "MANUAL",
] as const;
export type WorkflowTriggerType = (typeof WORKFLOW_TRIGGER_TYPES)[number];

export const WORKFLOW_ACTION_TYPES = [
  "SEND_EMAIL",
  "CREATE_ACTIVITY",
  "UPDATE_FIELD",
  "ADD_TAG",
  "REMOVE_TAG",
  "ASSIGN_OWNER",
  "ENROLL_SEQUENCE",
] as const;
export type WorkflowActionType = (typeof WORKFLOW_ACTION_TYPES)[number];

export const WORKFLOW_EXECUTION_STATUSES = ["RUNNING", "COMPLETED", "FAILED", "CANCELLED"] as const;
export type WorkflowExecutionStatus = (typeof WORKFLOW_EXECUTION_STATUSES)[number];

export const workflowStatusSchema = z.enum(WORKFLOW_STATUSES);
export const workflowNodeTypeSchema = z.enum(WORKFLOW_NODE_TYPES);
export const workflowTriggerTypeSchema = z.enum(WORKFLOW_TRIGGER_TYPES);
export const workflowActionTypeSchema = z.enum(WORKFLOW_ACTION_TYPES);
export const workflowExecutionStatusSchema = z.enum(WORKFLOW_EXECUTION_STATUSES);

export const createWorkflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required").max(200),
  description: z.string().max(1000).optional(),
  triggerType: workflowTriggerTypeSchema.optional(),
});

export const createWorkflowNodeSchema = z.object({
  type: workflowNodeTypeSchema,
  label: z.string().min(1).max(100),
  config: z.record(z.unknown()).default({}),
  positionX: z.number().default(0),
  positionY: z.number().default(0),
});

export const createWorkflowEdgeSchema = z.object({
  sourceNodeId: z.string().cuid(),
  targetNodeId: z.string().cuid(),
  label: z.string().max(100).optional(),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type CreateWorkflowNodeInput = z.infer<typeof createWorkflowNodeSchema>;
export type CreateWorkflowEdgeInput = z.infer<typeof createWorkflowEdgeSchema>;
