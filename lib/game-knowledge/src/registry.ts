import knowledgeBundle from "./generated/knowledge.json" with { type: "json" };
import type {
  GameKnowledgeBundle,
  GameManifest,
  KnowledgeBundle,
} from "./types.js";

const bundle = knowledgeBundle as KnowledgeBundle;

export function getKnowledgeBundle(): KnowledgeBundle {
  return bundle;
}

export function listGameIds(): string[] {
  return Object.keys(bundle.games);
}

export function getGameBundle(gameId: string): GameKnowledgeBundle | undefined {
  return bundle.games[gameId];
}

export function getGameManifest(gameId: string): GameManifest | undefined {
  return bundle.games[gameId]?.manifest;
}

export function requireGameBundle(gameId: string): GameKnowledgeBundle {
  const game = getGameBundle(gameId);
  if (!game) {
    throw new Error(`Unknown game: ${gameId}`);
  }
  return game;
}

export function listGames(): GameManifest[] {
  return listGameIds().map((id) => bundle.games[id].manifest);
}

export function listActiveGames(): GameManifest[] {
  return listGames().filter((g) => g.active && !g.locked);
}

export function listCoachGames(): GameManifest[] {
  return listGames().filter((g) => g.coachEnabled && !g.locked);
}
