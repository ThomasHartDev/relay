import { describe, it, expect } from "vitest";
import {
  SEQUENCE_STATUSES,
  STEP_TYPES,
  CONDITION_TYPES,
  ENROLLMENT_STATUSES,
  SEQUENCE_STATUS_LABELS,
  ENROLLMENT_STATUS_LABELS,
  createSequenceSchema,
  updateSequenceSchema,
  sequenceFilterSchema,
  enrollContactsSchema,
  updateEnrollmentSchema,
  createSequenceStepSchema,
  sequenceStatusSchema,
} from "./sequence";

describe("sequence enums", () => {
  it("has 4 sequence statuses", () => {
    expect(SEQUENCE_STATUSES).toHaveLength(4);
    expect(SEQUENCE_STATUSES).toContain("DRAFT");
    expect(SEQUENCE_STATUSES).toContain("ACTIVE");
  });

  it("has 3 step types", () => {
    expect(STEP_TYPES).toHaveLength(3);
    expect(STEP_TYPES).toContain("EMAIL");
    expect(STEP_TYPES).toContain("DELAY");
    expect(STEP_TYPES).toContain("CONDITION");
  });

  it("has 3 condition types", () => {
    expect(CONDITION_TYPES).toHaveLength(3);
  });

  it("has 6 enrollment statuses", () => {
    expect(ENROLLMENT_STATUSES).toHaveLength(6);
  });
});

describe("SEQUENCE_STATUS_LABELS", () => {
  it("has a label for every status", () => {
    for (const status of SEQUENCE_STATUSES) {
      expect(SEQUENCE_STATUS_LABELS[status]).toBeDefined();
      expect(typeof SEQUENCE_STATUS_LABELS[status]).toBe("string");
    }
  });
});

describe("createSequenceSchema", () => {
  it("validates a minimal sequence", () => {
    const result = createSequenceSchema.safeParse({ name: "Welcome Drip" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("DRAFT");
    }
  });

  it("validates with explicit status", () => {
    const result = createSequenceSchema.safeParse({ name: "Re-engage", status: "ACTIVE" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("ACTIVE");
    }
  });

  it("rejects empty name", () => {
    const result = createSequenceSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 200 chars", () => {
    const result = createSequenceSchema.safeParse({ name: "x".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createSequenceSchema.safeParse({ name: "Test", status: "INVALID" });
    expect(result.success).toBe(false);
  });
});

describe("updateSequenceSchema", () => {
  it("allows partial update with name only", () => {
    const result = updateSequenceSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("allows partial update with status only", () => {
    const result = updateSequenceSchema.safeParse({ status: "PAUSED" });
    expect(result.success).toBe(true);
  });

  it("allows empty object", () => {
    const result = updateSequenceSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateSequenceSchema.safeParse({ status: "RUNNING" });
    expect(result.success).toBe(false);
  });
});

describe("sequenceFilterSchema", () => {
  it("provides defaults for empty input", () => {
    const result = sequenceFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(25);
      expect(result.data.sortBy).toBe("updatedAt");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("parses string page/limit (from query params)", () => {
    const result = sequenceFilterSchema.safeParse({ page: "2", limit: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = sequenceFilterSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });

  it("accepts status filter", () => {
    const result = sequenceFilterSchema.safeParse({ status: "ACTIVE" });
    expect(result.success).toBe(true);
  });
});

describe("createSequenceStepSchema", () => {
  it("validates an email step", () => {
    const result = createSequenceStepSchema.safeParse({
      type: "EMAIL",
      order: 0,
      subject: "Welcome!",
      body: "Hi there",
    });
    expect(result.success).toBe(true);
  });

  it("validates a delay step", () => {
    const result = createSequenceStepSchema.safeParse({
      type: "DELAY",
      order: 1,
      delayMs: 86400000,
    });
    expect(result.success).toBe(true);
  });

  it("validates a condition step", () => {
    const result = createSequenceStepSchema.safeParse({
      type: "CONDITION",
      order: 2,
      conditionType: "REPLIED",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid step type", () => {
    const result = createSequenceStepSchema.safeParse({ type: "WAIT", order: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative order", () => {
    const result = createSequenceStepSchema.safeParse({ type: "EMAIL", order: -1 });
    expect(result.success).toBe(false);
  });
});

describe("sequenceStatusSchema", () => {
  it("accepts all valid statuses", () => {
    for (const status of SEQUENCE_STATUSES) {
      expect(sequenceStatusSchema.safeParse(status).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(sequenceStatusSchema.safeParse("RUNNING").success).toBe(false);
  });
});

describe("ENROLLMENT_STATUS_LABELS", () => {
  it("has a label for every enrollment status", () => {
    for (const status of ENROLLMENT_STATUSES) {
      expect(ENROLLMENT_STATUS_LABELS[status]).toBeDefined();
      expect(typeof ENROLLMENT_STATUS_LABELS[status]).toBe("string");
    }
  });
});

describe("enrollContactsSchema", () => {
  it("validates with one contact ID", () => {
    const result = enrollContactsSchema.safeParse({
      contactIds: ["clxxxxxxxxxxxxxxxxxxxxxxxxx"],
    });
    expect(result.success).toBe(true);
  });

  it("validates with multiple contact IDs", () => {
    const result = enrollContactsSchema.safeParse({
      contactIds: ["clxxxxxxxxxxxxxxxxxxxxxxxxx", "clyyyyyyyyyyyyyyyyyyyyyyyy"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty contactIds array", () => {
    const result = enrollContactsSchema.safeParse({ contactIds: [] });
    expect(result.success).toBe(false);
  });

  it("rejects missing contactIds", () => {
    const result = enrollContactsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateEnrollmentSchema", () => {
  it("validates all enrollment statuses", () => {
    for (const status of ENROLLMENT_STATUSES) {
      const result = updateEnrollmentSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    const result = updateEnrollmentSchema.safeParse({ status: "RUNNING" });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateEnrollmentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
