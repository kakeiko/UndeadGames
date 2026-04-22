import type { JSX } from "react";
import { useState } from "react";

import type { Game } from "../interfaces/game";
import { toHours } from "../utils/dashboard-math";

interface GameCardProps {
  game: Game;
  onNewGoal: (game: Game) => void;
}

export function GameCard({ game }: GameCardProps): JSX.Element {
  const hours = toHours(game.playtime_forever);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-[#13131f] border border-white/[0.07] rounded-xl overflow-hidden transition-transform duration-[180ms] hover:-translate-y-1 hover:border-[#7c6af7]/40">
      {imgError ? (
        <div className="w-full aspect-[460/215] bg-[#1a1a2e] flex flex-col items-center justify-center gap-1.5">
          <span className="text-3xl opacity-30">🎮</span>
          <span className="text-[11px] text-[#444038]">sem imagem</span>
        </div>
      ) : (
        <img
          src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
          alt={game.name}
          className="w-full aspect-[460/215] object-cover block"
          onError={() => setImgError(true)}
        />
      )}
      <div className="px-3.5 py-3">
        <h3 className="text-sm font-semibold text-[#f0ede8] truncate m-0">{game.name}</h3>
        <div className="flex items-center justify-between mt-2">
          {hours === 0 ? (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#e8a045]/10 text-[#f0bc7a] border border-[#e8a045]/30">
              nunca jogado
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#7c6af7]/10 text-[#a89df9] border border-[#7c6af7]/30">
              {hours}h jogadas
            </span>
          )}
        </div>
      </div>
    </div>
  );
}