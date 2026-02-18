import { describe, expect, it } from "vitest";
import {
  groupDealsByStage,
  formatCurrency,
  daysSinceCreated,
  type PipelineDeal,
} from "./pipeline-utils";

function makeDeal(overrides: Partial<PipelineDeal> = {}): PipelineDeal {
  return {
    id: "d1",
    title: "Test Deal",
    value: 10000,
    stage: "PROSPECT",
    createdAt: new Date().toISOString(),
    contact: null,
    company: null,
    owner: null,
    ...overrides,
  };
}

describe("groupDealsByStage", () => {
  it("returns all 6 stage columns even with no deals", () => {
    const columns = groupDealsByStage([]);
    expect(columns).toHaveLength(6);
    expect(columns.map((c) => c.stage)).toEqual([
      "PROSPECT",
      "QUALIFIED",
      "PROPOSAL",
      "NEGOTIATION",
      "WON",
      "LOST",
    ]);
  });

  it("groups deals into correct stage columns", () => {
    const deals = [
      makeDeal({ id: "1", stage: "PROSPECT" }),
      makeDeal({ id: "2", stage: "PROSPECT" }),
      makeDeal({ id: "3", stage: "WON" }),
    ];
    const columns = groupDealsByStage(deals);
    const prospect = columns.find((c) => c.stage === "PROSPECT");
    const won = columns.find((c) => c.stage === "WON");
    expect(prospect?.deals).toHaveLength(2);
    expect(won?.deals).toHaveLength(1);
  });

  it("calculates total value per column", () => {
    const deals = [
      makeDeal({ id: "1", stage: "QUALIFIED", value: 5000 }),
      makeDeal({ id: "2", stage: "QUALIFIED", value: 3000 }),
    ];
    const columns = groupDealsByStage(deals);
    const qualified = columns.find((c) => c.stage === "QUALIFIED");
    expect(qualified?.totalValue).toBe(8000);
  });

  it("includes correct stage config labels and colors", () => {
    const columns = groupDealsByStage([]);
    const prospect = columns.find((c) => c.stage === "PROSPECT");
    expect(prospect?.label).toBe("Prospect");
    expect(prospect?.color).toBe("#6366F1");
  });
});

describe("formatCurrency", () => {
  it("formats values under 1000 with dollar sign", () => {
    expect(formatCurrency(500)).toBe("$500");
  });

  it("formats thousands as k", () => {
    expect(formatCurrency(5000)).toBe("$5k");
    expect(formatCurrency(25000)).toBe("$25k");
  });

  it("formats millions as M", () => {
    expect(formatCurrency(1500000)).toBe("$1.5M");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });
});

describe("daysSinceCreated", () => {
  it("returns 0 for today", () => {
    expect(daysSinceCreated(new Date().toISOString())).toBe(0);
  });

  it("returns correct days for past date", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString();
    expect(daysSinceCreated(threeDaysAgo)).toBe(3);
  });
});
