/**
 * Generates games/fight-night/domain-map.yaml from the Master AI Training Spec.
 * Run: node ./scripts/generate-fnc-domain-map.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CONCEPTS } from "./fnc-master-concepts.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = join(packageRoot, "games", "fight-night", "domain-map.yaml");

function yamlEscape(s) {
  const flat = String(s).replace(/\s+/g, " ").trim();
  return JSON.stringify(flat);
}

function dumpConcept(concept) {
  const lines = [];
  lines.push(`  - id: ${concept.id}`);
  lines.push(`    name: ${JSON.stringify(concept.name)}`);
  lines.push(`    aliases:`);
  for (const a of concept.aliases ?? []) lines.push(`      - ${JSON.stringify(a)}`);
  if (!(concept.aliases ?? []).length) lines.push(`      []`);
  lines.push(`    category: ${concept.category}`);
  lines.push(`    definition: ${yamlEscape(concept.definition)}`);
  lines.push(`    whyItWorks: ${yamlEscape(concept.whyItWorks)}`);
  lines.push(`    whenEffective:`);
  for (const w of concept.whenEffective ?? []) lines.push(`      - ${JSON.stringify(w)}`);
  if (!(concept.whenEffective ?? []).length) lines.push(`      []`);
  lines.push(`    counters:`);
  if (!(concept.counters ?? []).length) {
    lines.push(`      []`);
  } else {
    for (const ctr of concept.counters) {
      lines.push(`      - name: ${JSON.stringify(ctr.name)}`);
      lines.push(`        explanation: ${yamlEscape(ctr.explanation)}`);
    }
  }
  lines.push(`    overuseSignals:`);
  for (const o of concept.overuseSignals ?? []) lines.push(`      - ${JSON.stringify(o)}`);
  if (!(concept.overuseSignals ?? []).length) lines.push(`      []`);
  lines.push(`    related:`);
  for (const r of concept.related ?? []) lines.push(`      - ${r}`);
  if (!(concept.related ?? []).length) lines.push(`      []`);
  lines.push(`    communityTerms:`);
  for (const t of concept.communityTerms ?? []) lines.push(`      - ${JSON.stringify(t)}`);
  if (!(concept.communityTerms ?? []).length) lines.push(`      []`);
  return lines.join("\n");
}

const header = `# Metabuffed FNC Master AI Training Specification — domain map
# Source: client Master AI Training Spec (Final Form / Defensive Mastery / Offensive Mastery)
# Merged at compile time with concepts/*.yaml (per-file concepts override same id)
concepts:
`;

writeFileSync(outFile, header + CONCEPTS.map(dumpConcept).join("\n") + "\n");
console.log(`Wrote ${CONCEPTS.length} concepts -> ${outFile}`);
