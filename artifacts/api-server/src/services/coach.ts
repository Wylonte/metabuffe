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
  matchRead: string;
  whatYouWereAbusing: string[];
  whatTheyWereAbusing: string[];
  biggestTell: string;
  staminaEconomy: string;
  scoringBattle: string;
  missedPunishes: string[];
  metaAdjustment: string[];
  clipEvidence: string[];
  summary: string;
  conceptsUsed: string[];
  /** @deprecated Prefer tape sections — kept empty for older clients */
  strengths: string[];
  /** @deprecated Prefer tape sections — kept empty for older clients */
  weaknesses: string[];
}

const INSUFFICIENT_FOOTAGE_NOTE =
  "Insufficient footage observations — do not invent FNC terms or assign actions without left/right fighter evidence.";

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
  const metadata = buildMetadataObservations(input);
  return metadata.length > 0
    ? [...metadata, INSUFFICIENT_FOOTAGE_NOTE]
    : [INSUFFICIENT_FOOTAGE_NOTE];
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

  return [...metadata, INSUFFICIENT_FOOTAGE_NOTE];
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

  // Only retrieve concepts that observations actually mention — never pad with KB force-fills.
  const query = observations.join(" ");
  const retrieved = GameKnowledgeService.retrieve(input.gameId, query, {
    limit: 6,
  });

  const llm = createLlmClient();
  if (llm) {
    const prompt = GameKnowledgeService.buildAnalysisPrompt({
      gameId: input.gameId,
      retrieved,
      observations,
    });
    const raw = await llm.chat(prompt);
    return parseTapeAnalysisResponse(raw, retrieved.matchedConceptIds);
  }

  return offlineTapeFallback(observations, retrieved.matchedConceptIds);
}

function offlineTapeFallback(
  observations: string[],
  conceptsUsed: string[],
): AnalyzeResult {
  const visual = observations.filter(
    (o) =>
      /player on the (left|right)/i.test(o) ||
      /@\d/i.test(o) ||
      /sidestep|uppercut|straight|block|jab|hook|stamina/i.test(o),
  );

  const matchRead =
    visual.length > 0
      ? `Limited offline mode. Observed ${visual.length} evidence line(s) from footage. Full tape breakdown requires OPENAI_API_KEY.`
      : "Insufficient visual evidence to distinguish fighters or name mechanics. Upload clearer footage and ensure OPENAI_API_KEY is configured.";

  return {
    matchRead,
    whatYouWereAbusing: [],
    whatTheyWereAbusing: [],
    biggestTell:
      "Cannot identify a tell without confident left/right fighter observations.",
    staminaEconomy:
      "Cannot evaluate stamina economy without verified exchange evidence.",
    scoringBattle:
      "Cannot call the scoring battle without verified meaningful exchanges.",
    missedPunishes: [],
    metaAdjustment: [
      "Re-upload with clearer gameplay frames so Metabuffed can label Player on the left / Player on the right and only name mechanics that appear on screen.",
    ],
    clipEvidence: visual.slice(0, 6),
    summary: [
      matchRead,
      visual.length ? `Clip evidence:\n${visual.slice(0, 6).map((v) => `- ${v}`).join("\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    conceptsUsed,
    strengths: [],
    weaknesses: [],
  };
}

function parseTapeAnalysisResponse(
  raw: string,
  conceptsUsed: string[],
): AnalyzeResult {
  const matchRead = extractSectionProse(raw, "Match Read");
  const whatYouWereAbusing = extractSectionBullets(raw, "What You Were Abusing");
  const whatTheyWereAbusing = extractSectionBullets(
    raw,
    "What They Were Abusing",
  );
  const biggestTell = extractSectionProse(raw, "Your Biggest Tell");
  const staminaEconomy = extractSectionProse(raw, "Stamina Economy");
  const scoringBattle = extractSectionProse(raw, "Scoring Battle");
  const missedPunishes = extractSectionBullets(raw, "Missed Punishes");
  const metaAdjustment = extractSectionBullets(raw, "Meta Adjustment");
  const clipEvidence = extractSectionBullets(raw, "Clip Evidence");

  return {
    matchRead:
      matchRead ||
      "I can't confidently produce a Match Read from the available observations.",
    whatYouWereAbusing,
    whatTheyWereAbusing,
    biggestTell:
      biggestTell ||
      "No clear tell could be confirmed from the footage observations.",
    staminaEconomy:
      staminaEconomy ||
      "Stamina economy could not be confirmed from the available observations.",
    scoringBattle:
      scoringBattle ||
      "Scoring battle could not be confirmed from the available observations.",
    missedPunishes,
    metaAdjustment:
      metaAdjustment.length > 0
        ? metaAdjustment
        : [
            "Focus next match on adapting after the first repeated punish — only change what the footage clearly showed.",
          ],
    clipEvidence,
    summary: raw.trim(),
    conceptsUsed,
    strengths: [],
    weaknesses: [],
  };
}

function extractSectionBody(raw: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `##\\s*${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`,
    "i",
  );
  const match = raw.match(re);
  return match?.[1]?.trim() ?? "";
}

function extractSectionProse(raw: string, heading: string): string {
  const body = extractSectionBody(raw, heading);
  if (!body) return "";
  return body
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .join(" ")
    .trim();
}

function extractSectionBullets(raw: string, heading: string): string[] {
  const body = extractSectionBody(raw, heading);
  if (!body) return [];
  const lines = body
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
  return lines.slice(0, 8);
}
