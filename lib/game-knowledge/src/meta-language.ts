import { getGameBundle } from "./registry.js";

export const FNC_BANNED_GENERIC_PHRASES = [
  "high guard",
  "good defense",
  "body work",
  "pressure application",
  "use of feints",
  "good combinations",
  "counter opportunities",
  "reaction time",
  "ring generalship",
  "textbook",
  "improve your guard",
  "work on feints",
  "counterpunching",
] as const;

export function getAnalysisLanguageGuide(gameId: string): string | undefined {
  const game = getGameBundle(gameId);
  const bundle = game as { analysisLanguage?: string } | undefined;
  return bundle?.analysisLanguage;
}

export function getVisionObservationInstructions(gameId: string): string {
  if (gameId === "fight-night") {
    return [
      "You are observing Fight Night Champion (FNC) gameplay — NOT real boxing.",
      "Use ONLY FNC competitive meta terms when you can see evidence.",
      "Preferred terms: Money Team defense, block refresh, static block, power straight, push straight, sidestep uppercut, straight-line pressure, straight-line retreat, recovery window, recovery punish, whiff punish, rhythm read, controlled cheese, panic offense, panic defense, stamina fraud, empty offense, round steal, scorecard manipulation.",
      "BANNED unless clearly visible and named precisely: high guard, good defense, body work, feints, reaction time, ring generalship, textbook.",
      "If unsure which mechanic is shown, say: uncertain mechanic — describe only what is visible (e.g., player holding block without movement).",
      "Each observation must name a specific behavior or FNC meta term, not generic boxing advice.",
    ].join("\n");
  }

  return [
    "Use competitive game-specific language for this title.",
    "Avoid generic real-world sports coaching clichés.",
    "If unsure, describe only what is visibly happening.",
  ].join("\n");
}
