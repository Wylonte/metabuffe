import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const coachPath = join(root, "artifacts", "metabuffed", "src", "pages", "coach.tsx");
const source = readFileSync(coachPath, "utf8");

function sliceConst(name) {
  const marker = `const ${name}`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing ${name}`);
  const eq = source.indexOf("=", start);
  let i = source.indexOf("{", eq);
  let depth = 0;
  let inStr = false;
  let quote = "";
  let escaped = false;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (inStr) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = true;
      quote = ch;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        const objSrc = source.slice(source.indexOf("{", eq), i + 1);
        return Function(`"use strict"; return (${objSrc});`)();
      }
    }
  }
  throw new Error(`Unterminated ${name}`);
}

const extracted = {
  quickQuestions: sliceConst("QUICK_QUESTIONS"),
  aiResponses: sliceConst("AI_RESPONSES"),
  welcome: sliceConst("WELCOME"),
  fallback: sliceConst("FALLBACK"),
  placeholder: sliceConst("PLACEHOLDER"),
};

const outDir = join(dirname(fileURLToPath(import.meta.url)), "extracted");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "coach.json"), JSON.stringify(extracted, null, 2));
console.log("Extracted coach content to", join(outDir, "coach.json"));
