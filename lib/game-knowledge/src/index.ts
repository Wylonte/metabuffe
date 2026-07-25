export * from "./types.js";
export * from "./registry.js";
export * from "./retrieval.js";
export * from "./embedding-retriever.js";
export * from "./compat.js";
export * from "./prompt-builder.js";

import { retrieve } from "./retrieval.js";
import { buildCoachPrompt, buildAnalysisPrompt } from "./prompt-builder.js";
import { getCompatCoachReply, getCoachFallback } from "./compat.js";

export const GameKnowledgeService = {
  retrieve,
  buildCoachPrompt,
  buildAnalysisPrompt,
  getCompatCoachReply,
  getCoachFallback,
};
