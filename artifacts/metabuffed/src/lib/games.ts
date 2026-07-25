import {
  listCoachGames,
  listComingSoonGames,
  listUploadGames,
  type UiGameId,
} from "@workspace/game-knowledge/ui";
import fightNightImg from "@assets/f8jFkfr_1778467206855.jpg";
import ufc6Img from "@assets/maxresdefault_1778448217289.jpg";
import nba2kImg from "@assets/wp15758233_1778466521722.jpg";
import maddenImg from "@assets/G6IWhecWMAkaOiu_1778447744264.jpg";
import undisputedImg from "@assets/characters-from-undisputed-game_1778447744257.avif";
import gta6Img from "@assets/GTA6_1778447744267.webp";

const GAME_IMAGES: Record<UiGameId, string> = {
  "fight-night": fightNightImg,
  ufc6: ufc6Img,
  nba: nba2kImg,
  madden: maddenImg,
  undisputed: undisputedImg,
  gta6: gta6Img,
};

export type CoachGameId = "fight-night" | "ufc6";

export function getGameImage(id: UiGameId): string {
  return GAME_IMAGES[id];
}

export function listGamesForUpload() {
  return listUploadGames().map((game) => ({
    ...game,
    img: getGameImage(game.id),
  }));
}

export function listGamesForCoach() {
  return listCoachGames().map((game) => ({
    ...game,
    fullName: game.name,
    img: getGameImage(game.id),
  }));
}

export function listComingSoonGamesWithImages() {
  return listComingSoonGames().map((game) => ({
    ...game,
    img: getGameImage(game.id),
  }));
}

export function isCoachGameId(id: string): id is CoachGameId {
  return id === "fight-night" || id === "ufc6";
}
