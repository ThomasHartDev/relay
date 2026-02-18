import { describe, expect, it } from "vitest";
import { clientEnvSchema } from "@relay/shared";

describe("client env validation", () => {
  it("accepts valid client env", () => {
    const result = clientEnvSchema.safeParse({
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing NEXT_PUBLIC_APP_URL", () => {
    const result = clientEnvSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL format", () => {
    const result = clientEnvSchema.safeParse({
      NEXT_PUBLIC_APP_URL: "not-a-valid-url",
    });
    expect(result.success).toBe(false);
  });
});
