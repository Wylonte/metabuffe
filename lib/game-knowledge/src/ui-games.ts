export type { GameManifest } from "./types.js";

/** Browser-safe game registry (no filesystem access). */
export const GAME_REGISTRY = [
  {
    id: "fight-night",
    name: "Fight Night Champion",
    shortName: "Fight Night",
    active: true,
    coachEnabled: true,
    locked: false,
  },
  {
    id: "ufc6",
    name: "UFC 6",
    shortName: "UFC 6",
    active: true,
    coachEnabled: true,
    locked: false,
  },
  {
    id: "nba",
    name: "NBA 2K26",
    shortName: "NBA 2K26",
    active: false,
    coachEnabled: false,
    locked: true,
  },
  {
    id: "madden",
    name: "Madden 26",
    shortName: "Madden 26",
    active: false,
    coachEnabled: false,
    locked: true,
  },
  {
    id: "undisputed",
    name: "Undisputed 2",
    shortName: "Undisputed 2",
    active: false,
    coachEnabled: false,
    locked: true,
  },
  {
    id: "gta6",
    name: "GTA 6",
    shortName: "GTA 6",
    active: false,
    coachEnabled: false,
    locked: true,
  },
] as const;

export type UiGameId = (typeof GAME_REGISTRY)[number]["id"];
export type CoachGameId = Extract<
  (typeof GAME_REGISTRY)[number],
  { coachEnabled: true }
>["id"];

export function listUiGames() {
  return GAME_REGISTRY;
}

export function listUploadGames() {
  return GAME_REGISTRY;
}

export function listCoachGames() {
  return GAME_REGISTRY.filter((g) => g.coachEnabled && !g.locked);
}

export function listComingSoonGames() {
  return GAME_REGISTRY.filter((g) => g.locked);
}

export function getUiGame(id: string) {
  return GAME_REGISTRY.find((g) => g.id === id);
}

export function isCoachGameId(id: string): id is CoachGameId {
  return listCoachGames().some((g) => g.id === id);
}
