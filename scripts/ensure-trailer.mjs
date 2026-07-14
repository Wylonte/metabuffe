import {
  createWriteStream,
  existsSync,
  openSync,
  readSync,
  closeSync,
  unlinkSync,
  statSync,
  mkdirSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import http from "node:http";
import https from "node:https";
import { pipeline } from "node:stream/promises";
import { spawnSync } from "node:child_process";

/** Reliable raw bytes for the LFS-tracked trailer (Dropbox pages return HTML). */
const TRAILER_URLS = [
  "https://media.githubusercontent.com/media/Wylonte/metabuffe/main/artifacts/metabuffed/public/trailer.mp4",
  "https://github.com/Wylonte/metabuffe/raw/main/artifacts/metabuffed/public/trailer.mp4",
];

function findWorkspaceRoot(startDir) {
  let dir = startDir;
  for (;;) {
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) return dir;
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
    if (asText.trimStart().startsWith("<!DOCTYPE") || asText.trimStart().startsWith("<html")) {
      return false;
    }
    return head.includes(Buffer.from("ftyp"));
  } finally {
    closeSync(fd);
  }
}

function tryGitLfsPull(workspaceRoot) {
  const result = spawnSync(
    "git",
    ["lfs", "pull", "--include=artifacts/metabuffed/public/*.mp4"],
    {
      cwd: workspaceRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  if (result.status === 0) {
    console.log("git lfs pull succeeded");
    return true;
  }
  console.warn(
    `git lfs pull skipped/failed: ${result.stderr || result.stdout || result.error}`,
  );
  return false;
}

function download(url, dest, hops = 10) {
  return new Promise((resolvePromise, reject) => {
    if (hops === 0) {
      reject(new Error("Too many redirects while downloading trailer"));
      return;
    }

    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "*/*",
        },
      },
      async (res) => {
        const status = res.statusCode ?? 0;
        if ([301, 302, 303, 307, 308].includes(status) && res.headers.location) {
          res.resume();
          const next = res.headers.location.startsWith("http")
            ? res.headers.location
            : new URL(res.headers.location, url).toString();
          try {
            await download(next, dest, hops - 1);
            resolvePromise();
          } catch (err) {
            reject(err);
          }
          return;
        }

        if (status < 200 || status >= 300) {
          res.resume();
          reject(new Error(`Failed to download trailer: HTTP ${status}`));
          return;
        }

        const contentType = String(res.headers["content-type"] || "");
        if (contentType.includes("text/html")) {
          res.resume();
          reject(new Error(`Refusing HTML response from ${url}`));
          return;
        }

        try {
          await pipeline(res, createWriteStream(dest));
          resolvePromise();
        } catch (err) {
          reject(err);
        }
      },
    );

    req.on("error", reject);
  });
}

const workspaceRoot = findWorkspaceRoot(process.cwd());
const trailerPath = resolve(
  workspaceRoot,
  "artifacts/metabuffed/public/trailer.mp4",
);
mkdirSync(dirname(trailerPath), { recursive: true });

if (isRealMp4(trailerPath)) {
  console.log(`Trailer already present: ${trailerPath}`);
  process.exit(0);
}

tryGitLfsPull(workspaceRoot);
if (isRealMp4(trailerPath)) {
  console.log(`Trailer ready after git lfs pull: ${trailerPath}`);
  process.exit(0);
}

console.log(`Fetching trailer for static deploy -> ${trailerPath}`);
if (existsSync(trailerPath)) {
  unlinkSync(trailerPath);
}

let lastError = null;
for (const url of TRAILER_URLS) {
  try {
    console.log(`Trying ${url}`);
    await download(url, trailerPath);
    if (!isRealMp4(trailerPath)) {
      throw new Error("Downloaded bytes are not a valid MP4");
    }
    console.log("Trailer download complete");
    process.exit(0);
  } catch (err) {
    lastError = err;
    console.warn(`Download failed: ${err instanceof Error ? err.message : err}`);
    if (existsSync(trailerPath)) {
      unlinkSync(trailerPath);
    }
  }
}

console.error(lastError ?? new Error("All trailer download sources failed"));
process.exit(1);
