export interface AnalyzeResult {
  grade: string;
  archetype: string;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  conceptsUsed: string[];
  uploadId?: string;
  fileName?: string;
  fileSizeBytes?: number;
  sourceUrl?: string;
  sourcePlatform?: "youtube" | "twitch";
  sourceTitle?: string;
  framesAnalyzed?: number;
  visionUsed?: boolean;
}

export async function requestGameplayAnalysis(input: {
  gameId: string;
  fileName?: string;
  durationSeconds?: number;
}): Promise<AnalyzeResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Analyze API ${response.status}`);
  }

  return (await response.json()) as AnalyzeResult;
}

export async function readVideoDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(video.duration) ? video.duration : undefined);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };

    video.src = url;
  });
}

export function uploadGameplayVideo(input: {
  gameId: string;
  file: File;
  durationSeconds?: number;
  onProgress?: (percent: number) => void;
}): Promise<AnalyzeResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();

    form.append("gameId", input.gameId);
    form.append("video", input.file);
    if (input.durationSeconds != null) {
      form.append("durationSeconds", String(input.durationSeconds));
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !input.onProgress) return;
      input.onProgress((event.loaded / event.total) * 100);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as AnalyzeResult);
        } catch {
          reject(new Error("Invalid analyze upload response"));
        }
        return;
      }

      let message = `Analyze upload failed (${xhr.status})`;
      try {
        const data = JSON.parse(xhr.responseText) as { error?: string };
        if (data.error) message = data.error;
      } catch {
        // keep default message
      }
      reject(new Error(message));
    };

    xhr.onerror = () => reject(new Error("Network error during video upload"));
    xhr.onabort = () => reject(new Error("Video upload cancelled"));

    xhr.open("POST", "/api/analyze/upload");
    xhr.send(form);
  });
}

export async function analyzeGameplayFrames(input: {
  gameId: string;
  fileName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  frames: Array<{ timestampSeconds: number; imageBase64: string }>;
}): Promise<AnalyzeResult> {
  const response = await fetch("/api/analyze/frames", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let message = `Analyze frames failed (${response.status})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // keep default
    }
    throw new Error(message);
  }

  return (await response.json()) as AnalyzeResult;
}

export async function analyzeGameplayLink(input: {
  gameId: string;
  url: string;
}): Promise<AnalyzeResult> {
  const response = await fetch("/api/analyze/link", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let message = `Analyze link failed (${response.status})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // keep default
    }
    throw new Error(message);
  }

  return (await response.json()) as AnalyzeResult;
}
