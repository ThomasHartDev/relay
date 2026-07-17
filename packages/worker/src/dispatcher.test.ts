import { describe, expect, it, vi } from "vitest";
import { JobDispatcher, UnknownJobError } from "./dispatcher";
import { JOB_NAMES } from "./payloads";

const seqData = {
  enrollmentId: "clh1a2b3c4d5e6f7g8h9i0j1",
  sequenceId: "clh2a2b3c4d5e6f7g8h9i0j2",
  stepId: "clh3a2b3c4d5e6f7g8h9i0j3",
};

describe("JobDispatcher", () => {
  it("validates then routes to the registered handler", async () => {
    const handler = vi.fn(async () => {});
    const d = new JobDispatcher().on(JOB_NAMES.sequenceStep, handler);
    await d.dispatch(JOB_NAMES.sequenceStep, seqData);
    expect(handler).toHaveBeenCalledWith(seqData);
  });

  it("throws UnknownJobError for an unregistered known name", async () => {
    const d = new JobDispatcher();
    await expect(d.dispatch(JOB_NAMES.workflowDelay, {})).rejects.toBeInstanceOf(UnknownJobError);
  });

  it("throws UnknownJobError for a name it never knew", async () => {
    const d = new JobDispatcher().on(JOB_NAMES.sequenceStep, async () => {});
    await expect(d.dispatch("garbage", {})).rejects.toBeInstanceOf(UnknownJobError);
  });

  it("rejects an invalid payload without calling the handler", async () => {
    const handler = vi.fn(async () => {});
    const d = new JobDispatcher().on(JOB_NAMES.sequenceStep, handler);
    await expect(d.dispatch(JOB_NAMES.sequenceStep, { enrollmentId: "x" })).rejects.toThrow();
    expect(handler).not.toHaveBeenCalled();
  });

  it("propagates a handler failure so the queue can retry", async () => {
    const d = new JobDispatcher().on(JOB_NAMES.sequenceStep, async () => {
      throw new Error("smtp down");
    });
    await expect(d.dispatch(JOB_NAMES.sequenceStep, seqData)).rejects.toThrow("smtp down");
  });

  it("reports which names it can handle", () => {
    const d = new JobDispatcher().on(JOB_NAMES.workflowDelay, async () => {});
    expect(d.handles(JOB_NAMES.workflowDelay)).toBe(true);
    expect(d.handles(JOB_NAMES.sequenceStep)).toBe(false);
    expect(d.handles("nope")).toBe(false);
  });

  it("keeps the last handler registered for a name", async () => {
    const first = vi.fn(async () => {});
    const second = vi.fn(async () => {});
    const d = new JobDispatcher()
      .on(JOB_NAMES.sequenceStep, first)
      .on(JOB_NAMES.sequenceStep, second);
    await d.dispatch(JOB_NAMES.sequenceStep, seqData);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });
});
