import { describe, it, expect } from "vitest";
import { WORKFLOW_TEMPLATES, TEMPLATE_CATEGORIES } from "./workflow-templates";
import { validateWorkflowGraph } from "../utils/workflow-graph";

describe("WORKFLOW_TEMPLATES", () => {
  it("has at least 4 templates", () => {
    expect(WORKFLOW_TEMPLATES.length).toBeGreaterThanOrEqual(4);
  });

  it("each template has unique id", () => {
    const ids = WORKFLOW_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each template has required fields", () => {
    for (const template of WORKFLOW_TEMPLATES) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.triggerType).toBeTruthy();
      expect(template.category).toBeTruthy();
      expect(template.nodes.length).toBeGreaterThan(0);
    }
  });

  it("each template passes graph validation", () => {
    for (const template of WORKFLOW_TEMPLATES) {
      const graphNodes = template.nodes.map((n) => ({
        id: n.tempId,
        type: n.type,
      }));
      const graphEdges = template.edges.map((e, i) => ({
        id: `e${i}`,
        sourceNodeId: e.sourceTempId,
        targetNodeId: e.targetTempId,
        label: e.label,
      }));

      const result = validateWorkflowGraph(graphNodes, graphEdges);
      expect(
        result.valid,
        `Template "${template.name}" failed validation: ${result.errors.join(", ")}`,
      ).toBe(true);
    }
  });

  it("each template has exactly one trigger node", () => {
    for (const template of WORKFLOW_TEMPLATES) {
      const triggers = template.nodes.filter((n) => n.type === "TRIGGER");
      expect(triggers).toHaveLength(1);
    }
  });

  it("template categories are valid", () => {
    const validCategories = Object.keys(TEMPLATE_CATEGORIES);
    for (const template of WORKFLOW_TEMPLATES) {
      expect(validCategories).toContain(template.category);
    }
  });
});

describe("TEMPLATE_CATEGORIES", () => {
  it("has labels and colors for each category", () => {
    for (const [key, value] of Object.entries(TEMPLATE_CATEGORIES)) {
      expect(key).toBeTruthy();
      expect(value.label).toBeTruthy();
      expect(value.color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});
