import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

function findWorkspaceRoot(startDir) {
  let dir = startDir;
  for (;;) {
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error("Could not find pnpm-workspace.yaml from " + startDir);
    }
    dir = parent;
  }
}

const workspaceRoot = findWorkspaceRoot(process.cwd());
const source = resolve(workspaceRoot, "artifacts/metabuffed/dist/public");
// Vercel outputDirectory is relative to the project Root Directory (cwd).
const target = resolve(process.cwd(), "public");

if (!existsSync(source)) {
  console.error(`Build output missing: ${source}`);
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
console.log(`Copied ${source} -> ${target}`);
