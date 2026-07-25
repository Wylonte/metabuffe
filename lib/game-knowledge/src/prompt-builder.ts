import { requireGameBundle } from "./registry.js";
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
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCoachPrompt(input: CoachPromptInput): CoachPrompt {
  const game = requireGameBundle(input.gameId);
  const voice = game.manifest.voice;

  const conceptBlock =
    input.retrieved.concepts.length > 0
      ? input.retrieved.concepts.map(formatConcept).join("\n\n")
      : "No specific concepts matched. Use the game meta overview and admit uncertainty for details not covered.";

  const system = [
    `You are Metabuffed Coach for ${game.manifest.name}.`,
    `Persona: ${voice.persona}`,
    "",
    "Grounding rules:",
    "- Answer ONLY using the game knowledge below and conversation context.",
    "- Sound like a top-ranked community player, not a generic real-life coach.",
    "- Explain what the concept means, why it works in this game, when it is effective, how elites counter it, and when it is overused.",
    "- If the knowledge does not cover the question, say what you would need from gameplay footage.",
    `- Avoid: ${voice.avoid.join("; ")}`,
    `- Emphasize: ${voice.emphasize.join("; ")}`,
    `- Structure: ${voice.responseStructure.join(" → ")}`,
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
  const conceptBlock = input.retrieved.concepts.map(formatConcept).join("\n\n");

  const system = [
    `You are Metabuffed analyzing ${game.manifest.name} gameplay.`,
    game.manifest.voice.persona,
    "",
    "Produce a competitive breakdown: grade, archetype, strengths, weaknesses, and actionable meta reads.",
    "Ground every claim in the observations and knowledge below.",
    "",
    "## Meta overview",
    input.retrieved.metaOverview,
    "",
    "## Relevant concepts",
    conceptBlock,
    "",
    "## Observations from footage",
    input.observations.map((o) => `- ${o}`).join("\n"),
  ].join("\n");

  return {
    system,
    messages: [
      {
        role: "user",
        content: "Generate the match analysis breakdown.",
      },
    ],
  };
}
