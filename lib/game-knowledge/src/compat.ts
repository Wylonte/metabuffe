import { getGameBundle } from "./registry.js";
import type { CannedResponse } from "./types.js";

export function findCannedResponse(
  gameId: string,
  question: string,
): CannedResponse | undefined {
  const game = getGameBundle(gameId);
  if (!game) return undefined;
  return game.cannedResponses.find((entry) => entry.question === question);
}

export function getCompatCoachReply(
  gameId: string,
  message: string,
): string | undefined {
  const canned = findCannedResponse(gameId, message);
  return canned?.answer;
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
