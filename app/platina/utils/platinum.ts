import type { Game } from "../../dashboard/interfaces/game";
import { pct } from "../../dashboard/utils/dashboard-math";
import type {PlatinumRecord} from "../interfaces/platinum";

export const MINIMUM_PLAYTIME_MINUTES = 8 * 60;

export function getGameProgress(
  game: Pick<Game, "trofeusConquistados" | "trofeusExistentes">
) {
  if (!game.trofeusExistentes) return 0;

  return pct(game.trofeusConquistados, game.trofeusExistentes);
}

export function getPlatinumProgress(
  platinum: Pick<PlatinumRecord, "trofeuAtual" | "trofeuFinal">
) {
  if (!platinum.trofeuFinal) return 0;

  return pct(platinum.trofeuAtual, platinum.trofeuFinal);
}

export function isEligibleForPlatinum(
  game: Game,
  unavailableGameNames: Set<string>,
  normalizedSearch: string
) {
  const normalizedName = game.name.toLowerCase();
  const hasEnoughHours = game.playtime_forever > MINIMUM_PLAYTIME_MINUTES;
  const hasAchievements = game.trofeusExistentes > 0;
  const isPlatinum =
    hasAchievements && game.trofeusConquistados >= game.trofeusExistentes;
  const matchesSearch = normalizedName.includes(normalizedSearch);
  return (
    hasEnoughHours &&
    hasAchievements &&
    !isPlatinum &&
    !unavailableGameNames.has(normalizedName) &&
    matchesSearch
  );
}
