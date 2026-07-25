import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify as stringifyYaml } from "yaml";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const extracted = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "extracted", "coach.json"), "utf8"),
);

const QUESTION_CONCEPT_MAP = {
  "fight-night": {
    "How do I beat the Money Team block?": "money-team-block",
    "How do I actually do the Money Team block?": "money-team-block",
    "Why do I keep losing rounds after landing more punches?": "scorecard-manipulation",
    "Should I hold block or tap block?": "money-team-block",
    "Why is the power straight so broken?": "power-straight",
    "When should I use the sidestep uppercut?": "sidestep-uppercut",
    "What is push straight spam and how do I beat it?": "back-step-straight",
    "Why do elite players barely throw combinations?": "rhythm-manipulation",
    "What is the best OWC style?": "owc-meta",
    "Why are fighters without power punches at a disadvantage?": "power-straight",
    "What is rhythm manipulation?": "rhythm-manipulation",
    "What is the Fear Loop?": "fear-loop",
    "How do I preserve stamina for later rounds?": "stamina-management",
    "How do I know when my opponent is tired?": "stamina-management",
    "What is controlled cheese?": "controlled-cheese",
    "What is scorecard manipulation?": "scorecard-manipulation",
    "How do I beat pressure fighters?": "inside-fighting",
    "How do I beat body spam?": "body-spam",
    "How do I know when my opponent is mentally breaking?": "fear-loop",
    "What separates top players from world-class players?": "reads-meta",
  },
  ufc6: {
    "What is the current striking meta?": "striking-meta",
    "How do I improve my head movement?": "head-movement",
    "How do I stop pressure fighters?": "pressure-defense",
    "How do I win the stamina battle?": "stamina-battle",
    "How do I become better on the ground?": "ground-game",
    "How do I stop takedowns?": "takedown-defense",
    "How do I escape bad ground positions?": "ground-escapes",
    "How do I beat counter strikers?": "counter-striking",
    "How do elite players think?": "elite-reads",
    "What should Metabuffed analyze?": "analysis-priorities",
    "How do I become unpredictable?": "unpredictability",
    "How do I cut off runners?": "cage-cutting",
    "How do I defend body attacks?": "body-defense",
    "How do I land more counters?": "counter-timing",
    "When should I wrestle?": "wrestling-timing",
    "How do I dominate from top position?": "top-control",
    "How do I survive when rocked?": "rocked-survival",
    "What separates Division 20 players?": "division-20",
    "Why do I lose close fights?": "close-fights",
    "How do I improve the fastest?": "improvement-loop",
  },
};

const GAME_META = {
  "fight-night": {
    id: "fight-night",
    name: "Fight Night Champion",
    shortName: "Fight Night",
    active: true,
    coachEnabled: true,
    locked: false,
    allowExploits: true,
    voice: {
      persona: "Underground OWC/H2H meta analyst for Fight Night Champion",
      avoid: [
        "generic real-world boxing coaching",
        "vague motivational advice",
        "ignoring FNC scorecard mechanics",
      ],
      emphasize: [
        "OWC builds",
        "stamina",
        "rhythm manipulation",
        "scorecard manipulation",
        "controlled cheese",
        "Money Team block meta",
      ],
      responseStructure: [
        "direct competitive read",
        "why it works in FNC",
        "how top players counter it",
        "when it is overused",
      ],
    },
    metaOverview: `Fight Night Champion competitive meta is built around impact scoring, stamina wars, and rhythm control — not punch totals. Elite OWC/H2H play centers on Money Team block rhythms, power straight timing, sidestep uppercuts, body work, and scorecard manipulation in the final 20–30 seconds of close rounds. Top players win meaningful moments, control timing, and punish commitment rather than chasing volume.`,
    terminology: {
      mtb: "money-team-block",
      "money team": "money-team-block",
      shell: "money-team-block",
      "power straight": "power-straight",
      "sidestep uppercut": "sidestep-uppercut",
      "push straight": "back-step-straight",
      "body spam": "body-spam",
      cheese: "controlled-cheese",
      "fear loop": "fear-loop",
      owc: "owc-meta",
    },
  },
  ufc6: {
    id: "ufc6",
    name: "UFC 6",
    shortName: "UFC 6",
    active: true,
    coachEnabled: true,
    locked: false,
    allowExploits: false,
    voice: {
      persona: "Division-level UFC 6 competitive meta coach",
      avoid: [
        "generic MMA advice without game context",
        "highlight-reel swing advice",
        "ignoring stamina and cage control",
      ],
      emphasize: [
        "stamina as a second health bar",
        "exchange control",
        "cage cutting",
        "adaptation between rounds",
        "discipline under pressure",
      ],
      responseStructure: [
        "META OVERVIEW",
        "HOW TO EXECUTE",
        "COMMON MISTAKES",
        "METABUFFED VERDICT",
      ],
    },
    metaOverview: `UFC 6 competitive meta rewards efficient striking, stamina management, and cage IQ over volume. Elite players control exchanges, mix head and body threats, punish habits, and adapt every round. Division 20 play is defined by discipline, defensive reads, and making opponents restart their offense repeatedly.`,
    terminology: {
      "div 20": "division-20",
      "head movement": "head-movement",
      "body shots": "body-defense",
      "takedown defense": "takedown-defense",
      "top control": "top-control",
    },
  },
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function firstParagraph(text) {
  return text.split("\n\n")[0]?.trim() ?? text.trim();
}

function bootstrapGame(gameId) {
  const meta = GAME_META[gameId];
  const gameDir = join(packageRoot, "games", gameId);
  const conceptsDir = join(gameDir, "concepts");
  mkdirSync(conceptsDir, { recursive: true });

  const manifest = {
    ...meta,
    welcome: extracted.welcome[gameId],
    fallback: extracted.fallback[gameId],
    placeholder: extracted.placeholder[gameId],
  };

  writeFileSync(join(gameDir, "manifest.yaml"), stringifyYaml(manifest));
  writeFileSync(join(gameDir, "meta-overview.md"), meta.metaOverview);
  writeFileSync(join(gameDir, "terminology.yaml"), stringifyYaml(meta.terminology));

  const questions = extracted.quickQuestions[gameId];
  const responses = extracted.aiResponses[gameId];
  const conceptMap = QUESTION_CONCEPT_MAP[gameId];

  const quickQuestions = questions.map((question) => ({
    question,
    conceptId: conceptMap[question] ?? slugify(question),
  }));
  writeFileSync(join(gameDir, "quick-questions.yaml"), stringifyYaml(quickQuestions));

  const cannedResponses = questions.map((question) => ({
    question,
    conceptId: conceptMap[question] ?? slugify(question),
    answer: responses[question],
  }));
  writeFileSync(join(gameDir, "canned-responses.yaml"), stringifyYaml(cannedResponses));

  const seenConcepts = new Set();
  for (const item of cannedResponses) {
    if (seenConcepts.has(item.conceptId)) continue;
    seenConcepts.add(item.conceptId);

    const relatedAnswers = cannedResponses.filter((r) => r.conceptId === item.conceptId);
    const name = relatedAnswers[0].question.replace(/^(How do I |What is |Why |When should I )/i, "").replace(/\?$/, "");
    const definition = firstParagraph(relatedAnswers[0].answer);

    const concept = {
      id: item.conceptId,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      aliases: [item.conceptId.replace(/-/g, " ")],
      category: item.conceptId.includes("meta") ? "meta" : "strategy",
      definition,
      whyItWorks: definition,
      whenEffective: ["When opponent shows predictable patterns", "In ranked/OWC high-level exchanges"],
      counters: [],
      overuseSignals: ["Repeating the same read without adaptation", "Forcing the technique when stamina is low"],
      related: [],
      communityTerms: [],
    };

    writeFileSync(
      join(conceptsDir, `${item.conceptId}.yaml`),
      stringifyYaml(concept),
    );
  }
}

for (const gameId of Object.keys(GAME_META)) {
  bootstrapGame(gameId);
}
console.log("Bootstrapped game knowledge YAML files");
