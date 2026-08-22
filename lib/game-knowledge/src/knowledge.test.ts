import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { retrieve } from "./retrieval.js";
import {
  getCompatCoachReply,
  getCoachFallback,
  getQuickQuestions,
  resolveCoachReply,
} from "./compat.js";
import { buildCoachPrompt, buildAnalysisPrompt } from "./prompt-builder.js";
import { getGameBundle } from "./registry.js";

describe("game knowledge retrieval", () => {
  it("maps MTB slang to money-team-block", () => {
    const result = retrieve("fight-night", "How do I beat MTB?");
    assert.ok(result.matchedConceptIds.includes("money-team-block"));
  });

  it("maps sidestep uppercut phrasing", () => {
    const result = retrieve("fight-night", "sidestep uppercut timing");
    assert.ok(result.matchedConceptIds.includes("sidestep-uppercut"));
  });

  it("maps losing rounds question to scorecard concept", () => {
    const result = retrieve(
      "fight-night",
      "why do I lose rounds landing more punches",
    );
    assert.ok(result.matchedConceptIds.includes("scorecard-manipulation"));
  });

  it("returns meta overview for unknown queries without invented concept ids", () => {
    const result = retrieve("fight-night", "completely unrelated xyz123");
    assert.ok(result.metaOverview.length > 20);
    assert.equal(result.concepts.length, 0);
  });
});

describe("compat coach responses", () => {
  it("returns exact canned answer for known question", () => {
    const q = getQuickQuestions("fight-night")[0];
    const answer = getCompatCoachReply("fight-night", q);
    assert.ok(answer && answer.length > 20);
  });

  it("returns concept canned answer for slang like MTB", () => {
    const resolved = resolveCoachReply("fight-night", "How do I beat MTB?");
    assert.equal(resolved.source, "canned");
    assert.ok(resolved.conceptsUsed.includes("money-team-block"));
    assert.ok(resolved.reply.includes("Money Team system"));
    assert.equal(
      (resolved.reply.match(/attacking the rhythm/g) ?? []).length,
      1,
    );
  });

  it("has per-game fallback copy", () => {
    assert.ok(getCoachFallback("ufc6").includes("UFC 6"));
  });
});

describe("prompt builder", () => {
  it("includes voice and retrieved concepts in system prompt", () => {
    const retrieved = retrieve("fight-night", "Money Team block");
    const prompt = buildCoachPrompt({
      gameId: "fight-night",
      userMessage: "How do I beat the Money Team block?",
      retrieved,
    });
    assert.ok(prompt.system.includes("Fight Night Champion"));
    assert.ok(prompt.system.includes("money-team-block") || prompt.system.includes("Money Team"));
    assert.equal(prompt.messages.at(-1)?.content, "How do I beat the Money Team block?");
  });

  it("loads fight-night manifest voice", () => {
    const game = getGameBundle("fight-night");
    assert.ok(game?.manifest.voice.persona.includes("FNC") || game?.manifest.voice.persona.includes("Fight Night"));
    assert.ok(game?.manifest.voice.avoid.some((a) => a.includes("high guard")));
    assert.ok(game?.manifest.voice.emphasize.some((a) => a.toLowerCase().includes("money team")));
  });

  it("includes FNC analysis language guide", () => {
    const game = getGameBundle("fight-night") as { analysisLanguage?: string; coachReasoning?: string };
    assert.ok(game?.analysisLanguage?.includes("Money Team"));
    assert.ok(game?.analysisLanguage?.includes("ACCURACY"));
    assert.ok(game?.analysisLanguage?.includes("Player on the left"));
    assert.ok(game?.analysisLanguage?.includes("Static Block"));
    assert.ok(game?.coachReasoning?.includes("Master"));
  });

  it("maps recovery window terminology", () => {
    const result = retrieve("fight-night", "recovery window punish");
    assert.ok(result.matchedConceptIds.includes("recovery-window"));
  });

  it("maps whiff punish and panic offense terminology", () => {
    const whiff = retrieve("fight-night", "whiff punish timing");
    assert.ok(whiff.matchedConceptIds.includes("whiff-punish"));

    const panic = retrieve("fight-night", "panic offense after getting countered");
    assert.ok(panic.matchedConceptIds.includes("panic-offense"));
  });

  it("maps straight-line retreat separately from pressure", () => {
    const result = retrieve("fight-night", "straight line retreat under pressure");
    assert.ok(result.matchedConceptIds.includes("straight-line-retreat"));
  });

  it("loads Master Spec terms as established concepts", () => {
    const game = getGameBundle("fight-night");
    assert.ok(game?.concepts.some((c) => c.id === "static-block"));
    assert.ok(game?.concepts.some((c) => c.id === "controlled-cheese"));
    assert.ok(game?.concepts.some((c) => c.id === "rhythm-read"));
    assert.ok(game?.concepts.some((c) => c.id === "stamina-collapse"));
    assert.ok(game?.concepts.some((c) => c.id === "low-power-disadvantage"));
    assert.ok((game?.concepts.length ?? 0) >= 100);
  });

  it("chains freeform stamina collapse questions", () => {
    const result = retrieve(
      "fight-night",
      "why does my boxer feel good for three rounds then fall apart",
    );
    const ids = result.matchedConceptIds;
    assert.ok(
      ids.includes("stamina-collapse") ||
        ids.includes("stamina-fraud") ||
        ids.includes("combination-waste") ||
        ids.includes("stamina-management"),
    );
  });

  it("chains power-guy vs speed-boxer matchup questions", () => {
    const result = retrieve(
      "fight-night",
      "why can I beat people with Ali but get cooked when they use a power guy",
    );
    const ids = result.matchedConceptIds;
    assert.ok(
      ids.includes("low-power-disadvantage") ||
        ids.includes("heavy-impact-fighter") ||
        ids.includes("speed-based-fighter") ||
        ids.includes("speed-trap") ||
        ids.includes("h2h-meta"),
    );
  });

  it("includes freeform reasoning coach instructions", () => {
    const retrieved = retrieve("fight-night", "he keeps entering straight and uppercutting me");
    const prompt = buildCoachPrompt({
      gameId: "fight-night",
      userMessage: "he keeps entering straight and uppercutting me",
      retrieved,
    });
    assert.ok(prompt.system.includes("NOT a basic FAQ"));
    assert.ok(prompt.system.includes("living FNC brain") || prompt.system.includes("REASON") || prompt.system.includes("Master Spec"));
    assert.ok(prompt.system.includes("Every answer should try to identify") || prompt.system.includes("coach reasoning"));
  });

  it("builds evidence-first analysis prompt with tape sections", () => {
    const retrieved = retrieve("fight-night", "sidestep uppercut");
    const prompt = buildAnalysisPrompt({
      gameId: "fight-night",
      retrieved,
      observations: [
        "@8.2s Player on the left: linear entry behind jab-straight.",
        "@8.4s Player on the right: sidestep then immediate uppercut.",
      ],
    });
    assert.ok(prompt.system.includes("VERIFIED EVENT LOG"));
    assert.ok(prompt.system.includes("Clip Evidence"));
    assert.ok(prompt.system.includes("Player on the left") || prompt.system.includes("event log"));
    assert.ok(!prompt.system.includes("## Strengths"));
    assert.ok(prompt.system.includes("Do not invent"));
  });
});
