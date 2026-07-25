import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function findWorkspaceRoot(startDir: string): string {
  let dir = startDir;
  for (;;) {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
          workspaces?: unknown;
        };
        if (pkg.workspaces) return dir;
      } catch {
        // continue walking up
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir;
}

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const workspaceRoot = findWorkspaceRoot(
  resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", ".."),
);
loadEnvFile(join(workspaceRoot, ".env"));
