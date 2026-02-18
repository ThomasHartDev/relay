import type { WorkflowTriggerType, WorkflowNodeType } from "../schemas/workflow";

interface TemplateNode {
  tempId: string;
  type: WorkflowNodeType;
  label: string;
  config: Record<string, unknown>;
  positionX: number;
  positionY: number;
}

interface TemplateEdge {
  sourceTempId: string;
  targetTempId: string;
  label: string | null;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  triggerType: WorkflowTriggerType;
  category: "nurture" | "operations" | "engagement";
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "lead-nurture",
    name: "Lead Nurture",
    description:
      "Automatically nurture new contacts with a welcome email and follow-up based on engagement.",
    triggerType: "CONTACT_CREATED",
    category: "nurture",
    nodes: [
      {
        tempId: "t1",
        type: "TRIGGER",
        label: "New Contact Created",
        config: {},
        positionX: 250,
        positionY: 50,
      },
      {
        tempId: "a1",
        type: "ACTION",
        label: "Send Welcome Email",
        config: {
          actionType: "SEND_EMAIL",
          subject: "Welcome!",
          description: "Send introductory email to new contact",
        },
        positionX: 250,
        positionY: 180,
      },
      {
        tempId: "d1",
        type: "DELAY",
        label: "Wait 2 Days",
        config: { delayHours: 48 },
        positionX: 250,
        positionY: 310,
      },
      {
        tempId: "a2",
        type: "ACTION",
        label: "Create Follow-up Task",
        config: {
          actionType: "CREATE_ACTIVITY",
          activityType: "task",
          description: "Follow up with new contact",
        },
        positionX: 250,
        positionY: 440,
      },
    ],
    edges: [
      { sourceTempId: "t1", targetTempId: "a1", label: null },
      { sourceTempId: "a1", targetTempId: "d1", label: null },
      { sourceTempId: "d1", targetTempId: "a2", label: null },
    ],
  },
  {
    id: "deal-stage-automation",
    name: "Deal Stage Automation",
    description:
      "When a deal changes stage, automatically assign tasks and send notifications based on the new stage.",
    triggerType: "DEAL_STAGE_CHANGED",
    category: "operations",
    nodes: [
      {
        tempId: "t1",
        type: "TRIGGER",
        label: "Deal Stage Changed",
        config: {},
        positionX: 250,
        positionY: 50,
      },
      {
        tempId: "c1",
        type: "CONDITION",
        label: "Is Won?",
        config: { field: "dealStage", operator: "equals", value: "WON" },
        positionX: 250,
        positionY: 180,
      },
      {
        tempId: "a1",
        type: "ACTION",
        label: "Send Won Notification",
        config: {
          actionType: "SEND_EMAIL",
          subject: "Deal Won!",
          description: "Notify team about won deal",
        },
        positionX: 100,
        positionY: 330,
      },
      {
        tempId: "a2",
        type: "ACTION",
        label: "Create Onboarding Task",
        config: {
          actionType: "CREATE_ACTIVITY",
          activityType: "task",
          description: "Start client onboarding process",
        },
        positionX: 400,
        positionY: 330,
      },
    ],
    edges: [
      { sourceTempId: "t1", targetTempId: "c1", label: null },
      { sourceTempId: "c1", targetTempId: "a1", label: "yes" },
      { sourceTempId: "c1", targetTempId: "a2", label: "no" },
    ],
  },
  {
    id: "tag-based-engagement",
    name: "Tag-Based Engagement",
    description:
      "When a specific tag is added to a contact, enroll them in a targeted sequence and assign an owner.",
    triggerType: "TAG_ADDED",
    category: "engagement",
    nodes: [
      {
        tempId: "t1",
        type: "TRIGGER",
        label: "Tag Added",
        config: {},
        positionX: 250,
        positionY: 50,
      },
      {
        tempId: "a1",
        type: "ACTION",
        label: "Assign Owner",
        config: {
          actionType: "ASSIGN_OWNER",
          description: "Assign sales rep to tagged contact",
        },
        positionX: 250,
        positionY: 180,
      },
      {
        tempId: "a2",
        type: "ACTION",
        label: "Add to Sequence",
        config: {
          actionType: "ENROLL_SEQUENCE",
          description: "Enroll contact in targeted outreach sequence",
        },
        positionX: 250,
        positionY: 310,
      },
      {
        tempId: "a3",
        type: "ACTION",
        label: "Create Intro Task",
        config: {
          actionType: "CREATE_ACTIVITY",
          activityType: "call",
          description: "Schedule introductory call with contact",
        },
        positionX: 250,
        positionY: 440,
      },
    ],
    edges: [
      { sourceTempId: "t1", targetTempId: "a1", label: null },
      { sourceTempId: "a1", targetTempId: "a2", label: null },
      { sourceTempId: "a2", targetTempId: "a3", label: null },
    ],
  },
  {
    id: "re-engagement",
    name: "Re-engagement Campaign",
    description:
      "Manually triggered workflow to re-engage cold contacts with a check-in email and conditional follow-up.",
    triggerType: "MANUAL",
    category: "engagement",
    nodes: [
      {
        tempId: "t1",
        type: "TRIGGER",
        label: "Manual Trigger",
        config: {},
        positionX: 250,
        positionY: 50,
      },
      {
        tempId: "a1",
        type: "ACTION",
        label: "Send Re-engagement Email",
        config: {
          actionType: "SEND_EMAIL",
          subject: "Just checking in",
          description: "Send personalized check-in email",
        },
        positionX: 250,
        positionY: 180,
      },
      {
        tempId: "d1",
        type: "DELAY",
        label: "Wait 3 Days",
        config: { delayHours: 72 },
        positionX: 250,
        positionY: 310,
      },
      {
        tempId: "c1",
        type: "CONDITION",
        label: "Replied?",
        config: { field: "replied", operator: "equals", value: true },
        positionX: 250,
        positionY: 440,
      },
      {
        tempId: "a2",
        type: "ACTION",
        label: "Create Follow-up Task",
        config: {
          actionType: "CREATE_ACTIVITY",
          activityType: "task",
          description: "Contact replied — schedule a meeting",
        },
        positionX: 100,
        positionY: 570,
      },
      {
        tempId: "a3",
        type: "ACTION",
        label: "Add Cold Tag",
        config: {
          actionType: "ADD_TAG",
          tagName: "cold",
          description: "Mark as cold — no response",
        },
        positionX: 400,
        positionY: 570,
      },
    ],
    edges: [
      { sourceTempId: "t1", targetTempId: "a1", label: null },
      { sourceTempId: "a1", targetTempId: "d1", label: null },
      { sourceTempId: "d1", targetTempId: "c1", label: null },
      { sourceTempId: "c1", targetTempId: "a2", label: "yes" },
      { sourceTempId: "c1", targetTempId: "a3", label: "no" },
    ],
  },
];

export const TEMPLATE_CATEGORIES = {
  nurture: { label: "Nurture", color: "#10B981" },
  operations: { label: "Operations", color: "#6366F1" },
  engagement: { label: "Engagement", color: "#F59E0B" },
} as const;
