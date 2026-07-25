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

function loadConcepts(conceptsDir) {
  if (!existsSync(conceptsDir)) return [];
  const concepts = [];
  for (const file of readdirSync(conceptsDir)) {
    if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
    const concept = readYaml(join(conceptsDir, file));
    if (concept?.id) concepts.push(concept);
  }
  return concepts;
}

function loadGame(gameId) {
  const gameDir = join(gamesDir, gameId);
  const manifest = readYaml(join(gameDir, "manifest.yaml"));
  const metaOverview = readText(join(gameDir, "meta-overview.md"));
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
    terminology,
    quickQuestions,
    cannedResponses,
    concepts: loadConcepts(join(gameDir, "concepts")),
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
