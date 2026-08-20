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
  extractEventLogFromVideo,
  isGeminiVideoConfigured,
  type VideoEvidenceMode,
} from "./video-analysis.js";
import {
  extractEventLogFromFrames,
  formatEventLogLines,
  MIN_EVENTS_FOR_PATTERN,
  VISION_CONFIDENCE_THRESHOLD,
  type GameplayEvent,
  type VisionEventLog,
  type VisionFrame,
} from "./vision.js";

export type CoachChatSource = "llm" | "knowledge" | "canned";
export type EvidenceMode = VideoEvidenceMode;
export type ViewerSide = "left" | "right" | "unknown";

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
  strengths: string[];
  weaknesses: string[];
  eventLog?: GameplayEvent[];
  evidenceMode?: EvidenceMode;
  analysisLimits?: string;
  confidenceThreshold?: number;
  viewerSide?: ViewerSide;
  modelUsed?: string;
}

function parseViewerSide(value: unknown): ViewerSide {
  if (value === "left" || value === "right") return value;
  return "unknown";
}

function emptyTape(partial: Partial<AnalyzeResult> & { matchRead: string }): AnalyzeResult {
  return {
    matchRead: partial.matchRead,
    whatYouWereAbusing: partial.whatYouWereAbusing ?? [],
    whatTheyWereAbusing: partial.whatTheyWereAbusing ?? [],
    biggestTell: partial.biggestTell ?? "Not enough verified events.",
    staminaEconomy: partial.staminaEconomy ?? "Not enough verified events.",
    scoringBattle: partial.scoringBattle ?? "Not enough verified events.",
    missedPunishes: partial.missedPunishes ?? [],
    metaAdjustment: partial.metaAdjustment ?? [],
    clipEvidence: partial.clipEvidence ?? [],
    summary: partial.summary ?? partial.matchRead,
    conceptsUsed: partial.conceptsUsed ?? [],
    strengths: [],
    weaknesses: [],
    eventLog: partial.eventLog ?? [],
    evidenceMode: partial.evidenceMode ?? "none",
    analysisLimits: partial.analysisLimits,
    confidenceThreshold: partial.confidenceThreshold ?? VISION_CONFIDENCE_THRESHOLD,
    viewerSide: partial.viewerSide ?? "unknown",
    modelUsed: partial.modelUsed,
  };
}

function isTemporalMode(mode: EvidenceMode): boolean {
  return mode === "video" || mode === "youtube" || mode === "frames";
}

function buildObservationsFromTemporalLog(input: {
  log: VisionEventLog & {
    matchDynamics?: { leftStyle: string; rightStyle: string; summary: string };
    repeatedPatterns?: Array<{
      description: string;
      count: number;
      actor: string;
      evidenceTimestamps: number[];
    }>;
  };
}): string[] {
  const observations = formatEventLogLines(input.log);
  if (input.log.leftAppearance) {
    observations.unshift(`Appearance — Player on the left: ${input.log.leftAppearance}`);
  }
  if (input.log.rightAppearance) {
    observations.unshift(`Appearance — Player on the right: ${input.log.rightAppearance}`);
  }
  if (input.log.matchDynamics?.summary) {
    observations.unshift(
      `Match dynamics — left: ${input.log.matchDynamics.leftStyle}; right: ${input.log.matchDynamics.rightStyle}. ${input.log.matchDynamics.summary}`,
    );
  }
  for (const pattern of input.log.repeatedPatterns ?? []) {
    observations.push(
      `Repeated pattern (${pattern.count}x, ${pattern.actor}): ${pattern.description} @ ${pattern.evidenceTimestamps.map((t) => `${t.toFixed(1)}s`).join(", ")}`,
    );
  }
  return observations;
}

function allowFrequencyFromLog(log: VisionEventLog): boolean {
  const actionCounts = new Map<string, number>();
  for (const event of log.events) {
    const key = `${event.actor}:${event.action}`;
    actionCounts.set(key, (actionCounts.get(key) ?? 0) + 1);
  }
  return [...actionCounts.values()].some((count) => count >= MIN_EVENTS_FOR_PATTERN);
}

function linkInsufficientResult(input: {
  platform: VideoPlatform;
  title?: string;
  url: string;
}): AnalyzeResult {
  const platformLabel = input.platform === "youtube" ? "YouTube" : "Twitch";
  const matchRead =
    platformLabel === "YouTube"
      ? "YouTube temporal analysis is unavailable right now (missing GEMINI_API_KEY or the video could not be processed). Upload the MP4 for full temporal video analysis."
      : "Twitch links cannot be watched as video yet. Export the clip as an MP4 and use the File tab for temporal analysis.";

  return emptyTape({
    matchRead,
    metaAdjustment: [
      "Upload an MP4 (Share Factory / Xbox Game DVR export) on the File tab for temporal gameplay analysis.",
      "Set GEMINI_API_KEY so Metabuffed can watch YouTube/video with Gemini.",
    ],
    clipEvidence: [
      input.title ? `${platformLabel} title: ${input.title}` : `${platformLabel} URL: ${input.url}`,
      "0 verified gameplay events.",
    ],
    summary: matchRead,
    evidenceMode: "thumbnail",
    analysisLimits:
      "No temporal video processed. Coaching from thumbnail/metadata only is disabled.",
  });
}

function insufficientTemporalResult(input: {
  log: VisionEventLog;
  viewerSide: ViewerSide;
  evidenceMode: EvidenceMode;
  modelUsed?: string;
}): AnalyzeResult {
  const lines = formatEventLogLines(input.log);
  const matchRead =
    lines.length === 0
      ? "The video was processed, but no actions passed the confidence filter. Metabuffed will not invent a fight. Re-upload a clearer gameplay export with both fighters visible."
      : `Only ${lines.length} verified event(s) from temporal video. That is not enough for full style/pattern coaching. Showing the event log only.`;

  return emptyTape({
    matchRead,
    clipEvidence: lines,
    eventLog: input.log.events,
    evidenceMode: input.evidenceMode,
    viewerSide: input.viewerSide,
    modelUsed: input.modelUsed,
    analysisLimits: `Temporal video analysis (${input.evidenceMode}). Confidence ≥ ${VISION_CONFIDENCE_THRESHOLD}. Model: ${input.modelUsed ?? "unknown"}.`,
    metaAdjustment: [
      "Use a longer, clearer MP4 and select which side you were (left/right).",
    ],
    summary: matchRead,
  });
}

async function analyzeFromTemporalLog(input: {
  gameId: string;
  fileName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  log: VisionEventLog & {
    matchDynamics?: { leftStyle: string; rightStyle: string; summary: string };
    repeatedPatterns?: Array<{
      description: string;
      count: number;
      actor: string;
      evidenceTimestamps: number[];
    }>;
  };
  evidenceMode: EvidenceMode;
  viewerSide: ViewerSide;
  modelUsed?: string;
  analysisLimits: string;
}): Promise<AnalyzeResult> {
  if (input.log.insufficientEvidence || input.log.events.length < 3) {
    return insufficientTemporalResult({
      log: input.log,
      viewerSide: input.viewerSide,
      evidenceMode: input.evidenceMode,
      modelUsed: input.modelUsed,
    });
  }

  const observations = buildObservationsFromTemporalLog({ log: input.log });
  const result = await handleAnalyze({
    gameId: input.gameId,
    fileName: input.fileName,
    durationSeconds: input.durationSeconds,
    fileSizeBytes: input.fileSizeBytes,
    observations,
    evidenceMode: input.evidenceMode,
    viewerSide: input.viewerSide,
    allowFrequencyClaims:
      allowFrequencyFromLog(input.log) ||
      (input.log.repeatedPatterns?.length ?? 0) > 0,
    eventLog: input.log.events,
    analysisLimits: input.analysisLimits,
  });

  return {
    ...result,
    eventLog: input.log.events,
    evidenceMode: input.evidenceMode,
    modelUsed: input.modelUsed,
    confidenceThreshold: VISION_CONFIDENCE_THRESHOLD,
    viewerSide: input.viewerSide,
  };
}

export async function handleAnalyzeVideoFile(input: {
  gameId: string;
  filePath: string;
  fileName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  mimeType?: string;
  viewerSide?: ViewerSide;
}): Promise<AnalyzeResult & { visionUsed: boolean }> {
  const viewerSide = parseViewerSide(input.viewerSide);

  if (!isGeminiVideoConfigured()) {
    return {
      ...emptyTape({
        matchRead:
          "Temporal video analysis requires GEMINI_API_KEY. Without it, Metabuffed cannot watch the uploaded fight video.",
        metaAdjustment: [
          "Add GEMINI_API_KEY on the API server, then re-upload the MP4.",
        ],
        evidenceMode: "none",
        viewerSide,
        analysisLimits:
          "Video file received but Gemini is not configured. No temporal analysis ran.",
      }),
      visionUsed: false,
    };
  }

  try {
    const log = await extractEventLogFromVideo({
      gameId: input.gameId,
      filePath: input.filePath,
      mimeType: input.mimeType,
      durationSeconds: input.durationSeconds,
      viewerSide,
    });

    const result = await analyzeFromTemporalLog({
      gameId: input.gameId,
      fileName: input.fileName,
      durationSeconds: input.durationSeconds,
      fileSizeBytes: input.fileSizeBytes,
      log,
      evidenceMode: "video",
      viewerSide,
      modelUsed: log.modelUsed,
      analysisLimits: `Temporal video analysis via Gemini (${log.modelUsed ?? "gemini"}). Full gameplay video watched — not still screenshots. Events kept at confidence ≥ ${VISION_CONFIDENCE_THRESHOLD}. Coaching may only restate verified events.`,
    });

    return { ...result, visionUsed: log.events.length > 0 };
  } catch (err) {
    return {
      ...emptyTape({
        matchRead: `Temporal video analysis failed: ${err instanceof Error ? err.message : "unknown error"}. Upload again or check GEMINI_API_KEY / model access.`,
        evidenceMode: "none",
        viewerSide,
        analysisLimits: "Gemini temporal video call failed.",
        metaAdjustment: [
          "Confirm GEMINI_API_KEY and GEMINI_VIDEO_MODEL (default gemini-2.5-flash).",
        ],
      }),
      visionUsed: false,
    };
  }
}

export async function handleAnalyzeFrames(input: {
  gameId: string;
  fileName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  frames: VisionFrame[];
  viewerSide?: ViewerSide;
}): Promise<AnalyzeResult & { framesAnalyzed: number; visionUsed: boolean }> {
  const viewerSide = parseViewerSide(input.viewerSide);

  if (isGeminiVideoConfigured()) {
    const result = emptyTape({
      matchRead:
        "This request used still-frame sampling. Temporal video analysis is available — re-upload the MP4 on the File tab so Gemini can watch the full fight.",
      metaAdjustment: [
        "Use Begin Analysis with the full video file (not frame-only fallback).",
      ],
      evidenceMode: "frames",
      viewerSide,
      analysisLimits:
        "Still-frame path used while Gemini temporal video is configured. Prefer full-video upload.",
    });
    return { ...result, framesAnalyzed: input.frames.length, visionUsed: false };
  }

  let log: VisionEventLog;
  try {
    log = await extractEventLogFromFrames({
      gameId: input.gameId,
      frames: input.frames,
    });
  } catch {
    log = {
      events: [],
      leftAppearance: "",
      rightAppearance: "",
      insufficientEvidence: true,
      source: "frames",
      framesInspected: input.frames.length,
      confidenceThreshold: VISION_CONFIDENCE_THRESHOLD,
    };
  }

  const result = await analyzeFromTemporalLog({
    gameId: input.gameId,
    fileName: input.fileName,
    durationSeconds: input.durationSeconds,
    fileSizeBytes: input.fileSizeBytes,
    log,
    evidenceMode: "frames",
    viewerSide,
    analysisLimits: `Fallback still-frame inspection only (${input.frames.length} frames). Set GEMINI_API_KEY for full temporal video analysis.`,
  });

  return {
    ...result,
    framesAnalyzed: input.frames.length,
    visionUsed: log.events.length > 0,
  };
}

export async function handleAnalyzeLink(input: {
  gameId: string;
  url: string;
  viewerSide?: ViewerSide;
}): Promise<
  AnalyzeResult & {
    sourceUrl: string;
    sourcePlatform: VideoPlatform;
    sourceTitle?: string;
    visionUsed: boolean;
  }
> {
  const metadata = await resolveVideoLink(input.url);
  const viewerSide = parseViewerSide(input.viewerSide);

  if (metadata.platform === "youtube" && isGeminiVideoConfigured()) {
    try {
      const log = await extractEventLogFromVideo({
        gameId: input.gameId,
        youtubeUrl: metadata.canonicalUrl,
        viewerSide,
      });

      const result = await analyzeFromTemporalLog({
        gameId: input.gameId,
        fileName: metadata.title ?? `youtube-${metadata.id}`,
        log,
        evidenceMode: "youtube",
        viewerSide,
        modelUsed: log.modelUsed,
        analysisLimits: `Temporal YouTube video analysis via Gemini (${log.modelUsed ?? "gemini"}). Gemini watches the public YouTube video temporally. Events kept at confidence ≥ ${VISION_CONFIDENCE_THRESHOLD}.`,
      });

      return {
        ...result,
        sourceUrl: metadata.canonicalUrl,
        sourcePlatform: metadata.platform,
        sourceTitle: metadata.title,
        visionUsed: log.events.length > 0,
      };
    } catch {
      // fall through
    }
  }

  const result = linkInsufficientResult({
    platform: metadata.platform,
    title: metadata.title,
    url: metadata.canonicalUrl,
  });

  return {
    ...result,
    viewerSide,
    sourceUrl: metadata.canonicalUrl,
    sourcePlatform: metadata.platform,
    sourceTitle: metadata.title,
    visionUsed: false,
  };
}

export async function handleAnalyze(input: {
  gameId: string;
  fileName?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  mimeType?: string;
  observations?: string[];
  evidenceMode?: EvidenceMode;
  viewerSide?: ViewerSide;
  allowFrequencyClaims?: boolean;
  eventLog?: GameplayEvent[];
  analysisLimits?: string;
}): Promise<AnalyzeResult> {
  const game = getGameBundle(input.gameId);
  if (!game) {
    throw new Error(`Unknown game: ${input.gameId}`);
  }

  const evidenceMode = input.evidenceMode ?? "none";
  const viewerSide = parseViewerSide(input.viewerSide);
  const observations = input.observations ?? [];

  if (!isTemporalMode(evidenceMode) || observations.length === 0) {
    return emptyTape({
      matchRead:
        "No verified gameplay events. Metabuffed will not invent Fight Night analysis from a filename, duration, or thumbnail.",
      metaAdjustment: [
        "Upload an MP4 so Gemini can watch the fight temporally.",
      ],
      evidenceMode,
      viewerSide,
      analysisLimits:
        input.analysisLimits ??
        "No vision event log. Coaching from metadata only is disabled.",
      eventLog: input.eventLog ?? [],
    });
  }

  const query = observations.join(" ");
  const retrieved = GameKnowledgeService.retrieve(input.gameId, query, {
    limit: 4,
  });

  const llm = createLlmClient();
  if (llm) {
    const prompt = GameKnowledgeService.buildAnalysisPrompt({
      gameId: input.gameId,
      retrieved,
      observations,
      evidenceMode,
      viewerSide,
      allowFrequencyClaims: input.allowFrequencyClaims ?? false,
    });
    const raw = await llm.chat(prompt, { temperature: 0 });
    const parsed = parseTapeAnalysisResponse(raw, retrieved.matchedConceptIds);
    return {
      ...parsed,
      eventLog: input.eventLog ?? [],
      evidenceMode,
      analysisLimits: input.analysisLimits,
      confidenceThreshold: VISION_CONFIDENCE_THRESHOLD,
      viewerSide,
      clipEvidence:
        parsed.clipEvidence.length > 0 ? parsed.clipEvidence : observations.slice(0, 12),
    };
  }

  return emptyTape({
    matchRead:
      "Verified gameplay events were captured, but no coaching LLM key is set. Event log is shown as Clip Evidence.",
    clipEvidence: observations.slice(0, 12),
    eventLog: input.eventLog ?? [],
    evidenceMode,
    viewerSide,
    analysisLimits: input.analysisLimits,
    conceptsUsed: retrieved.matchedConceptIds,
  });
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
      matchRead || "Not enough verified events to produce a Match Read.",
    whatYouWereAbusing,
    whatTheyWereAbusing,
    biggestTell: biggestTell || "Not enough verified events.",
    staminaEconomy: staminaEconomy || "Not enough verified events.",
    scoringBattle: scoringBattle || "Not enough verified events.",
    missedPunishes,
    metaAdjustment,
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
  return body
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0 && !/^not enough verified events\.?$/i.test(line))
    .slice(0, 8);
}
