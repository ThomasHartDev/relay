import { describe, it, expect } from "vitest";
import { computeMetrics, computeFunnel, computeStepMetrics } from "./sequence-analytics";
import type { EnrollmentStatus } from "../schemas/sequence";

function makeEnrollment(status: EnrollmentStatus, currentStepId: string | null = null) {
  return { status, currentStepId };
}

describe("computeMetrics", () => {
  it("returns zeros for empty enrollments", () => {
    const result = computeMetrics([]);
    expect(result.totalEnrolled).toBe(0);
    expect(result.completionRate).toBe(0);
    expect(result.replyRate).toBe(0);
    expect(result.bounceRate).toBe(0);
  });

  it("counts statuses correctly", () => {
    const enrollments = [
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("COMPLETED"),
      makeEnrollment("REPLIED"),
      makeEnrollment("BOUNCED"),
      makeEnrollment("PAUSED"),
      makeEnrollment("UNSUBSCRIBED"),
    ];
    const result = computeMetrics(enrollments);

    expect(result.totalEnrolled).toBe(7);
    expect(result.activeCount).toBe(2);
    expect(result.completedCount).toBe(1);
    expect(result.repliedCount).toBe(1);
    expect(result.bouncedCount).toBe(1);
    expect(result.pausedCount).toBe(1);
    expect(result.unsubscribedCount).toBe(1);
  });

  it("calculates completion rate as (completed + replied) / total", () => {
    const enrollments = [
      makeEnrollment("COMPLETED"),
      makeEnrollment("COMPLETED"),
      makeEnrollment("REPLIED"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
    ];
    const result = computeMetrics(enrollments);
    // 3 finished / 5 total = 60%
    expect(result.completionRate).toBe(60);
  });

  it("calculates reply rate correctly", () => {
    const enrollments = [
      makeEnrollment("REPLIED"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
    ];
    const result = computeMetrics(enrollments);
    expect(result.replyRate).toBe(25);
  });

  it("calculates bounce rate correctly", () => {
    const enrollments = [
      makeEnrollment("BOUNCED"),
      makeEnrollment("BOUNCED"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
    ];
    const result = computeMetrics(enrollments);
    expect(result.bounceRate).toBe(20);
  });
});

describe("computeFunnel", () => {
  it("returns all 100% for empty enrollments", () => {
    const metrics = computeMetrics([]);
    const funnel = computeFunnel(metrics);
    expect(funnel).toHaveLength(4);
    expect(funnel[0]!.label).toBe("Enrolled");
    expect(funnel[0]!.rate).toBe(100);
    expect(funnel[1]!.count).toBe(0);
  });

  it("builds correct funnel from metrics", () => {
    const enrollments = [
      makeEnrollment("ACTIVE"),
      makeEnrollment("ACTIVE"),
      makeEnrollment("COMPLETED"),
      makeEnrollment("REPLIED"),
      makeEnrollment("BOUNCED"),
    ];
    const metrics = computeMetrics(enrollments);
    const funnel = computeFunnel(metrics);

    // Enrolled: 5 (100%)
    expect(funnel[0]!.count).toBe(5);
    expect(funnel[0]!.rate).toBe(100);

    // Active: active(2) + finished(2) = 4 (80%)
    expect(funnel[1]!.count).toBe(4);
    expect(funnel[1]!.rate).toBe(80);

    // Completed: finished(2) = 2 (40%)
    expect(funnel[2]!.count).toBe(2);
    expect(funnel[2]!.rate).toBe(40);

    // Replied: 1 (20%)
    expect(funnel[3]!.count).toBe(1);
    expect(funnel[3]!.rate).toBe(20);
  });
});

describe("computeStepMetrics", () => {
  const steps = [
    { id: "step-1", order: 0, type: "EMAIL", subject: "Welcome" },
    { id: "step-2", order: 1, type: "DELAY", subject: null },
    { id: "step-3", order: 2, type: "EMAIL", subject: "Follow Up" },
    { id: "step-4", order: 3, type: "EMAIL", subject: null },
  ];

  it("returns empty for no enrollments", () => {
    const result = computeStepMetrics(steps, []);
    expect(result).toHaveLength(3); // only EMAIL steps
    expect(result[0]!.reached).toBe(0);
    expect(result[0]!.reachedRate).toBe(0);
  });

  it("only includes EMAIL steps", () => {
    const result = computeStepMetrics(steps, [makeEnrollment("ACTIVE", "step-1")]);
    const subjects = result.map((s) => s.subject);
    expect(subjects).toEqual(["Welcome", "Follow Up", "Email 4"]);
  });

  it("uses fallback subject when null", () => {
    const result = computeStepMetrics(steps, []);
    expect(result[2]!.subject).toBe("Email 4");
  });

  it("counts completed/replied enrollments as reaching all steps", () => {
    const enrollments = [makeEnrollment("COMPLETED"), makeEnrollment("REPLIED")];
    const result = computeStepMetrics(steps, enrollments);

    // Both completed/replied should reach every email step
    expect(result[0]!.reached).toBe(2);
    expect(result[1]!.reached).toBe(2);
    expect(result[2]!.reached).toBe(2);
  });

  it("counts enrollments at or past each step correctly", () => {
    const enrollments = [
      makeEnrollment("ACTIVE", "step-1"), // at step 0
      makeEnrollment("ACTIVE", "step-3"), // at step 2
      makeEnrollment("ACTIVE", "step-4"), // at step 3
      makeEnrollment("COMPLETED"),
    ];
    const result = computeStepMetrics(steps, enrollments);

    // Step 0 (Welcome): all 4 are at or past it
    expect(result[0]!.reached).toBe(4);
    expect(result[0]!.reachedRate).toBe(100);

    // Step 2 (Follow Up): step-3 (order 2), step-4 (order 3), completed = 3
    expect(result[1]!.reached).toBe(3);
    expect(result[1]!.reachedRate).toBe(75);

    // Step 3 (Email 4): step-4 (order 3), completed = 2
    expect(result[2]!.reached).toBe(2);
    expect(result[2]!.reachedRate).toBe(50);
  });

  it("ignores enrollments with null currentStepId if not completed", () => {
    const enrollments = [makeEnrollment("ACTIVE", null), makeEnrollment("PAUSED", null)];
    const result = computeStepMetrics(steps, enrollments);
    expect(result[0]!.reached).toBe(0);
  });
});
