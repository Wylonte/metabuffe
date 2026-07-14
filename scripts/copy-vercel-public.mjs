import {
  cpSync,
  rmSync,
  mkdirSync,
  existsSync,
  openSync,
  readSync,
  closeSync,
  unlinkSync,
  statSync,
} from "node:fs";
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

function isRealMp4(filePath) {
  if (!existsSync(filePath)) return false;
  const size = statSync(filePath).size;
  if (size < 1_000_000) return false;
  const fd = openSync(filePath, "r");
  try {
    const head = Buffer.alloc(64);
    readSync(fd, head, 0, 64, 0);
    const asText = head.toString("utf8");
    if (asText.startsWith("version https://git-lfs.github.com")) return false;
    return head.includes(Buffer.from("ftyp"));
  } finally {
    closeSync(fd);
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

// Never ship a Git LFS pointer as "trailer.mp4" — browsers get a 133-byte fake video.
const trailerOut = resolve(target, "trailer.mp4");
if (existsSync(trailerOut) && !isRealMp4(trailerOut)) {
  unlinkSync(trailerOut);
  console.warn(
    "Removed invalid trailer.mp4 from Vercel output (Git LFS pointer or non-MP4)",
  );
}

console.log(`Copied ${source} -> ${target}`);
