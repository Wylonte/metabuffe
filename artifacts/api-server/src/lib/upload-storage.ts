import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function getUploadDir(): string {
  if (process.env.VERCEL) {
    const dir = join(tmpdir(), "metabuffed-uploads");
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  const dir = join(process.cwd(), "uploads");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getMaxUploadBytes(): number {
  const mb = Number(process.env.UPLOAD_MAX_MB ?? 100);
  if (!Number.isFinite(mb) || mb <= 0) return 100 * 1024 * 1024;
  return mb * 1024 * 1024;
}

export function cleanupUpload(filePath: string | undefined): void {
  if (!filePath) return;
  try {
    unlinkSync(filePath);
  } catch {
    // Best-effort temp cleanup.
  }
}
