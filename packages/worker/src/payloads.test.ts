import { describe, expect, it } from "vitest";
import {
  isJobName,
  JOB_NAMES,
  JOB_PAYLOAD_SCHEMAS,
  sequenceStepPayloadSchema,
  workflowDelayPayloadSchema,
} from "./payloads";

const CUID_A = "clh1a2b3c4d5e6f7g8h9i0j1";
const CUID_B = "clh2a2b3c4d5e6f7g8h9i0j2";
const CUID_C = "clh3a2b3c4d5e6f7g8h9i0j3";

describe("payload schemas", () => {
  it("accepts a well-formed sequence-step payload", () => {
    const parsed = sequenceStepPayloadSchema.parse({
      enrollmentId: CUID_A,
      sequenceId: CUID_B,
      stepId: CUID_C,
    });
    expect(parsed.stepId).toBe(CUID_C);
  });

  it("rejects non-cuid ids", () => {
    expect(() =>
      sequenceStepPayloadSchema.parse({ enrollmentId: "1", sequenceId: CUID_B, stepId: CUID_C }),
    ).toThrow();
  });

  it("strips unknown keys on workflow-delay", () => {
    const parsed = workflowDelayPayloadSchema.parse({
      executionId: CUID_A,
      workflowId: CUID_B,
      nodeId: CUID_C,
      injected: "nope",
    });
    expect(parsed).not.toHaveProperty("injected");
  });

  it("rejects a payload missing a required field", () => {
    expect(() =>
      workflowDelayPayloadSchema.parse({ executionId: CUID_A, workflowId: CUID_B }),
    ).toThrow();
  });
});

describe("isJobName", () => {
  it("recognizes the two known job names", () => {
    expect(isJobName(JOB_NAMES.sequenceStep)).toBe(true);
    expect(isJobName(JOB_NAMES.workflowDelay)).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isJobName("send-slack")).toBe(false);
    expect(isJobName("")).toBe(false);
  });
});

describe("JOB_PAYLOAD_SCHEMAS", () => {
  it("maps each name to its schema", () => {
    expect(JOB_PAYLOAD_SCHEMAS[JOB_NAMES.sequenceStep]).toBe(sequenceStepPayloadSchema);
    expect(JOB_PAYLOAD_SCHEMAS[JOB_NAMES.workflowDelay]).toBe(workflowDelayPayloadSchema);
  });
});
