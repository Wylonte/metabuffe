import { createWriteStream, existsSync, openSync, readSync, closeSync, unlinkSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import http from "node:http";
import https from "node:https";
import { pipeline } from "node:stream/promises";

const DROPBOX_URL =
  "https://www.dropbox.com/scl/fi/4r59cf22243pxhj1h10dy/YouCut_20260629_210238477.mp4?rlkey=v8lkeufqw3n6yji5kv2l0dt23&dl=1";

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
  // Real trailer is ~77MB; LFS pointers are tiny text files.
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

function download(url, dest, hops = 8) {
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
            "Mozilla/5.0 (compatible; MetaBuffe-Builder/1.0; +vercel-build)",
          Accept: "video/mp4,video/*,*/*",
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

if (isRealMp4(trailerPath)) {
  console.log(`Trailer already present: ${trailerPath}`);
  process.exit(0);
}

console.log(`Fetching trailer for Vercel/static deploy -> ${trailerPath}`);
if (existsSync(trailerPath)) {
  unlinkSync(trailerPath);
}

try {
  await download(DROPBOX_URL, trailerPath);
  if (!isRealMp4(trailerPath)) {
    throw new Error("Downloaded trailer is not a valid MP4");
  }
  console.log("Trailer download complete");
} catch (err) {
  console.error(err);
  process.exit(1);
}
