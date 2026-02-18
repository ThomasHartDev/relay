import { describe, expect, it } from "vitest";
import {
  createWorkflowSchema,
  createWorkflowNodeSchema,
  createWorkflowEdgeSchema,
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
