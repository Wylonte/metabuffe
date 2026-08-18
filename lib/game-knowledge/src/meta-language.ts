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
      "You are inspecting still screenshots from Fight Night Champion — NOT watching video, NOT tracking motion.",
      "Produce a verified event log only. Do not write coaching.",
      "",
      "Each image is one freeze-frame. You cannot see punches travel, stamina bars tick, or actions between frames.",
      "If punch type is not obvious from pose, use punch_unspecified.",
      "If you cannot see whether it landed, missed, or was blocked, result = unknown.",
      "Actor must be left or right from THIS frame's screen position. If you cannot tell, actor = unknown.",
      "Never output FNC meta terms (Money Team, sidestep uppercut, push straight, pull counter) unless that exact sequence is visible in the same still.",
      "Forbidden invented labels: Static Block, Controlled Cheese, Rhythm Read.",
      "Do not invent timestamps. Do not pad events to look complete.",
    ].join("\n");
  }

  return [
    "Inspect still frames only. Do not invent motion or punch results.",
    "Label fighters left/right when visible. If unsure, omit.",
  ].join("\n");
}
