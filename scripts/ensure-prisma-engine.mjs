#!/usr/bin/env node
// Ensure the Prisma Windows query engine DLL is copied into every pnpm-local
// .prisma/client path that the Next.js runtime expects.
//
// Background: on Windows + pnpm workspaces, Next.js server code resolves
// @prisma/client through each package's own node_modules/.pnpm/... path.
// `prisma generate` only writes the engine to the workspace root .pnpm store,
// so Next's runtime resolver fails with PrismaClientInitializationError
// ("Query Engine for runtime windows" not found) on first DB call.
//
// This script copies the engine into each sibling package path post-install.
// Safe to run repeatedly; a missing source is a no-op.

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const engineName = "query_engine-windows.dll.node";

if (process.platform !== "win32") {
  process.exit(0);
}

const rootPnpm = join(repoRoot, "node_modules", ".pnpm");
if (!existsSync(rootPnpm)) process.exit(0);

// Find the root prisma-client install that already has the DLL.
const prismaClientDirs = readdirSync(rootPnpm).filter((d) => d.startsWith("@prisma+client@"));
let sourceEngine = null;
for (const dir of prismaClientDirs) {
  const candidate = join(rootPnpm, dir, "node_modules", ".prisma", "client", engineName);
  if (existsSync(candidate)) {
    sourceEngine = candidate;
    break;
  }
}

if (!sourceEngine) {
  console.log("[ensure-prisma-engine] no source engine found, skipping");
  process.exit(0);
}

// Mirror the engine into every workspace package's node_modules/.pnpm path
// that Next's resolver will probe. We do this by cloning the root .pnpm tree
// of @prisma+client into packages/*/node_modules/.pnpm/.
const packagesDir = join(repoRoot, "packages");
if (!existsSync(packagesDir)) process.exit(0);

let copies = 0;
for (const pkg of readdirSync(packagesDir)) {
  const pkgPath = join(packagesDir, pkg);
  if (!statSync(pkgPath).isDirectory()) continue;

  for (const clientDir of prismaClientDirs) {
    const target = join(
      pkgPath,
      "node_modules",
      ".pnpm",
      clientDir,
      "node_modules",
      ".prisma",
      "client",
    );
    try {
      mkdirSync(target, { recursive: true });
      const dest = join(target, engineName);
      if (!existsSync(dest)) {
        copyFileSync(sourceEngine, dest);
        copies += 1;
      }
    } catch (err) {
      // ignore, keep going
    }
  }
}

console.log(`[ensure-prisma-engine] copied engine to ${copies} path(s)`);
