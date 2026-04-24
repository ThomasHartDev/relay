// Public health probe. Verifies DB connectivity so post-deploy smoke tests
// can confirm the serverless function talks to Postgres before real traffic hits.
//
// GET /api/health → 200 when all checks pass, 503 when any fail.
// No auth — meant to be hit by monitors and CI.

import { NextResponse } from "next/server";
import { prisma } from "@relay/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CheckResult {
  name: string;
  ok: boolean;
  ms: number;
  detail?: string;
}

async function time<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, ms: Date.now() - start };
}

async function checkDb(): Promise<CheckResult> {
  try {
    const { ms } = await time(() => prisma.$queryRaw`SELECT 1`);
    return { name: "db", ok: true, ms };
  } catch (err) {
    return {
      name: "db",
      ok: false,
      ms: 0,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function GET() {
  const checks = [await checkDb()];
  const allOk = checks.every((c) => c.ok);
  return NextResponse.json(
    {
      ok: allOk,
      version: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
      deployment: process.env.VERCEL_DEPLOYMENT_ID ?? null,
      region: process.env.VERCEL_REGION ?? null,
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
