import { getGameBundle } from "./registry.js";
import type {
  GameConcept,
  RetrievalOptions,
  RetrievalResult,
  Retriever,
} from "./types.js";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length > 1);
}

function scoreConcept(concept: GameConcept, query: string, tokens: string[]): number {
  const haystacks = [
    concept.name,
    concept.id.replace(/-/g, " "),
    ...concept.aliases,
    concept.definition,
    concept.whyItWorks,
    ...(concept.communityTerms ?? []),
    ...concept.whenEffective,
    ...concept.counters.map((c) => `${c.name} ${c.explanation}`),
  ];

  const normalizedQuery = normalize(query);
  let score = 0;

  for (const hay of haystacks) {
    const normHay = normalize(hay);
    if (!normHay) continue;
    if (normalizedQuery.includes(normHay) || normHay.includes(normalizedQuery)) {
      score += 8;
    }
    for (const token of tokens) {
      if (normHay.includes(token)) score += 2;
    }
  }

  if (normalize(concept.name) === normalizedQuery) score += 20;
  return score;
}

export class KeywordRetriever implements Retriever {
  retrieve(
    gameId: string,
    query: string,
    options: RetrievalOptions = {},
  ): RetrievalResult {
    const limit = options.limit ?? 6;
    const includeRelated = options.includeRelated ?? true;
    const game = getGameBundle(gameId);
    if (!game) {
      throw new Error(`Unknown game: ${gameId}`);
    }

    const tokens = tokenize(query);
    const terminologyHits: string[] = [];
    const terminologyBoost = new Map<string, number>();

    for (const [term, conceptId] of Object.entries(game.terminology)) {
      const normTerm = normalize(term);
      const normQuery = normalize(query);
      if (normQuery.includes(normTerm) || tokens.includes(normTerm.replace(/\s+/g, ""))) {
        terminologyHits.push(term);
        terminologyBoost.set(conceptId, (terminologyBoost.get(conceptId) ?? 0) + 12);
      }
    }

    const scored = game.concepts
      .map((concept) => ({
        concept,
        score: scoreConcept(concept, query, tokens) + (terminologyBoost.get(concept.id) ?? 0),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const selected = new Map<string, GameConcept>();
    for (const entry of scored.slice(0, limit)) {
      selected.set(entry.concept.id, entry.concept);
    }

    if (includeRelated) {
      for (const concept of [...selected.values()]) {
        for (const relatedId of concept.related) {
          if (selected.size >= limit + 2) break;
          const related = game.concepts.find((c) => c.id === relatedId);
          if (related) selected.set(related.id, related);
        }
      }
    }

    const concepts = [...selected.values()].slice(0, limit + 2);

    return {
      gameId,
      query,
      metaOverview: game.metaOverview,
      concepts,
      matchedConceptIds: concepts.map((c) => c.id),
      terminologyHits,
    };
  }
}

/** Phase 4 hook: swap implementation without changing callers. */
export { EmbeddingRetriever } from "./embedding-retriever.js";

export const defaultRetriever: Retriever = new KeywordRetriever();

export function retrieve(
  gameId: string,
  query: string,
  options?: RetrievalOptions,
): RetrievalResult {
  return defaultRetriever.retrieve(gameId, query, options);
}
