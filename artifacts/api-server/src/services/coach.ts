import {
  GameKnowledgeService,
  getGameBundle,
  type CoachMessage,
} from "@workspace/game-knowledge";
import { createLlmClient } from "./llm.js";
import {
  resolveVideoLink,
  type VideoPlatform,
} from "./video-link.js";
import {
  extractObservationsFromFrames,
  extractObservationsFromImageUrl,
  type VisionFrame,
} from "./vision.js";

export type CoachChatSource = "llm" | "knowledge" | "canned";

export interface CoachChatResult {
  reply: string;
  conceptsUsed: string[];
  source: CoachChatSource;
}

export async function handleCoachChat(input: {
  gameId: string;
  message: string;
  history?: CoachMessage[];
}): Promise<CoachChatResult> {
  const game = getGameBundle(input.gameId);
  if (!game) {
    throw new Error(`Unknown game: ${input.gameId}`);
  }

  const trimmed = input.message.trim();
  if (!trimmed) {
    throw new Error("Message is required");
  }

  const retrieved = GameKnowledgeService.retrieve(input.gameId, trimmed);
  const conceptsUsed = retrieved.matchedConceptIds;

  const canned = GameKnowledgeService.getCompatCoachReply(input.gameId, trimmed);
  if (canned) {
    return { reply: canned, conceptsUsed, source: "canned" };
  }

  const llm = createLlmClient();
  if (llm) {
    const prompt = GameKnowledgeService.buildCoachPrompt({
      gameId: input.gameId,
      userMessage: trimmed,
      retrieved,
      history: input.history,
    });
    const reply = await llm.chat(prompt);
    return { reply, conceptsUsed, source: "llm" };
  }

  const resolved = GameKnowledgeService.resolveCoachReply(
    input.gameId,
    trimmed,
  );
  return {
    reply: resolved.reply,
    conceptsUsed: resolved.conceptsUsed,
    source: resolved.source === "canned" ? "canned" : "knowledge",
  };
}

export interface AnalyzeResult {
  strengths: string[];
  weaknesses: string[];
  summary: string;
  conceptsUsed: string[];
}

const DEFAULT_OBSERVATIONS = [
  "Opponent pressured in straight lines",
  "Stamina dipped after extended combinations",
  "Counter timing strong in early rounds",
  "Guard reset missed under body pressure",
];

function buildMetadataObservations(input: {
  fileName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  mimeType?: string;
}): string[] {
  const observations: string[] = [];

  if (input.fileName) {
    observations.push(`Footage label: ${input.fileName}`);
  }

  if (typeof input.durationSeconds === "number" && input.durationSeconds > 0) {
    const rounded = Math.round(input.durationSeconds);
    if (rounded < 45) {
      observations.push("Short highlight clip — likely one exchange or sequence");
    } else if (rounded < 180) {
      observations.push("Mid-length clip — partial round or short session");
    } else {
      observations.push("Extended match footage — multiple rounds or full session");
    }
    observations.push(`Clip duration approximately ${rounded} seconds`);
  }

  if (typeof input.fileSizeBytes === "number" && input.fileSizeBytes > 0) {
    const sizeMb = (input.fileSizeBytes / (1024 * 1024)).toFixed(1);
    observations.push(`Uploaded file size ${sizeMb} MB`);
  }

  if (input.mimeType) {
    observations.push(`Video format ${input.mimeType}`);
  }

  return observations;
}

function buildObservationsFromUpload(input: {
  fileName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  mimeType?: string;
}): string[] {
  return [...DEFAULT_OBSERVATIONS, ...buildMetadataObservations(input)];
}

function buildObservationsFromVision(input: {
  visionObservations: string[];
  metadataObservations: string[];
}): string[] {
  if (input.visionObservations.length === 0) {
    return [];
  }

  return [
    ...input.visionObservations,
    "Observations generated from sampled gameplay frames",
    ...input.metadataObservations,
  ];
}

function buildObservationsFromLink(input: {
  platform: VideoPlatform;
  url: string;
  title?: string;
  author?: string;
  visionObservations?: string[];
}): string[] {
  const platformLabel = input.platform === "youtube" ? "YouTube" : "Twitch";
  const metadata = [
    `Shared via ${platformLabel} link (console-friendly upload)`,
    `Source URL: ${input.url}`,
    input.title ? `Clip title: ${input.title}` : "",
    input.author ? `Channel or creator: ${input.author}` : "",
    "Player submitted a streaming platform clip instead of a raw file export",
  ].filter(Boolean);

  if (input.visionObservations && input.visionObservations.length > 0) {
    return [
      ...input.visionObservations,
      "Observations generated from clip preview imagery",
      ...metadata,
    ];
  }

  return [...DEFAULT_OBSERVATIONS, ...metadata];
}

export async function handleAnalyzeFrames(input: {
  gameId: string;
  fileName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  frames: VisionFrame[];
}): Promise<AnalyzeResult & { framesAnalyzed: number; visionUsed: boolean }> {
  const metadataObservations = buildMetadataObservations({
    fileName: input.fileName,
    durationSeconds: input.durationSeconds,
    fileSizeBytes: input.fileSizeBytes,
  });

  let visionObservations: string[] = [];
  try {
    visionObservations = await extractObservationsFromFrames({
      gameId: input.gameId,
      frames: input.frames,
    });
  } catch {
    visionObservations = [];
  }

  const observations =
    buildObservationsFromVision({ visionObservations, metadataObservations }) ||
    buildObservationsFromUpload({
      fileName: input.fileName,
      durationSeconds: input.durationSeconds,
      fileSizeBytes: input.fileSizeBytes,
    });

  const result = await handleAnalyze({
    gameId: input.gameId,
    fileName: input.fileName,
    durationSeconds: input.durationSeconds,
    fileSizeBytes: input.fileSizeBytes,
    observations,
  });

  return {
    ...result,
    framesAnalyzed: input.frames.length,
    visionUsed: visionObservations.length > 0,
  };
}

export async function handleAnalyzeLink(input: {
  gameId: string;
  url: string;
}): Promise<
  AnalyzeResult & {
    sourceUrl: string;
    sourcePlatform: VideoPlatform;
    sourceTitle?: string;
    visionUsed: boolean;
  }
> {
  const metadata = await resolveVideoLink(input.url);

  let visionObservations: string[] = [];
  if (metadata.thumbnailUrl) {
    try {
      visionObservations = await extractObservationsFromImageUrl({
        gameId: input.gameId,
        imageUrl: metadata.thumbnailUrl,
        context: metadata.title ? `Clip titled "${metadata.title}".` : undefined,
      });
    } catch {
      visionObservations = [];
    }
  }

  const observations = buildObservationsFromLink({
    platform: metadata.platform,
    url: metadata.canonicalUrl,
    title: metadata.title,
    author: metadata.author,
    visionObservations,
  });

  const result = await handleAnalyze({
    gameId: input.gameId,
    fileName: metadata.title ?? `${metadata.platform}-${metadata.id}`,
    observations,
  });

  return {
    ...result,
    sourceUrl: metadata.canonicalUrl,
    sourcePlatform: metadata.platform,
    sourceTitle: metadata.title,
    visionUsed: visionObservations.length > 0,
  };
}

export async function handleAnalyze(input: {
  gameId: string;
  fileName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  mimeType?: string;
  observations?: string[];
}): Promise<AnalyzeResult> {
  const game = getGameBundle(input.gameId);
  if (!game) {
    throw new Error(`Unknown game: ${input.gameId}`);
  }

  const observations =
    input.observations && input.observations.length > 0
      ? input.observations
      : buildObservationsFromUpload(input);

  const query = observations.join(" ");
  const retrieved = GameKnowledgeService.retrieve(input.gameId, query, {
    limit: 8,
  });

  const llm = createLlmClient();
  if (llm) {
    const prompt = GameKnowledgeService.buildAnalysisPrompt({
      gameId: input.gameId,
      retrieved,
      observations,
    });
    const raw = await llm.chat(prompt);
    return parseAnalysisResponse(raw, retrieved.matchedConceptIds);
  }

  const topConcepts = retrieved.concepts.slice(0, 3).map((c) => c.name);
  return {
    strengths: [
      topConcepts[0]
        ? `Strong reads around ${topConcepts[0].toLowerCase()}`
        : "Clean early-round exchanges",
      "Good discipline when not chasing",
    ],
    weaknesses: [
      topConcepts[1]
        ? `Leaks patterns around ${topConcepts[1].toLowerCase()}`
        : "Stamina collapse after combo chains",
      "Predictable reset timing under pressure",
    ],
    summary: `Grounded ${game.manifest.name} coaching feedback using competitive meta concepts: ${retrieved.matchedConceptIds.join(", ") || "general meta overview"}.`,
    conceptsUsed: retrieved.matchedConceptIds,
  };
}

function parseAnalysisResponse(
  raw: string,
  conceptsUsed: string[],
): AnalyzeResult {
  return {
    strengths: extractBullets(raw, "strength"),
    weaknesses: extractBullets(raw, "weakness"),
    summary: raw.trim(),
    conceptsUsed,
  };
}

function extractBullets(raw: string, label: string): string[] {
  const section = raw.match(new RegExp(`${label}[^\\n]*\\n([\\s\\S]*?)(\\n\\n|$)`, "i"));
  if (!section) return [];
  return section[1]
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}
