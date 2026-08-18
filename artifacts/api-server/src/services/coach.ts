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
  extractEventLogFromFrames,
  formatEventLogLines,
  MIN_EVENTS_FOR_PATTERN,
  VISION_CONFIDENCE_THRESHOLD,
  type FighterSide,
  type GameplayEvent,
  type VisionEventLog,
  type VisionFrame,
} from "./vision.js";

export type CoachChatSource = "llm" | "knowledge" | "canned";
export type EvidenceMode = "frames" | "thumbnail" | "none";
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
  };
}

function linkInsufficientResult(input: {
  platform: VideoPlatform;
  title?: string;
  url: string;
}): AnalyzeResult {
  const platformLabel = input.platform === "youtube" ? "YouTube" : "Twitch";
  const matchRead = `${platformLabel} links do not give Metabuffed the gameplay video — only a preview thumbnail. We cannot detect punches, movement, who was pressuring, or who was using in-and-out movement from a still image. Upload the MP4 (Share Factory / Xbox Game DVR export) for still-frame event analysis.`;

  return emptyTape({
    matchRead,
    whatYouWereAbusing: [],
    whatTheyWereAbusing: [],
    biggestTell: "Not analyzed — no gameplay video was available.",
    staminaEconomy: "Not analyzed — stamina cannot be read from a thumbnail.",
    scoringBattle: "Not analyzed — scoring cannot be read from a thumbnail.",
    missedPunishes: [],
    metaAdjustment: [
      "Export the clip as an MP4 and use the File tab. Link analysis cannot watch the fight.",
    ],
    clipEvidence: [
      input.title ? `${platformLabel} title: ${input.title}` : `${platformLabel} URL: ${input.url}`,
      "0 verified gameplay events (thumbnail is not video).",
    ],
    summary: matchRead,
    evidenceMode: "thumbnail",
    analysisLimits:
      "Link path: oEmbed metadata + thumbnail only. No temporal video, no fighter tracking, no punch detection. Coaching from this source is disabled.",
  });
}

function insufficientFrameResult(input: {
  log: VisionEventLog;
  viewerSide: ViewerSide;
  fileName?: string;
}): AnalyzeResult {
  const lines = formatEventLogLines(input.log);
  const matchRead =
    lines.length === 0
      ? "Still frames were sampled, but no actions passed the confidence filter. Metabuffed will not invent a fight from guesses. Re-upload a clearer, closer gameplay export (HUD visible, both fighters in frame)."
      : `Only ${lines.length} verified still-frame event(s). That is not enough to call styles, pressure vs in-and-out, stamina, or repeated patterns. Showing the event log only — no guessed coaching.`;

  return emptyTape({
    matchRead,
    clipEvidence: lines,
    eventLog: input.log.events,
    evidenceMode: "frames",
    viewerSide: input.viewerSide,
    analysisLimits: `Still-frame inspection only (${input.log.framesInspected} frames). Confidence threshold ${VISION_CONFIDENCE_THRESHOLD}. No temporal video model. Pattern words require ${MIN_EVENTS_FOR_PATTERN}+ matching events.`,
    metaAdjustment: [
      "Use a longer, clearer MP4 so more stills can be sampled. Select which side you were (left/right).",
    ],
    summary: matchRead,
  });
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

  if (log.insufficientEvidence || log.events.length < 2) {
    const result = insufficientFrameResult({ log, viewerSide, fileName: input.fileName });
    return {
      ...result,
      framesAnalyzed: input.frames.length,
      visionUsed: log.events.length > 0,
    };
  }

  const observations = formatEventLogLines(log);
  if (log.leftAppearance) {
    observations.unshift(`Appearance — Player on the left: ${log.leftAppearance}`);
  }
  if (log.rightAppearance) {
    observations.unshift(`Appearance — Player on the right: ${log.rightAppearance}`);
  }

  const actionCounts = new Map<string, number>();
  for (const event of log.events) {
    const key = `${event.actor}:${event.action}`;
    actionCounts.set(key, (actionCounts.get(key) ?? 0) + 1);
  }
  const allowFrequencyClaims = [...actionCounts.values()].some(
    (count) => count >= MIN_EVENTS_FOR_PATTERN,
  );

  const result = await handleAnalyze({
    gameId: input.gameId,
    fileName: input.fileName,
    durationSeconds: input.durationSeconds,
    fileSizeBytes: input.fileSizeBytes,
    observations,
    evidenceMode: "frames",
    viewerSide,
    allowFrequencyClaims,
    eventLog: log.events,
    analysisLimits: `Still-frame inspection only (${log.framesInspected} frames, not full video). Events kept at confidence ≥ ${VISION_CONFIDENCE_THRESHOLD}. LLM may not add events. Frequency language only if an action appears ${MIN_EVENTS_FOR_PATTERN}+ times.`,
  });

  return {
    ...result,
    eventLog: log.events,
    evidenceMode: "frames",
    framesAnalyzed: input.frames.length,
    visionUsed: true,
    confidenceThreshold: VISION_CONFIDENCE_THRESHOLD,
    viewerSide,
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
  const result = linkInsufficientResult({
    platform: metadata.platform,
    title: metadata.title,
    url: metadata.canonicalUrl,
  });

  return {
    ...result,
    viewerSide: parseViewerSide(input.viewerSide),
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

  if (evidenceMode !== "frames" || observations.length === 0) {
    return emptyTape({
      matchRead:
        "No verified gameplay events. Metabuffed will not invent Fight Night analysis from a filename, duration, or thumbnail.",
      metaAdjustment: [
        "Upload an MP4 on the File tab so still frames can be inspected.",
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
        parsed.clipEvidence.length > 0 ? parsed.clipEvidence : observations.slice(0, 8),
    };
  }

  return emptyTape({
    matchRead:
      "Verified still-frame events were captured, but OPENAI_API_KEY is not set so coaching text was not generated. Event log is shown as Clip Evidence.",
    clipEvidence: observations.slice(0, 8),
    eventLog: input.eventLog ?? [],
    evidenceMode: "frames",
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
