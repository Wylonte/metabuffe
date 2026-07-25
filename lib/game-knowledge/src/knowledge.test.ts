import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { retrieve } from "./retrieval.js";
import {
  getCompatCoachReply,
  getCoachFallback,
  getQuickQuestions,
  resolveCoachReply,
} from "./compat.js";
import { buildCoachPrompt } from "./prompt-builder.js";
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
    assert.ok(game?.manifest.voice.persona.includes("OWC"));
  });
});
