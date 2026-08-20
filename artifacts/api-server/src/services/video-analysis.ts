import { readFile } from "node:fs/promises";
import { GoogleGenAI } from "@google/genai";
import { getGameBundle } from "@workspace/game-knowledge";
import {
  VISION_CONFIDENCE_THRESHOLD,
  type FighterSide,
  type GameplayEvent,
  type VisionEventLog,
} from "./vision.js";

const INLINE_MAX_BYTES = 18 * 1024 * 1024;
const DEFAULT_MODEL = "gemini-2.5-flash";

export type VideoEvidenceMode = "video" | "youtube" | "frames" | "thumbnail" | "none";

export interface TemporalVideoAnalysisInput {
  gameId: string;
  filePath?: string;
  mimeType?: string;
  youtubeUrl?: string;
  durationSeconds?: number;
  viewerSide?: "left" | "right" | "unknown";
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.GOOGLE_GEMINI_BASE_URL;
  if (baseUrl) {
    return new GoogleGenAI({
      apiKey,
      httpOptions: { baseUrl },
    });
  }

  return new GoogleGenAI({ apiKey });
}

function getVideoModel(): string {
  return process.env.GEMINI_VIDEO_MODEL ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
}

function clampConfidence(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function normalizeSide(value: unknown): FighterSide {
  const s = String(value ?? "").toLowerCase();
  if (s.includes("left")) return "left";
  if (s.includes("right")) return "right";
  return "unknown";
}

function normalizeResult(value: unknown): GameplayEvent["result"] {
  const s = String(value ?? "").toLowerCase();
  if (s === "landed" || s === "hit" || s === "connect") return "landed";
  if (s === "missed" || s === "whiff" || s === "miss") return "missed";
  if (s === "blocked" || s === "block") return "blocked";
  return "unknown";
}

function buildTemporalPrompt(input: {
  gameName: string;
  viewerSide?: string;
  durationSeconds?: number;
}): string {
  return [
    `You are analyzing ${input.gameName} gameplay VIDEO temporally — not screenshots.`,
    "Watch the full clip. Track both fighters continuously across time.",
    "",
    "REQUIREMENTS:",
    "- Follow Fighter Left and Fighter Right even when they switch sides.",
    "- Detect who is advancing, retreating, pressuring, or fighting in-and-out.",
    "- Detect punches and defense only when visible in the video sequence.",
    "- Prefer sequences over isolated moments.",
    "- Say landed/missed/blocked only when the video supports it; else unknown.",
    "- Only mark a pattern as repeated if it truly happens 3+ times.",
    "- Never invent events. If unsure, omit.",
    "- Do NOT invent FNC labels like Static Block, Controlled Cheese, or Rhythm Read.",
    "- Only use established FNC terms (Money Team defense, sidestep uppercut, power straight, push straight, pull counter, recovery punish, etc.) when the sequence clearly matches.",
    input.viewerSide && input.viewerSide !== "unknown"
      ? `- The uploader says they are Player on the ${input.viewerSide}.`
      : "- Uploader side unknown — keep left/right labels only.",
    typeof input.durationSeconds === "number"
      ? `- Clip duration approximately ${Math.round(input.durationSeconds)} seconds.`
      : "",
    "",
    "Return ONLY JSON:",
    "{",
    '  "leftAppearance": "short description",',
    '  "rightAppearance": "short description",',
    '  "matchDynamics": {',
    '    "leftStyle": "pressure|in_and_out|counter|outside|mixed|unknown",',
    '    "rightStyle": "pressure|in_and_out|counter|outside|mixed|unknown",',
    '    "summary": "1-2 sentences grounded in the video"',
    "  },",
    '  "insufficientEvidence": false,',
    '  "events": [',
    "    {",
    '      "timestampSeconds": 12.4,',
    '      "actor": "left|right|unknown",',
    '      "action": "jab|straight|hook|uppercut|body_shot|punch_unspecified|block|block_refresh|sidestep|backstep|lean_back|push|clinch|entry|retreat|sidestep_uppercut|power_straight|push_straight|pull_counter|movement",',
    '      "result": "landed|missed|blocked|unknown",',
    '      "confidence": 0.0,',
    '      "visibleEvidence": "what in the video supports this"',
    "    }",
    "  ],",
    '  "repeatedPatterns": [',
    '    { "description": "...", "count": 3, "actor": "left|right", "evidenceTimestamps": [12.4, 28.1, 41.0] }',
    "  ]",
    "}",
    "Prefer 8-25 high-confidence events spanning the clip. Omit guesses below 0.7 confidence.",
  ]
    .filter(Boolean)
    .join("\n");
}

function parseTemporalEventLog(
  raw: string,
  framesInspected: number,
  source: VisionEventLog["source"] | "video" | "youtube",
): VisionEventLog & {
  matchDynamics?: {
    leftStyle: string;
    rightStyle: string;
    summary: string;
  };
  repeatedPatterns?: Array<{
    description: string;
    count: number;
    actor: string;
    evidenceTimestamps: number[];
  }>;
} {
  const empty = {
    events: [] as GameplayEvent[],
    leftAppearance: "",
    rightAppearance: "",
    insufficientEvidence: true,
    source: source === "video" || source === "youtube" ? ("frames" as const) : source,
    framesInspected,
    confidenceThreshold: VISION_CONFIDENCE_THRESHOLD,
    matchDynamics: undefined,
    repeatedPatterns: undefined,
  };

  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return empty;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      leftAppearance?: unknown;
      rightAppearance?: unknown;
      insufficientEvidence?: unknown;
      events?: unknown;
      matchDynamics?: {
        leftStyle?: unknown;
        rightStyle?: unknown;
        summary?: unknown;
      };
      repeatedPatterns?: unknown;
    };

    const events: GameplayEvent[] = [];
    if (Array.isArray(parsed.events)) {
      for (const item of parsed.events) {
        if (!item || typeof item !== "object") continue;
        const row = item as Record<string, unknown>;
        const ts = Number(row.timestampSeconds ?? row.t);
        if (!Number.isFinite(ts) || ts < 0) continue;

        const confidence = clampConfidence(row.confidence);
        const action = String(row.action ?? "").trim().toLowerCase();
        const evidence = String(row.visibleEvidence ?? row.evidence ?? "").trim();
        if (!action || action === "unknown") continue;
        if (confidence < VISION_CONFIDENCE_THRESHOLD) continue;
        if (evidence.length < 8) continue;

        events.push({
          timestampSeconds: Number(ts.toFixed(1)),
          actor: normalizeSide(row.actor ?? row.side),
          action,
          result: normalizeResult(row.result),
          confidence,
          visibleEvidence: evidence.slice(0, 280),
        });
      }
    }

    events.sort((a, b) => a.timestampSeconds - b.timestampSeconds);

    const repeatedPatterns: Array<{
      description: string;
      count: number;
      actor: string;
      evidenceTimestamps: number[];
    }> = [];

    if (Array.isArray(parsed.repeatedPatterns)) {
      for (const item of parsed.repeatedPatterns) {
        if (!item || typeof item !== "object") continue;
        const row = item as Record<string, unknown>;
        const count = Number(row.count);
        const description = String(row.description ?? "").trim();
        if (!description || !Number.isFinite(count) || count < 3) continue;
        const stamps = Array.isArray(row.evidenceTimestamps)
          ? row.evidenceTimestamps
              .map((v) => Number(v))
              .filter((v) => Number.isFinite(v))
              .slice(0, 8)
          : [];
        if (stamps.length < 3) continue;
        repeatedPatterns.push({
          description: description.slice(0, 240),
          count,
          actor: String(row.actor ?? "unknown"),
          evidenceTimestamps: stamps,
        });
      }
    }

    return {
      events: events.slice(0, 30),
      leftAppearance: String(parsed.leftAppearance ?? "").trim().slice(0, 180),
      rightAppearance: String(parsed.rightAppearance ?? "").trim().slice(0, 180),
      insufficientEvidence:
        events.length < 3 || parsed.insufficientEvidence === true,
      source: "frames",
      framesInspected,
      confidenceThreshold: VISION_CONFIDENCE_THRESHOLD,
      matchDynamics: parsed.matchDynamics
        ? {
            leftStyle: String(parsed.matchDynamics.leftStyle ?? "unknown"),
            rightStyle: String(parsed.matchDynamics.rightStyle ?? "unknown"),
            summary: String(parsed.matchDynamics.summary ?? "").slice(0, 400),
          }
        : undefined,
      repeatedPatterns,
    };
  } catch {
    return empty;
  }
}

async function waitForFileActive(
  ai: GoogleGenAI,
  fileName: string,
  maxAttempts = 40,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const file = await ai.files.get({ name: fileName });
    const state = String(file.state ?? "");
    if (state === "ACTIVE") return;
    if (state === "FAILED") {
      throw new Error("Gemini failed to process the uploaded video file");
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error("Timed out waiting for Gemini video processing");
}

export function isGeminiVideoConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY);
}

export async function extractEventLogFromVideo(
  input: TemporalVideoAnalysisInput,
): Promise<
  VisionEventLog & {
    matchDynamics?: {
      leftStyle: string;
      rightStyle: string;
      summary: string;
    };
    repeatedPatterns?: Array<{
      description: string;
      count: number;
      actor: string;
      evidenceTimestamps: number[];
    }>;
    evidenceMode: VideoEvidenceMode;
    modelUsed?: string;
  }
> {
  const game = getGameBundle(input.gameId);
  if (!game) throw new Error(`Unknown game: ${input.gameId}`);

  const ai = getGeminiClient();
  if (!ai) {
    return {
      events: [],
      leftAppearance: "",
      rightAppearance: "",
      insufficientEvidence: true,
      source: "none",
      framesInspected: 0,
      confidenceThreshold: VISION_CONFIDENCE_THRESHOLD,
      evidenceMode: "none",
    };
  }

  const model = getVideoModel();
  const prompt = buildTemporalPrompt({
    gameName: game.manifest.name,
    viewerSide: input.viewerSide,
    durationSeconds: input.durationSeconds,
  });

  let responseText = "";
  let evidenceMode: VideoEvidenceMode = "video";
  let uploadedName: string | undefined;

  try {
    if (input.youtubeUrl) {
      evidenceMode = "youtube";
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                fileData: {
                  fileUri: input.youtubeUrl,
                  mimeType: "video/*",
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });
      responseText = response.text?.trim() ?? "";
    } else if (input.filePath) {
      const bytes = await readFile(input.filePath);
      const mimeType =
        input.mimeType && input.mimeType.startsWith("video/")
          ? input.mimeType
          : "video/mp4";

      if (bytes.length <= INLINE_MAX_BYTES) {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: bytes.toString("base64"),
                  },
                },
                { text: prompt },
              ],
            },
          ],
          config: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });
        responseText = response.text?.trim() ?? "";
      } else {
        const uploaded = await ai.files.upload({
          file: input.filePath,
          config: { mimeType },
        });
        uploadedName = uploaded.name;
        if (!uploaded.name || !uploaded.uri) {
          throw new Error("Gemini File API did not return a usable file URI");
        }
        await waitForFileActive(ai, uploaded.name);

        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                {
                  fileData: {
                    fileUri: uploaded.uri,
                    mimeType: uploaded.mimeType ?? mimeType,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          config: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });
        responseText = response.text?.trim() ?? "";
      }
    } else {
      throw new Error("No video file or YouTube URL provided");
    }
  } finally {
    if (uploadedName) {
      try {
        await ai.files.delete({ name: uploadedName });
      } catch {
        // best-effort cleanup
      }
    }
  }

  const durationHint =
    typeof input.durationSeconds === "number" && input.durationSeconds > 0
      ? Math.round(input.durationSeconds)
      : 0;

  const parsed = parseTemporalEventLog(
    responseText,
    durationHint || 1,
    evidenceMode === "youtube" ? "youtube" : "video",
  );

  return {
    ...parsed,
    evidenceMode,
    modelUsed: model,
  };
}
