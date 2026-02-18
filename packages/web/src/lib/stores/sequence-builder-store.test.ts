import { describe, it, expect, beforeEach } from "vitest";
import { useSequenceBuilderStore } from "./sequence-builder-store";
import type { BuilderStep } from "./sequence-builder-store";

function makeStep(overrides: Partial<BuilderStep> = {}): BuilderStep {
  return {
    id: `step-${Math.random().toString(36).slice(2, 8)}`,
    type: "EMAIL",
    order: 0,
    subject: null,
    body: null,
    delayMs: null,
    conditionType: null,
    ...overrides,
  };
}

describe("sequence-builder-store", () => {
  beforeEach(() => {
    useSequenceBuilderStore.getState().reset();
  });

  it("initializes with empty state", () => {
    const state = useSequenceBuilderStore.getState();
    expect(state.sequenceId).toBeNull();
    expect(state.steps).toHaveLength(0);
    expect(state.selectedStepId).toBeNull();
    expect(state.isDirty).toBe(false);
  });

  it("setSequence loads steps and resets dirty flag", () => {
    const steps = [makeStep({ id: "s1", order: 0 }), makeStep({ id: "s2", order: 1 })];
    useSequenceBuilderStore.getState().setSequence("seq-1", steps);

    const state = useSequenceBuilderStore.getState();
    expect(state.sequenceId).toBe("seq-1");
    expect(state.steps).toHaveLength(2);
    expect(state.isDirty).toBe(false);
  });

  it("selectStep updates selectedStepId", () => {
    useSequenceBuilderStore.getState().selectStep("s1");
    expect(useSequenceBuilderStore.getState().selectedStepId).toBe("s1");
  });

  it("addStep appends and selects the new step", () => {
    const step = makeStep({ id: "new-1", order: 0 });
    useSequenceBuilderStore.getState().addStep(step);

    const state = useSequenceBuilderStore.getState();
    expect(state.steps).toHaveLength(1);
    expect(state.selectedStepId).toBe("new-1");
    expect(state.isDirty).toBe(true);
  });

  it("updateStep merges partial data", () => {
    const step = makeStep({ id: "s1", type: "EMAIL", subject: "Hello" });
    useSequenceBuilderStore.getState().addStep(step);
    useSequenceBuilderStore.getState().updateStep("s1", { subject: "Updated" });

    const updated = useSequenceBuilderStore.getState().steps[0];
    expect(updated?.subject).toBe("Updated");
    expect(updated?.type).toBe("EMAIL");
  });

  it("removeStep filters and re-indexes orders", () => {
    const steps = [
      makeStep({ id: "s1", order: 0 }),
      makeStep({ id: "s2", order: 1 }),
      makeStep({ id: "s3", order: 2 }),
    ];
    useSequenceBuilderStore.getState().setSequence("seq-1", steps);
    useSequenceBuilderStore.getState().removeStep("s2");

    const state = useSequenceBuilderStore.getState();
    expect(state.steps).toHaveLength(2);
    expect(state.steps[0]?.id).toBe("s1");
    expect(state.steps[0]?.order).toBe(0);
    expect(state.steps[1]?.id).toBe("s3");
    expect(state.steps[1]?.order).toBe(1);
  });

  it("removeStep clears selection if removing selected step", () => {
    const step = makeStep({ id: "s1" });
    useSequenceBuilderStore.getState().addStep(step);
    expect(useSequenceBuilderStore.getState().selectedStepId).toBe("s1");

    useSequenceBuilderStore.getState().removeStep("s1");
    expect(useSequenceBuilderStore.getState().selectedStepId).toBeNull();
  });

  it("removeStep keeps selection if removing different step", () => {
    useSequenceBuilderStore.getState().addStep(makeStep({ id: "s1", order: 0 }));
    useSequenceBuilderStore.getState().addStep(makeStep({ id: "s2", order: 1 }));
    useSequenceBuilderStore.getState().selectStep("s1");

    useSequenceBuilderStore.getState().removeStep("s2");
    expect(useSequenceBuilderStore.getState().selectedStepId).toBe("s1");
  });

  it("reorderSteps moves step and re-indexes", () => {
    const steps = [
      makeStep({ id: "s1", order: 0 }),
      makeStep({ id: "s2", order: 1 }),
      makeStep({ id: "s3", order: 2 }),
    ];
    useSequenceBuilderStore.getState().setSequence("seq-1", steps);
    useSequenceBuilderStore.getState().reorderSteps(0, 2);

    const state = useSequenceBuilderStore.getState();
    expect(state.steps[0]?.id).toBe("s2");
    expect(state.steps[1]?.id).toBe("s3");
    expect(state.steps[2]?.id).toBe("s1");
    expect(state.steps.map((s) => s.order)).toEqual([0, 1, 2]);
    expect(state.isDirty).toBe(true);
  });

  it("markClean resets isDirty", () => {
    useSequenceBuilderStore.getState().addStep(makeStep());
    expect(useSequenceBuilderStore.getState().isDirty).toBe(true);

    useSequenceBuilderStore.getState().markClean();
    expect(useSequenceBuilderStore.getState().isDirty).toBe(false);
  });

  it("reset clears everything", () => {
    useSequenceBuilderStore.getState().setSequence("seq-1", [makeStep()]);
    useSequenceBuilderStore.getState().selectStep("s1");

    useSequenceBuilderStore.getState().reset();
    const state = useSequenceBuilderStore.getState();
    expect(state.sequenceId).toBeNull();
    expect(state.steps).toHaveLength(0);
    expect(state.selectedStepId).toBeNull();
    expect(state.isDirty).toBe(false);
  });
});
