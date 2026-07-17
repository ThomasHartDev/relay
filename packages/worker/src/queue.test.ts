import { describe, expect, it, vi } from "vitest";
import {
  buildJobOptions,
  enqueueSequenceStep,
  enqueueWorkflowDelay,
  resolveDelayMs,
  sequenceStepJobId,
  workflowDelayJobId,
  type Enqueuer,
} from "./queue";
import { JOB_NAMES, type SequenceStepPayload, type WorkflowDelayPayload } from "./payloads";

const seqPayload: SequenceStepPayload = {
  enrollmentId: "clh1a2b3c4d5e6f7g8h9i0j1",
  sequenceId: "clh2a2b3c4d5e6f7g8h9i0j2",
  stepId: "clh3a2b3c4d5e6f7g8h9i0j3",
};

const wfPayload: WorkflowDelayPayload = {
  executionId: "clh4a2b3c4d5e6f7g8h9i0j4",
  workflowId: "clh5a2b3c4d5e6f7g8h9i0j5",
  nodeId: "clh6a2b3c4d5e6f7g8h9i0j6",
};

function fakeQueue(): Enqueuer & { calls: Array<{ name: string; data: unknown; opts?: unknown }> } {
  const calls: Array<{ name: string; data: unknown; opts?: unknown }> = [];
  return {
    calls,
    add: vi.fn(async (name, data, opts) => {
      calls.push({ name, data, opts });
      return { id: (opts as { jobId?: string })?.jobId };
    }),
  };
}

describe("resolveDelayMs", () => {
  it("clamps null, undefined, and negatives to zero", () => {
    expect(resolveDelayMs(null)).toBe(0);
    expect(resolveDelayMs(undefined)).toBe(0);
    expect(resolveDelayMs(-1)).toBe(0);
  });

  it("clamps NaN and Infinity to zero", () => {
    expect(resolveDelayMs(NaN)).toBe(0);
    expect(resolveDelayMs(Infinity)).toBe(0);
  });

  it("floors fractional milliseconds", () => {
    expect(resolveDelayMs(1500.9)).toBe(1500);
  });

  it("caps absurdly large delays at one year", () => {
    const oneYear = 365 * 24 * 60 * 60 * 1_000;
    expect(resolveDelayMs(oneYear * 10)).toBe(oneYear);
  });
});

describe("job ids", () => {
  it("are deterministic for the same payload", () => {
    expect(sequenceStepJobId(seqPayload)).toBe(sequenceStepJobId(seqPayload));
    expect(workflowDelayJobId(wfPayload)).toBe(workflowDelayJobId(wfPayload));
  });

  it("scope by the identity that must not double-run", () => {
    expect(sequenceStepJobId(seqPayload)).toBe(
      `seq:${seqPayload.enrollmentId}:${seqPayload.stepId}`,
    );
    expect(workflowDelayJobId(wfPayload)).toBe(`wf:${wfPayload.executionId}:${wfPayload.nodeId}`);
  });

  it("differ when the step changes but the enrollment stays", () => {
    const other = sequenceStepJobId({ ...seqPayload, stepId: "clh9a2b3c4d5e6f7g8h9i0j9" });
    expect(other).not.toBe(sequenceStepJobId(seqPayload));
  });
});

describe("buildJobOptions", () => {
  it("carries the retry policy and clamps the delay", () => {
    const opts = buildJobOptions("job-1", -50);
    expect(opts.jobId).toBe("job-1");
    expect(opts.delay).toBe(0);
    expect(opts.attempts).toBe(3);
    expect(opts.backoff).toEqual({ type: "exponential", delay: 5_000 });
  });
});

describe("enqueueSequenceStep", () => {
  it("adds a named job with a deterministic id and default zero delay", async () => {
    const q = fakeQueue();
    await enqueueSequenceStep(q, seqPayload);
    expect(q.calls).toHaveLength(1);
    expect(q.calls[0]!.name).toBe(JOB_NAMES.sequenceStep);
    const opts = q.calls[0]!.opts as { jobId: string; delay: number };
    expect(opts.jobId).toBe(sequenceStepJobId(seqPayload));
    expect(opts.delay).toBe(0);
  });

  it("reuses the same id across retried enqueues (idempotent scheduling)", async () => {
    const q = fakeQueue();
    await enqueueSequenceStep(q, seqPayload, 60_000);
    await enqueueSequenceStep(q, seqPayload, 60_000);
    const ids = q.calls.map((c) => (c.opts as { jobId: string }).jobId);
    expect(ids[0]).toBe(ids[1]);
  });
});

describe("enqueueWorkflowDelay", () => {
  it("passes the resume delay through to the job options", async () => {
    const q = fakeQueue();
    await enqueueWorkflowDelay(q, wfPayload, 3_600_000);
    const opts = q.calls[0]!.opts as { jobId: string; delay: number };
    expect(opts.jobId).toBe(workflowDelayJobId(wfPayload));
    expect(opts.delay).toBe(3_600_000);
  });
});
