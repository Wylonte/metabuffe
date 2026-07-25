import {
  GameKnowledgeService,
  getGameBundle,
  type CoachMessage,
} from "@workspace/game-knowledge";
import { createLlmClient } from "./llm.js";

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
  grade: string;
  archetype: string;
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

export async function handleAnalyze(input: {
  gameId: string;
  fileName?: string;
  durationSeconds?: number;
  observations?: string[];
}): Promise<AnalyzeResult> {
  const game = getGameBundle(input.gameId);
  if (!game) {
    throw new Error(`Unknown game: ${input.gameId}`);
  }

  const observations =
    input.observations && input.observations.length > 0
      ? input.observations
      : DEFAULT_OBSERVATIONS;

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
    grade: "B+",
    archetype: input.gameId === "fight-night" ? "Counter Puncher" : "Pressure Striker",
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
    summary: `Grounded ${game.manifest.name} analysis using competitive meta concepts: ${retrieved.matchedConceptIds.join(", ") || "general meta overview"}.`,
    conceptsUsed: retrieved.matchedConceptIds,
  };
}

function parseAnalysisResponse(
  raw: string,
  conceptsUsed: string[],
): AnalyzeResult {
  const gradeMatch = raw.match(/grade[:\s]+([A-F][+-]?)/i);
  const archetypeMatch = raw.match(/archetype[:\s]+(.+)/i);

  return {
    grade: gradeMatch?.[1] ?? "B",
    archetype: archetypeMatch?.[1]?.trim() ?? "Adaptive Fighter",
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
