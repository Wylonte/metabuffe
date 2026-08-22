export type ConceptCategory =
  | "mechanic"
  | "terminology"
  | "meta"
  | "strategy"
  | "counterplay"
  | "matchup"
  | "technique"
  | "exploit";

export interface ConceptCounter {
  name: string;
  explanation: string;
}

export interface PatchNote {
  version?: string;
  date?: string;
  note: string;
}

export interface GameConcept {
  id: string;
  name: string;
  aliases: string[];
  category: ConceptCategory;
  definition: string;
  whyItWorks: string;
  whenEffective: string[];
  counters: ConceptCounter[];
  overuseSignals: string[];
  related: string[];
  patchNotes?: PatchNote[];
  communityTerms?: string[];
}

export interface GameVoice {
  persona: string;
  avoid: string[];
  emphasize: string[];
  responseStructure: string[];
}

export interface GameManifest {
  id: string;
  name: string;
  shortName: string;
  active: boolean;
  coachEnabled: boolean;
  locked: boolean;
  allowExploits: boolean;
  lastReviewed?: string;
  voice: GameVoice;
  welcome: string;
  fallback: string;
  placeholder: string;
}

export interface CannedResponse {
  question: string;
  answer: string;
  conceptId: string;
}

export interface QuickQuestion {
  question: string;
  conceptId: string;
}

export interface GameKnowledgeBundle {
  manifest: GameManifest;
  metaOverview: string;
  terminology: Record<string, string>;
  quickQuestions: QuickQuestion[];
  cannedResponses: CannedResponse[];
  concepts: GameConcept[];
  analysisLanguage?: string;
  coachReasoning?: string;
}

export interface KnowledgeBundle {
  games: Record<string, GameKnowledgeBundle>;
}

export interface RetrievalOptions {
  limit?: number;
  includeRelated?: boolean;
}

export interface RetrievalResult {
  gameId: string;
  query: string;
  metaOverview: string;
  concepts: GameConcept[];
  matchedConceptIds: string[];
  terminologyHits: string[];
}

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CoachPromptInput {
  gameId: string;
  userMessage: string;
  retrieved: RetrievalResult;
  history?: CoachMessage[];
}

export interface CoachPrompt {
  system: string;
  messages: CoachMessage[];
}

export interface Retriever {
  retrieve(
    gameId: string,
    query: string,
    options?: RetrievalOptions,
  ): RetrievalResult;
}
