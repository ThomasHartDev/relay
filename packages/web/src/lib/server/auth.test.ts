import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

// Mock next/headers since we can't use it in unit tests
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Mock prisma
vi.mock("@relay/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Set env vars before importing auth module
process.env.JWT_SECRET = "test-jwt-secret-that-is-at-least-32-characters-long";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-that-is-at-least-32-characters";

import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./auth";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const password = "mysecurepassword";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2")).toBe(true);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("correct-password");
    const isValid = await verifyPassword("wrong-password", hash);
    expect(isValid).toBe(false);
  });
});

describe("JWT tokens", () => {
  const payload = { userId: "user_123", email: "test@example.com" };

  beforeEach(() => {
    process.env.JWT_SECRET = "test-jwt-secret-that-is-at-least-32-characters-long";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret-that-is-at-least-32-characters";
  });

  it("signs and verifies an access token", () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it("signs and verifies a refresh token", () => {
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it("access token has 15m expiry", () => {
    const token = signAccessToken(payload);
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    const diff = decoded.exp! - decoded.iat!;
    expect(diff).toBe(15 * 60);
  });

  it("refresh token has 7d expiry", () => {
    const token = signRefreshToken(payload);
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    const diff = decoded.exp! - decoded.iat!;
    expect(diff).toBe(7 * 24 * 60 * 60);
  });

  it("rejects access token verified with refresh secret", () => {
    const accessToken = signAccessToken(payload);
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });

  it("rejects expired tokens", () => {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "0s" });
    expect(() => verifyAccessToken(token)).toThrow();
  });

  it("rejects tampered tokens", () => {
    const token = signAccessToken(payload);
    const tampered = token.slice(0, -5) + "xxxxx";
    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});
