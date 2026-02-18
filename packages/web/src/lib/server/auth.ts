import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@relay/db";

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const ACCESS_COOKIE = "relay_access";
const REFRESH_COOKIE = "relay_refresh";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters");
  }
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_REFRESH_SECRET must be set and at least 32 characters");
  }
  return secret;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, getRefreshSecret()) as TokenPayload;
}

export async function setAuthCookies(payload: TokenPayload): Promise<void> {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAuthUser(): Promise<{ id: string; email: string; name: string } | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return tryRefresh();
  }

  try {
    const payload = verifyAccessToken(accessToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });
    return user;
  } catch {
    return tryRefresh();
  }
}

async function tryRefresh(): Promise<{ id: string; email: string; name: string } | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) return null;

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) return null;

    await setAuthCookies({ userId: user.id, email: user.email });
    return user;
  } catch {
    return null;
  }
}
