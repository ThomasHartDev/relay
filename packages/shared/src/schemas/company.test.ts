import { describe, expect, it } from "vitest";
import {
  createCompanySchema,
  updateCompanySchema,
  companyFilterSchema,
  companySizeSchema,
} from "./company";

describe("companySizeSchema", () => {
  it("accepts valid sizes", () => {
    expect(companySizeSchema.parse("STARTUP")).toBe("STARTUP");
    expect(companySizeSchema.parse("ENTERPRISE")).toBe("ENTERPRISE");
  });

  it("rejects invalid sizes", () => {
    expect(() => companySizeSchema.parse("HUGE")).toThrow();
  });
});

describe("createCompanySchema", () => {
  it("accepts valid company data", () => {
    const result = createCompanySchema.parse({
      name: "Acme Corp",
      domain: "acme.com",
      industry: "Technology",
      size: "MEDIUM",
    });
    expect(result.name).toBe("Acme Corp");
    expect(result.size).toBe("MEDIUM");
  });

  it("requires name", () => {
    expect(() => createCompanySchema.parse({ name: "" })).toThrow();
  });

  it("allows optional fields", () => {
    const result = createCompanySchema.parse({ name: "Acme" });
    expect(result.domain).toBeUndefined();
    expect(result.industry).toBeUndefined();
    expect(result.size).toBeUndefined();
  });
});

describe("updateCompanySchema", () => {
  it("allows partial updates", () => {
    const result = updateCompanySchema.parse({ name: "New Name" });
    expect(result.name).toBe("New Name");
  });

  it("accepts empty object", () => {
    const result = updateCompanySchema.parse({});
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe("companyFilterSchema", () => {
  it("provides sensible defaults", () => {
    const result = companyFilterSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(25);
    expect(result.sortBy).toBe("createdAt");
    expect(result.sortOrder).toBe("desc");
  });

  it("coerces string page/limit to numbers", () => {
    const result = companyFilterSchema.parse({ page: "3", limit: "10" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
  });

  it("accepts size filter", () => {
    const result = companyFilterSchema.parse({ size: "STARTUP" });
    expect(result.size).toBe("STARTUP");
  });

  it("rejects invalid sort field", () => {
    expect(() => companyFilterSchema.parse({ sortBy: "invalid" })).toThrow();
  });

  it("rejects limit over 100", () => {
    expect(() => companyFilterSchema.parse({ limit: "200" })).toThrow();
  });
});
