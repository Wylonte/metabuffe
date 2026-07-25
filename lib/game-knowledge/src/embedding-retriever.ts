import type { Retriever, RetrievalOptions } from "./types.js";
import { KeywordRetriever } from "./retrieval.js";

/**
 * Phase 4 hook: swap to vector search by implementing this interface
 * and assigning `defaultRetriever` in retrieval.ts.
 */
export class EmbeddingRetriever implements Retriever {
  private readonly keyword = new KeywordRetriever();

  retrieve(gameId: string, query: string, options?: RetrievalOptions) {
    return this.keyword.retrieve(gameId, query, options);
  }
}
