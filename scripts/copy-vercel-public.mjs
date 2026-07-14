import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "artifacts/metabuffed/dist/public");
const target = resolve(root, "public");

if (!existsSync(source)) {
  console.error(`Build output missing: ${source}`);
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
console.log(`Copied ${source} -> ${target}`);
