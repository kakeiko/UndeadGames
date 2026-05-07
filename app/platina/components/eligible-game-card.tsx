import type { Game } from "../../dashboard/interfaces/game";
import { toHours } from "../../dashboard/utils/dashboard-math";
import { getGameProgress } from "../utils/platinum";
import { ProgressBar } from "./progress-bar";
import { SteamHeaderImage } from "./steam-header-image";

interface EligibleGameCardProps {
  game: Game;
  selected: boolean;
  onToggle: (appid: number) => void;
}

export function EligibleGameCard({
  game,
  selected,
  onToggle,
}: EligibleGameCardProps) {
  const progress = getGameProgress(game);

  return (
    <button
      type="button"
      onClick={() => onToggle(game.appid)}
      className={`text-left bg-[#13131f] border rounded-xl overflow-hidden transition-colors ${
        selected
          ? "border-[#7c6af7] ring-2 ring-[#7c6af7]/25"
          : "border-white/[0.07] hover:border-[#7c6af7]/40"
      }`}
    >
      <SteamHeaderImage appid={game.appid} name={game.name} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#f0ede8] truncate m-0">
              {game.name}
            </h3>
            <p className="text-[11px] text-[#666058] mt-1">
              {toHours(game.playtime_forever)}h jogadas
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#a89df9] shrink-0">
            {progress}%
          </span>
        </div>

        <ProgressBar progress={progress} />

        <div className="flex items-center justify-between gap-3 mt-3">
          <p className="text-[11px] text-[#555048]">
            {game.trofeusConquistados}/{game.trofeusExistentes} conquistas
          </p>
          <span
            className={`text-[11px] font-bold rounded-lg px-3 py-1.5 ${
              selected
                ? "bg-[#7c6af7] text-white"
                : "bg-white/[0.04] text-[#a89df9]"
            }`}
          >
            {selected ? "Selecionado" : "Selecionar"}
          </span>
        </div>
      </div>
    </button>
  );
}
