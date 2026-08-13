import { getGameBundle, getVisionObservationInstructions } from "@workspace/game-knowledge";

export interface VisionFrame {
  timestampSeconds: number;
  imageBase64: string;
}

const MAX_FRAMES = 8;
const MAX_FRAME_CHARS = 280_000;

function parseObservationLines(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const jsonMatch = trimmed.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 10);
      }
    }
  } catch {
    // fall through to line parsing
  }

  return trimmed
    .split("\n")
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((line) => line.length > 8)
    .slice(0, 10);
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

async function callOpenAiVision(input: {
  gameId: string;
  gameName: string;
  promptIntro: string;
  images: Array<{ label: string; source: string }>;
}): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const model =
    process.env.OPENAI_VISION_MODEL ??
    process.env.OPENAI_MODEL ??
    "gpt-4o-mini";

  const metaInstructions = getVisionObservationInstructions(input.gameId);

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string; detail: "low" } }
  > = [
    {
      type: "text",
      text: [
        `You are analyzing ${input.gameName} gameplay footage for Metabuffed.`,
        input.promptIntro,
        "",
        metaInstructions,
        "",
        "Return ONLY a JSON array of 4-8 short strings.",
        "Each string = one specific visible behavior using FNC meta terms when confident.",
        "If uncertain, describe what is visible without inventing a mechanic name.",
        'Example: ["Straight-line pressure — opponent entered on same path three times", "Static block held without refresh or counter threat"]',
      ].join("\n"),
    },
  ];

  for (const image of input.images) {
    content.push({ type: "text", text: image.label });
    content.push({
      type: "image_url",
      image_url: { url: image.source, detail: "low" },
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Vision analysis failed ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) return [];

  return parseObservationLines(raw);
}

export async function extractObservationsFromFrames(input: {
  gameId: string;
  frames: VisionFrame[];
}): Promise<string[]> {
  const game = getGameBundle(input.gameId);
  if (!game) throw new Error(`Unknown game: ${input.gameId}`);

  const frames = validateFrames(input.frames);
  const images = frames.map((frame) => ({
    label: `Gameplay frame at ${frame.timestampSeconds.toFixed(1)} seconds:`,
    source: `data:image/jpeg;base64,${frame.imageBase64}`,
  }));

  return callOpenAiVision({
    gameId: input.gameId,
    gameName: game.manifest.name,
    promptIntro:
      "These images are evenly sampled frames from the player's uploaded match footage.",
    images,
  });
}

export async function extractObservationsFromImageUrl(input: {
  gameId: string;
  imageUrl: string;
  context?: string;
}): Promise<string[]> {
  const game = getGameBundle(input.gameId);
  if (!game) throw new Error(`Unknown game: ${input.gameId}`);

  return callOpenAiVision({
    gameId: input.gameId,
    gameName: game.manifest.name,
    promptIntro: [
      "This is a thumbnail/preview image from a shared clip link.",
      input.context ?? "",
      "Infer cautiously — only state what the preview supports.",
    ]
      .filter(Boolean)
      .join(" "),
    images: [{ label: "Clip preview image:", source: input.imageUrl }],
  });
}
