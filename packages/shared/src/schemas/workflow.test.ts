import { describe, expect, it } from "vitest";
import {
  WORKFLOW_STATUSES,
  WORKFLOW_STATUS_LABELS,
  WORKFLOW_TRIGGER_TYPES,
  WORKFLOW_TRIGGER_LABELS,
  createWorkflowSchema,
  createWorkflowNodeSchema,
  createWorkflowEdgeSchema,
  updateWorkflowSchema,
  workflowFilterSchema,
} from "./workflow";

describe("createWorkflowSchema", () => {
  it("accepts valid workflow", () => {
    const result = createWorkflowSchema.safeParse({
      name: "Lead Nurture",
      description: "Automate lead follow-ups",
      triggerType: "CONTACT_CREATED",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createWorkflowSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid trigger type", () => {
    const result = createWorkflowSchema.safeParse({
      name: "Test",
      triggerType: "INVALID",
    });
    expect(result.success).toBe(false);
  });
});

describe("createWorkflowNodeSchema", () => {
  it("accepts valid node with defaults", () => {
    const result = createWorkflowNodeSchema.safeParse({
      type: "TRIGGER",
      label: "Contact Created",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.positionX).toBe(0);
      expect(result.data.positionY).toBe(0);
      expect(result.data.config).toEqual({});
    }
  });

  it("accepts node with position", () => {
    const result = createWorkflowNodeSchema.safeParse({
      type: "ACTION",
      label: "Send Email",
      positionX: 250,
      positionY: 100,
      config: { templateId: "welcome" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid node type", () => {
    const result = createWorkflowNodeSchema.safeParse({
      type: "INVALID",
      label: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("createWorkflowEdgeSchema", () => {
  it("accepts valid edge", () => {
    const result = createWorkflowEdgeSchema.safeParse({
      sourceNodeId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      targetNodeId: "clyyyyyyyyyyyyyyyyyyyyyyyyyy",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid source node ID", () => {
    const result = createWorkflowEdgeSchema.safeParse({
      sourceNodeId: "not-a-cuid",
      targetNodeId: "clyyyyyyyyyyyyyyyyyyyyyyyyyy",
    });
    expect(result.success).toBe(false);
  });
});

describe("WORKFLOW_STATUS_LABELS", () => {
  it("has a label for every status", () => {
    for (const status of WORKFLOW_STATUSES) {
      expect(WORKFLOW_STATUS_LABELS[status]).toBeDefined();
      expect(typeof WORKFLOW_STATUS_LABELS[status]).toBe("string");
    }
  });
});

describe("WORKFLOW_TRIGGER_LABELS", () => {
  it("has a label for every trigger type", () => {
    for (const type of WORKFLOW_TRIGGER_TYPES) {
      expect(WORKFLOW_TRIGGER_LABELS[type]).toBeDefined();
      expect(typeof WORKFLOW_TRIGGER_LABELS[type]).toBe("string");
    }
  });
});

describe("updateWorkflowSchema", () => {
  it("allows partial update with name only", () => {
    const result = updateWorkflowSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("allows partial update with status only", () => {
    const result = updateWorkflowSchema.safeParse({ status: "PAUSED" });
    expect(result.success).toBe(true);
  });

  it("allows empty object", () => {
    const result = updateWorkflowSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateWorkflowSchema.safeParse({ status: "RUNNING" });
    expect(result.success).toBe(false);
  });

  it("accepts description and triggerType", () => {
    const result = updateWorkflowSchema.safeParse({
      description: "Updated description",
      triggerType: "TAG_ADDED",
    });
    expect(result.success).toBe(true);
  });
});

describe("workflowFilterSchema", () => {
  it("provides defaults for empty input", () => {
    const result = workflowFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(25);
      expect(result.data.sortBy).toBe("updatedAt");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("parses string page/limit", () => {
    const result = workflowFilterSchema.safeParse({ page: "3", limit: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = workflowFilterSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });

  it("accepts status filter", () => {
    const result = workflowFilterSchema.safeParse({ status: "ACTIVE" });
    expect(result.success).toBe(true);
  });
});
