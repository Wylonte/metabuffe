import { requireGameBundle } from "./registry.js";
import {
  getAnalysisLanguageGuide,
  TAPE_SECTION_HEADERS,
} from "./meta-language.js";
import type { CoachPrompt, CoachPromptInput, GameConcept } from "./types.js";

function formatConcept(concept: GameConcept): string {
  const counters =
    concept.counters.length > 0
      ? concept.counters
          .map((c) => `- ${c.name}: ${c.explanation}`)
          .join("\n")
      : "- (see related reads in definition)";

  return [
    `### ${concept.name} (${concept.id})`,
    `Category: ${concept.category}`,
    `Definition: ${concept.definition}`,
    `Why it works: ${concept.whyItWorks}`,
    `When effective: ${concept.whenEffective.join("; ")}`,
    `Counters: \n${counters}`,
    `Overuse signals: ${concept.overuseSignals.join("; ")}`,
    concept.related.length ? `Related: ${concept.related.join(", ")}` : "",
    concept.communityTerms?.length
      ? `Community terms: ${concept.communityTerms.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMetaLanguageSection(gameId: string): string {
  const guide = getAnalysisLanguageGuide(gameId);
  if (!guide) return "";
  return ["## FNC analysis language system (mandatory)", guide].join("\n\n");
}

export function buildCoachPrompt(input: CoachPromptInput): CoachPrompt {
  const game = requireGameBundle(input.gameId);
  const voice = game.manifest.voice;

  const conceptBlock =
    input.retrieved.concepts.length > 0
      ? input.retrieved.concepts.map(formatConcept).join("\n\n")
      : "No specific concepts matched. Use the game meta overview. If you cannot name the exact FNC mechanic, say so — do not invent one or use generic boxing language.";

  const system = [
    `You are Metabuffed Coach for ${game.manifest.name}.`,
    `Persona: ${voice.persona}`,
    "",
    "Grounding rules:",
    "- Answer ONLY using the game knowledge below and conversation context.",
    "- Sound like a top-ranked FNC community player, NOT a real-world boxing coach.",
    "- Accuracy before terminology. Never force a mechanic name without evidence from the user or footage context.",
    "- When discussing footage, label fighters as Player on the left / Player on the right.",
    "- NEVER use forbidden invented labels: Static Block, Controlled Cheese, Rhythm Read (as a formal mechanic).",
    "- NEVER use banned generic boxing language as primary analysis.",
    '- If unsure: "I can\'t confidently identify the exact mechanic from this sequence."',
    `- Avoid: ${voice.avoid.join("; ")}`,
    `- Emphasize: ${voice.emphasize.join("; ")}`,
    `- Structure: ${voice.responseStructure.join(" → ")}`,
    "",
    buildMetaLanguageSection(input.gameId),
    "",
    "## Game meta overview",
    input.retrieved.metaOverview,
    "",
    "## Retrieved concepts (REFERENCE ONLY — use definitions only when the situation matches)",
    conceptBlock,
    "",
    input.retrieved.terminologyHits.length
      ? `Terminology detected in question: ${input.retrieved.terminologyHits.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const history = input.history ?? [];
  const messages = [
    ...history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user" as const, content: input.userMessage },
  ];

  return { system, messages };
}

export function buildAnalysisPrompt(input: {
  gameId: string;
  retrieved: CoachPromptInput["retrieved"];
  observations: string[];
  evidenceMode?: "video" | "youtube" | "frames" | "thumbnail" | "none";
  viewerSide?: "left" | "right" | "unknown";
  allowFrequencyClaims?: boolean;
}): CoachPrompt {
  const game = requireGameBundle(input.gameId);
  const conceptBlock =
    input.retrieved.concepts.length > 0
      ? input.retrieved.concepts.map(formatConcept).join("\n\n")
      : "No concepts matched. Use the verified event log only — do not invent mechanics.";

  const hasObservations = input.observations.length > 0;
  const sectionList = Object.values(TAPE_SECTION_HEADERS)
    .map((h) => `## ${h}`)
    .join("\n");
  const viewerSide = input.viewerSide ?? "unknown";
  const evidenceMode = input.evidenceMode ?? "frames";
  const temporal = evidenceMode === "video" || evidenceMode === "youtube";

  const system = [
    `You are Metabuffed writing a tape note from a VERIFIED EVENT LOG for ${game.manifest.name}.`,
    temporal
      ? "The event log was produced by temporal video analysis (Gemini watched the gameplay). You may only restate those events."
      : "You may only restate events listed below. Do not invent gameplay.",
    "",
    `Evidence mode: ${evidenceMode}.`,
    evidenceMode === "thumbnail" || evidenceMode === "none"
      ? "Evidence is NOT gameplay video. Do not describe a fight. Say we could not verify events."
      : "",
    "",
    "HARD RULES:",
    "- Every factual claim must quote an event from the log (timestamp + left/right + action).",
    "- If the log does not contain it, the section must say: Not enough verified events.",
    "- Do not invent punches, movement, styles, stamina, scoring, or missed punishes.",
    "- Do not reverse who was pressing or who was moving in and out.",
    "- Do not use frequently / repeatedly / tendency / abusing / mixing unless the log has 3+ matching events or an explicit Repeated pattern line.",
    input.allowFrequencyClaims
      ? "- Frequency words are allowed only for actions that appear 3+ times in the log or listed repeated patterns."
      : "- Frequency words are BANNED for this clip (not enough repeated events).",
    viewerSide === "unknown"
      ? "- Viewer side unknown: never say you/your. Use Player on the left / Player on the right only."
      : `- The uploader is Player on the ${viewerSide}. "You" means that side only.`,
    "",
    "FORBIDDEN invented labels: Static Block, Controlled Cheese, Rhythm Read.",
    "Do NOT mention Money Team, sidestep uppercut, push straight, pull counter unless an event action matches that sequence.",
    "",
    "Do NOT use Strengths / Weaknesses / Coach Advice sections.",
    "Empty sections are better than guessed sections.",
    "",
    "Output EXACTLY these markdown sections (headings verbatim):",
    sectionList,
    "",
    "Clip Evidence must copy timestamps from the event log only.",
    "",
    buildMetaLanguageSection(input.gameId),
    "",
    "## Concept reference (definitions only — do not introduce unused terms)",
    conceptBlock,
    "",
    "## VERIFIED EVENT LOG (ONLY source of truth)",
    hasObservations
      ? input.observations.map((o) => `- ${o}`).join("\n")
      : "- No verified visual events. Every section must say Not enough verified events.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    system,
    messages: [
      {
        role: "user",
        content:
          "Write the tape note using ONLY the verified event log. If a section cannot be filled from the log, write: Not enough verified events. Do not invent a fight.",
      },
    ],
  };
}
