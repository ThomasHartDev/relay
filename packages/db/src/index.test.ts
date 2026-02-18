import { describe, expect, it } from "vitest";

describe("db package", () => {
  it("exports prisma client module", async () => {
    const mod = await import("./index");
    expect(mod).toBeDefined();
    expect(mod.prisma).toBeDefined();
  });
});
