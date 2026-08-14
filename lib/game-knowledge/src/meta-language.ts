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

/** Invented formal labels — never output as named mechanics. */
export const FNC_FORBIDDEN_INVENTED_LABELS = [
  "static block",
  "controlled cheese",
  "rhythm read",
] as const;

export const TAPE_SECTION_KEYS = [
  "matchRead",
  "whatYouWereAbusing",
  "whatTheyWereAbusing",
  "biggestTell",
  "staminaEconomy",
  "scoringBattle",
  "missedPunishes",
  "metaAdjustment",
  "clipEvidence",
] as const;

export type TapeSectionKey = (typeof TAPE_SECTION_KEYS)[number];

export const TAPE_SECTION_HEADERS: Record<TapeSectionKey, string> = {
  matchRead: "Match Read",
  whatYouWereAbusing: "What You Were Abusing",
  whatTheyWereAbusing: "What They Were Abusing",
  biggestTell: "Your Biggest Tell",
  staminaEconomy: "Stamina Economy",
  scoringBattle: "Scoring Battle",
  missedPunishes: "Missed Punishes",
  metaAdjustment: "Meta Adjustment",
  clipEvidence: "Clip Evidence",
};

export function getAnalysisLanguageGuide(gameId: string): string | undefined {
  const game = getGameBundle(gameId);
  const bundle = game as { analysisLanguage?: string } | undefined;
  return bundle?.analysisLanguage;
}

export function getVisionObservationInstructions(gameId: string): string {
  if (gameId === "fight-night") {
    return [
      "You are observing Fight Night Champion (FNC) gameplay footage — NOT real boxing.",
      "",
      "ACCURACY FIRST:",
      "- Only report what you can clearly see. Prefer fewer correct observations over many guesses.",
      "- NEVER force FNC meta terms (sidestep uppercut, Money Team, push straight, pull counter, etc.) unless the frames clearly show that sequence.",
      "- If unsure of punch type, movement, or who acted — OMIT that claim.",
      "",
      "FIGHTER IDENTITY (mandatory):",
      "- Label every observation as 'Player on the left:' or 'Player on the right:'.",
      "- Track the same fighter across frames even if they switch sides.",
      "- Never use ambiguous 'the player' / 'the opponent' without left/right.",
      "",
      "OBSERVATION FORMAT:",
      "Include timestamp when provided. State: who → action → result. Only then optional FNC term if clearly supported.",
      "Example: '@12.4s Player on the left: steps in behind jab then straight. Player on the right: backsteps and answers with counter straight.'",
      "",
      "FORBIDDEN invented labels: Static Block, Controlled Cheese, Rhythm Read.",
      "BANNED generic boxing: high guard, good defense, feints, reaction time, ring generalship, textbook.",
      "",
      "Describe visible patterns in plain accurate language when no established term fits.",
      "Do NOT invent mechanics. Do NOT fill space with knowledge-base terms that are not on screen.",
    ].join("\n");
  }

  return [
    "Use competitive game-specific language for this title.",
    "Label fighters clearly (left/right or side) for every action.",
    "Avoid generic real-world sports coaching clichés.",
    "If unsure, describe only what is visibly happening — or omit.",
  ].join("\n");
}
