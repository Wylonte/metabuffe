export interface VideoFrame {
  timestampSeconds: number;
  imageBase64: string;
}

const MAX_FRAMES = 8;
const MAX_WIDTH = 640;
const JPEG_QUALITY = 0.72;

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      reject(new Error("Failed to seek video"));
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.currentTime = time;
  });
}

function stripDataUrl(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

export async function extractVideoFrames(file: File): Promise<VideoFrame[]> {
  const url = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Could not read video metadata"));
    });

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (duration <= 0) {
      throw new Error("Video duration unavailable");
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    const scale = video.videoWidth > MAX_WIDTH ? MAX_WIDTH / video.videoWidth : 1;
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

    const frames: VideoFrame[] = [];
    const sampleCount = Math.min(MAX_FRAMES, Math.max(4, Math.floor(duration / 12)));

    for (let i = 0; i < sampleCount; i++) {
      const timestamp = ((i + 1) / (sampleCount + 1)) * duration;
      await seekVideo(video, timestamp);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      frames.push({
        timestampSeconds: timestamp,
        imageBase64: stripDataUrl(dataUrl),
      });
    }

    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}
