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
}): CoachPrompt {
  const game = requireGameBundle(input.gameId);
  const conceptBlock =
    input.retrieved.concepts.length > 0
      ? input.retrieved.concepts.map(formatConcept).join("\n\n")
      : "No concepts matched. Use observations only — do not invent mechanics from memory.";

  const hasObservations = input.observations.length > 0;
  const sectionList = Object.values(TAPE_SECTION_HEADERS)
    .map((h) => `## ${h}`)
    .join("\n");

  const system = [
    `You are Metabuffed — a top-level Fight Night Champion player breaking down tape for ${game.manifest.name}.`,
    game.manifest.voice.persona,
    "",
    "CORE RULE: Accuracy comes before terminology, depth, or sounding impressive.",
    "Five verified observations beat fifteen advanced-sounding guesses.",
    "",
    "PROCESS (mandatory):",
    "1. Observe exactly what happened from the observations (fighter, movement, punch, defense, result, timing).",
    "2. Confirm with confidence. If unsure — omit. Do not guess.",
    "3. Only then apply FNC terminology that describes the footage.",
    "",
    "FIGHTER IDENTITY:",
    "Every action claim must use 'Player on the left' / 'Player on the right'.",
    "Keep fighter identity consistent even if they switch sides.",
    "",
    "FORBIDDEN invented labels: Static Block, Controlled Cheese, Rhythm Read.",
    "BANNED generic boxing: high guard, good defense, feints, reaction time, ring generalship, textbook, counter opportunities.",
    "",
    "Retrieved concepts are REFERENCE ONLY for definitions.",
    "Do NOT mention a mechanic (Money Team, sidestep uppercut, push straight, pull counter, spam patterns, etc.) unless observations clearly support it.",
    "",
    "If a habit worked early then became exploitable, explain that evolution in one narrative — do not duplicate it as opposite lists.",
    "",
    "Do NOT use Strengths / Weaknesses / Coach Advice sections.",
    "Do NOT assign letter grades or numeric scores.",
    "",
    hasObservations
      ? "Ground EVERY claim in the observations below. No observation support = do not claim it."
      : "Insufficient visual evidence. State that clearly. Do not invent mechanics or filler reads.",
    "",
    "Output EXACTLY these markdown sections (use headings verbatim):",
    sectionList,
    "",
    "Under list-style sections use short evidence-backed bullets.",
    "Under prose sections write 1-3 tight paragraphs.",
    "Clip Evidence should cite timestamps from observations when present.",
    "",
    buildMetaLanguageSection(input.gameId),
    "",
    "## Meta overview (context only)",
    input.retrieved.metaOverview,
    "",
    "## Concept reference (use ONLY if observations support the mechanic)",
    conceptBlock,
    "",
    "## Observations from footage (SOURCE OF TRUTH)",
    hasObservations
      ? input.observations.map((o) => `- ${o}`).join("\n")
      : "- No specific visual observations available — say so in Match Read and keep other sections honest about limited evidence.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    system,
    messages: [
      {
        role: "user",
        content:
          "Produce the tape breakdown using only the section headings specified. Evidence first. Left/right fighters. No invented labels. No forced terminology. No Strengths/Weaknesses sections.",
      },
    ],
  };
}
