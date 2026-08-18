import { getGameBundle, getVisionObservationInstructions } from "@workspace/game-knowledge";

export interface VisionFrame {
  timestampSeconds: number;
  imageBase64: string;
}

export type FighterSide = "left" | "right" | "unknown";
export type ActionResult = "landed" | "missed" | "blocked" | "unknown";

export interface GameplayEvent {
  timestampSeconds: number;
  actor: FighterSide;
  action: string;
  result: ActionResult;
  confidence: number;
  visibleEvidence: string;
}

export interface VisionEventLog {
  events: GameplayEvent[];
  leftAppearance: string;
  rightAppearance: string;
  insufficientEvidence: boolean;
  source: "frames" | "thumbnail" | "none";
  framesInspected: number;
  confidenceThreshold: number;
}

export const VISION_CONFIDENCE_THRESHOLD = 0.7;
export const MIN_EVENTS_FOR_PATTERN = 3;
const MAX_FRAMES = 8;
const MAX_FRAME_CHARS = 280_000;

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

function normalizeResult(value: unknown): ActionResult {
  const s = String(value ?? "").toLowerCase();
  if (s === "landed" || s === "hit" || s === "connect") return "landed";
  if (s === "missed" || s === "whiff" || s === "miss") return "missed";
  if (s === "blocked" || s === "block") return "blocked";
  return "unknown";
}

function parseEventLog(raw: string, frames: VisionFrame[]): VisionEventLog {
  const empty: VisionEventLog = {
    events: [],
    leftAppearance: "",
    rightAppearance: "",
    insufficientEvidence: true,
    source: "frames",
    framesInspected: frames.length,
    confidenceThreshold: VISION_CONFIDENCE_THRESHOLD,
  };

  const trimmed = raw.trim();
  if (!trimmed) return empty;

  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return empty;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      leftAppearance?: unknown;
      rightAppearance?: unknown;
      insufficientEvidence?: unknown;
      events?: unknown;
    };

    const allowedTs = new Set(
      frames.map((f) => Number(f.timestampSeconds.toFixed(1))),
    );

    const events: GameplayEvent[] = [];
    if (Array.isArray(parsed.events)) {
      for (const item of parsed.events) {
        if (!item || typeof item !== "object") continue;
        const row = item as Record<string, unknown>;
        const ts = Number(row.timestampSeconds ?? row.t);
        if (!Number.isFinite(ts)) continue;

        const nearest = frames.reduce((best, frame) => {
          const d = Math.abs(frame.timestampSeconds - ts);
          return d < Math.abs(best.timestampSeconds - ts) ? frame : best;
        }, frames[0]);

        const snapped = Number(nearest.timestampSeconds.toFixed(1));
        if (allowedTs.size > 0 && ![...allowedTs].some((t) => Math.abs(t - snapped) < 0.6)) {
          continue;
        }

        const confidence = clampConfidence(row.confidence);
        const action = String(row.action ?? "").trim().toLowerCase();
        const evidence = String(row.visibleEvidence ?? row.evidence ?? "").trim();
        if (!action || action === "unknown") continue;
        if (confidence < VISION_CONFIDENCE_THRESHOLD) continue;
        if (evidence.length < 8) continue;

        events.push({
          timestampSeconds: snapped,
          actor: normalizeSide(row.actor ?? row.side),
          action,
          result: normalizeResult(row.result),
          confidence,
          visibleEvidence: evidence.slice(0, 220),
        });
      }
    }

    events.sort((a, b) => a.timestampSeconds - b.timestampSeconds);

    return {
      events: events.slice(0, 12),
      leftAppearance: String(parsed.leftAppearance ?? "").trim().slice(0, 180),
      rightAppearance: String(parsed.rightAppearance ?? "").trim().slice(0, 180),
      insufficientEvidence:
        events.length < 2 || parsed.insufficientEvidence === true,
      source: "frames",
      framesInspected: frames.length,
      confidenceThreshold: VISION_CONFIDENCE_THRESHOLD,
    };
  } catch {
    return empty;
  }
}

function validateFrames(frames: VisionFrame[]): VisionFrame[] {
  if (!Array.isArray(frames) || frames.length === 0) {
    throw new Error("At least one gameplay frame is required");
  }

  if (frames.length > MAX_FRAMES) {
    throw new Error(`Too many frames (max ${MAX_FRAMES})`);
  }

  return frames.map((frame, index) => {
    if (
      typeof frame.timestampSeconds !== "number" ||
      !Number.isFinite(frame.timestampSeconds)
    ) {
      throw new Error(`Frame ${index + 1} is missing a valid timestamp`);
    }

    const imageBase64 = frame.imageBase64?.trim();
    if (!imageBase64 || imageBase64.length > MAX_FRAME_CHARS) {
      throw new Error(`Frame ${index + 1} image is missing or too large`);
    }

    return {
      timestampSeconds: frame.timestampSeconds,
      imageBase64,
    };
  });
}

async function callOpenAiVisionJson(input: {
  gameId: string;
  gameName: string;
  promptIntro: string;
  images: Array<{ label: string; source: string }>;
  frames: VisionFrame[];
}): Promise<VisionEventLog> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      events: [],
      leftAppearance: "",
      rightAppearance: "",
      insufficientEvidence: true,
      source: "frames",
      framesInspected: input.frames.length,
      confidenceThreshold: VISION_CONFIDENCE_THRESHOLD,
    };
  }

  const preferred =
    process.env.OPENAI_VISION_MODEL ??
    "gpt-4o";
  const fallback = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const models = preferred === fallback ? [preferred] : [preferred, fallback];

  const metaInstructions = getVisionObservationInstructions(input.gameId);
  const timestamps = input.frames
    .map((f) => f.timestampSeconds.toFixed(1))
    .join(", ");

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string; detail: "high" } }
  > = [
    {
      type: "text",
      text: [
        `You are a still-frame inspector for ${input.gameName}. You are NOT watching video.`,
        input.promptIntro,
        "",
        metaInstructions,
        "",
        `Frame timestamps you may cite (seconds): ${timestamps}`,
        "You may ONLY use those timestamps. Do not invent others.",
        "",
        "HARD LIMITS:",
        "- These are disconnected stills. You cannot see motion, punch speed, or what happened between frames.",
        "- Do not infer jab vs straight vs hook vs uppercut unless the pose in THAT still is obvious. Otherwise action = punch_unspecified.",
        "- Do not infer landed/missed/blocked unless contact or a clear miss pose is visible. Otherwise result = unknown.",
        "- Do not say frequently/repeatedly. Each still is one possible event.",
        "- Do not invent fighter styles, stamina, scorecards, or patterns from one pose.",
        "- If you cannot tell who is who, actor = unknown and set insufficientEvidence true.",
        "",
        "Return ONLY JSON:",
        "{",
        '  "leftAppearance": "short visual description or empty",',
        '  "rightAppearance": "short visual description or empty",',
        '  "insufficientEvidence": true/false,',
        '  "events": [',
        "    {",
        '      "timestampSeconds": 12.4,',
        '      "actor": "left" | "right" | "unknown",',
        '      "action": "jab|straight|hook|uppercut|body_shot|punch_unspecified|block|sidestep|backstep|lean_back|clinch|push|movement",',
        '      "result": "landed|missed|blocked|unknown",',
        '      "confidence": 0.0,',
        '      "visibleEvidence": "what in this still supports the claim"',
        "    }",
        "  ]",
        "}",
        "Prefer 0-6 high-confidence events. Omit guesses below 0.7 confidence.",
      ].join("\n"),
    },
  ];

  for (const image of input.images) {
    content.push({ type: "text", text: image.label });
    content.push({
      type: "image_url",
      image_url: { url: image.source, detail: "high" },
    });
  }

  let lastError = "";
  for (const model of models) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      lastError = await response.text();
      continue;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return parseEventLog("", input.frames);
    }

    return parseEventLog(raw, input.frames);
  }

  throw new Error(`Vision analysis failed: ${lastError || "no vision model available"}`);
}

export function formatEventLogLines(log: VisionEventLog): string[] {
  return log.events.map((event) => {
    const t = event.timestampSeconds.toFixed(1);
    const actor =
      event.actor === "unknown"
        ? "Unknown fighter"
        : `Player on the ${event.actor}`;
    return `@${t}s ${actor}: ${event.action} — ${event.result} (confidence ${event.confidence.toFixed(2)}) — ${event.visibleEvidence}`;
  });
}

export async function extractEventLogFromFrames(input: {
  gameId: string;
  frames: VisionFrame[];
}): Promise<VisionEventLog> {
  const game = getGameBundle(input.gameId);
  if (!game) throw new Error(`Unknown game: ${input.gameId}`);

  const frames = validateFrames(input.frames);
  const images = frames.map((frame) => ({
    label: `STILL FRAME at ${frame.timestampSeconds.toFixed(1)} seconds (not video):`,
    source: `data:image/jpeg;base64,${frame.imageBase64}`,
  }));

  return callOpenAiVisionJson({
    gameId: input.gameId,
    gameName: game.manifest.name,
    promptIntro:
      "Inspect each still independently. Do not stitch a fight narrative across frames unless the same pose evidence is visible in that still.",
    images,
    frames,
  });
}

/** @deprecated Thumbnail stills cannot produce a fight event log. */
export async function extractObservationsFromImageUrl(): Promise<string[]> {
  return [];
}

export async function extractObservationsFromFrames(input: {
  gameId: string;
  frames: VisionFrame[];
}): Promise<string[]> {
  const log = await extractEventLogFromFrames(input);
  return formatEventLogLines(log);
}
