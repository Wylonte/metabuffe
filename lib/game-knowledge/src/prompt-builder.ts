import { requireGameBundle } from "./registry.js";
import { getAnalysisLanguageGuide } from "./meta-language.js";
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
  return ["## FNC meta language system (mandatory)", guide].join("\n\n");
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
    "- Name specific FNC meta terms (Money Team defense, recovery punish, straight-line pressure, etc.).",
    "- NEVER use banned generic terms as your primary analysis.",
    "- If footage/knowledge does not support a specific mechanic, say: \"I can't confidently identify the exact mechanic from this sequence.\"",
    "- Explain what happened, the FNC meta term, why it works in FNC, the read, how to stop/punish, and whether the player adapted.",
    `- Avoid: ${voice.avoid.join("; ")}`,
    `- Emphasize: ${voice.emphasize.join("; ")}`,
    `- Structure: ${voice.responseStructure.join(" → ")}`,
    "",
    buildMetaLanguageSection(input.gameId),
    "",
    "## Game meta overview",
    input.retrieved.metaOverview,
    "",
    "## Retrieved concepts",
    conceptBlock,
    "",
    input.retrieved.terminologyHits.length
      ? `Terminology detected: ${input.retrieved.terminologyHits.join(", ")}`
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
}): CoachPrompt {
  const game = requireGameBundle(input.gameId);
  const conceptBlock =
    input.retrieved.concepts.length > 0
      ? input.retrieved.concepts.map(formatConcept).join("\n\n")
      : "No specific concepts matched retrieval. Use observations only — do not invent mechanics.";

  const hasObservations = input.observations.length > 0;

  const system = [
    `You are Metabuffed analyzing ${game.manifest.name} gameplay.`,
    game.manifest.voice.persona,
    "",
    "CRITICAL: Use Fight Night Champion competitive meta terminology ONLY.",
    "Do NOT analyze like a real-world boxing trainer.",
    "Do NOT assign letter grades, numeric scores, or archetype labels.",
    "",
    "BANNED generic primary language: high guard, good defense, body work, feints, good combinations, counter opportunities, reaction time, ring generalship, textbook.",
    "",
    "For each strength and weakness bullet:",
    "- Name the specific FNC mechanic or behavior (Money Team defense, block refresh, recovery punish, straight-line pressure, sidestep uppercut, etc.)",
    "- Explain the game-specific interaction and what read created it",
    "- Include how to stop/punish when relevant",
    "- Note adaptation failure if the same mistake repeated",
    "",
    hasObservations
      ? "Ground EVERY claim in the observations below. Do not claim mechanics not supported by observations."
      : "Limited footage data available. Be conservative. Say when you cannot confidently identify the exact mechanic.",
    "",
    "Format:",
    "## Strengths",
    "- (FNC meta term + specific read)",
    "## Weaknesses",
    "- (FNC meta term + specific read + adaptation note if repeated)",
    "## Summary",
    "(Actionable meta advice in FNC language — no generic boxing coaching)",
    "",
    buildMetaLanguageSection(input.gameId),
    "",
    "## Meta overview",
    input.retrieved.metaOverview,
    "",
    "## Relevant concepts",
    conceptBlock,
    "",
    "## Observations from footage",
    hasObservations
      ? input.observations.map((o) => `- ${o}`).join("\n")
      : "- No specific visual observations available — provide conservative meta guidance only and state uncertainty.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    system,
    messages: [
      {
        role: "user",
        content:
          "Generate FNC meta coaching feedback (Strengths, Weaknesses, Summary). Use community terminology from the meta language system. No grades. No generic boxing language.",
      },
    ],
  };
}
