import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const gamesDir = join(packageRoot, "games");
const outFile = join(packageRoot, "src", "generated", "knowledge.json");

function readYaml(path) {
  return parseYaml(readFileSync(path, "utf8"));
}

function readText(path) {
  return readFileSync(path, "utf8").trim();
}

function loadConceptsFromDir(conceptsDir) {
  if (!existsSync(conceptsDir)) return [];
  const concepts = [];
  for (const file of readdirSync(conceptsDir)) {
    if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
    const concept = readYaml(join(conceptsDir, file));
    if (concept?.id) concepts.push(concept);
  }
  return concepts;
}

function loadDomainMapConcepts(gameDir) {
  const domainPath = join(gameDir, "domain-map.yaml");
  if (!existsSync(domainPath)) return [];
  const parsed = readYaml(domainPath);
  if (Array.isArray(parsed)) return parsed.filter((c) => c?.id);
  if (Array.isArray(parsed?.concepts)) return parsed.concepts.filter((c) => c?.id);
  return [];
}

/** Domain map first, then per-file concepts override same id (living FNC brain). */
function loadConcepts(gameDir) {
  const byId = new Map();
  for (const concept of loadDomainMapConcepts(gameDir)) {
    byId.set(concept.id, concept);
  }
  for (const concept of loadConceptsFromDir(join(gameDir, "concepts"))) {
    byId.set(concept.id, concept);
  }
  return [...byId.values()];
}

function loadGame(gameId) {
  const gameDir = join(gamesDir, gameId);
  const manifest = readYaml(join(gameDir, "manifest.yaml"));
  const metaOverview = readText(join(gameDir, "meta-overview.md"));
  const analysisLanguage = existsSync(join(gameDir, "analysis-language.md"))
    ? readText(join(gameDir, "analysis-language.md"))
    : undefined;
  const coachReasoning = existsSync(join(gameDir, "coach-reasoning.md"))
    ? readText(join(gameDir, "coach-reasoning.md"))
    : undefined;
  const terminology = existsSync(join(gameDir, "terminology.yaml"))
    ? readYaml(join(gameDir, "terminology.yaml"))
  : {};
  const quickQuestions = existsSync(join(gameDir, "quick-questions.yaml"))
    ? readYaml(join(gameDir, "quick-questions.yaml"))
  : [];
  const cannedResponses = existsSync(join(gameDir, "canned-responses.yaml"))
    ? readYaml(join(gameDir, "canned-responses.yaml"))
  : [];

  return {
    manifest,
    metaOverview,
    analysisLanguage,
    coachReasoning,
    terminology,
    quickQuestions,
    cannedResponses,
    concepts: loadConcepts(gameDir),
  };
}

const games = {};
for (const entry of readdirSync(gamesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  games[entry.name] = loadGame(entry.name);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify({ games }, null, 2));
console.log(`Compiled knowledge for ${Object.keys(games).length} game(s) -> ${outFile}`);
