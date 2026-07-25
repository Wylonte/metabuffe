import { retrieve } from "./retrieval.js";
import { getGameBundle } from "./registry.js";
import type { CannedResponse, GameConcept } from "./types.js";

export type CoachReplySource = "canned" | "knowledge" | "fallback";

export interface ResolvedCoachReply {
  reply: string;
  conceptsUsed: string[];
  source: CoachReplySource;
}

export function findCannedResponse(
  gameId: string,
  question: string,
): CannedResponse | undefined {
  const game = getGameBundle(gameId);
  if (!game) return undefined;
  return game.cannedResponses.find((entry) => entry.question === question);
}

export function findCannedResponseByConcept(
  gameId: string,
  conceptId: string,
): CannedResponse | undefined {
  const game = getGameBundle(gameId);
  if (!game) return undefined;
  return game.cannedResponses.find((entry) => entry.conceptId === conceptId);
}

export function getCompatCoachReply(
  gameId: string,
  message: string,
): string | undefined {
  const canned = findCannedResponse(gameId, message);
  return canned?.answer;
}

function synthesizeConceptReply(
  concept: GameConcept,
  conceptsUsed: string[],
): string {
  const counterText =
    concept.counters.length > 0
      ? `\n\nHow elites counter it:\n${concept.counters.map((c) => `- ${c.name}: ${c.explanation}`).join("\n")}`
      : "";

  const overuse =
    concept.overuseSignals.length > 0
      ? `\n\nWhen it's overused:\n${concept.overuseSignals.map((s) => `- ${s}`).join("\n")}`
      : "";

  const whyItWorks =
    concept.whyItWorks && concept.whyItWorks !== concept.definition
      ? `\n\nWhy it works: ${concept.whyItWorks}`
      : "";

  return [
    concept.definition,
    whyItWorks,
    counterText,
    overuse,
    conceptsUsed.length > 1
      ? `\n\nRelated reads also in play: ${conceptsUsed.slice(1).join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("");
}

export function resolveCoachReply(
  gameId: string,
  message: string,
): ResolvedCoachReply {
  const retrieved = retrieve(gameId, message);
  const conceptsUsed = retrieved.matchedConceptIds;

  const exact = getCompatCoachReply(gameId, message);
  if (exact) {
    return { reply: exact, conceptsUsed, source: "canned" };
  }

  const topConceptId = conceptsUsed[0];
  if (topConceptId) {
    const conceptCanned = findCannedResponseByConcept(gameId, topConceptId);
    if (conceptCanned) {
      return { reply: conceptCanned.answer, conceptsUsed, source: "canned" };
    }
  }

  if (retrieved.concepts.length === 0) {
    return {
      reply: getCoachFallback(gameId),
      conceptsUsed: [],
      source: "fallback",
    };
  }

  return {
    reply: synthesizeConceptReply(retrieved.concepts[0], conceptsUsed),
    conceptsUsed,
    source: "knowledge",
  };
}

export function getCoachFallback(gameId: string): string {
  const game = getGameBundle(gameId);
  return game?.manifest.fallback ?? "Upload a match for a personalized breakdown.";
}

export function getCoachWelcome(gameId: string): string {
  const game = getGameBundle(gameId);
  return game?.manifest.welcome ?? "Welcome to Metabuffed Coach.";
}

export function getCoachPlaceholder(gameId: string): string {
  const game = getGameBundle(gameId);
  return game?.manifest.placeholder ?? "Ask the coach anything...";
}

export function getQuickQuestions(gameId: string): string[] {
  const game = getGameBundle(gameId);
  return game?.quickQuestions.map((q) => q.question) ?? [];
}
