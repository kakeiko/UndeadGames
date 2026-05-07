import Link from "next/link";

import { toHours } from "../../dashboard/utils/dashboard-math";
import type { PlatinumWithGame } from "../interfaces/platinum";
import { getPlatinumProgress } from "../utils/platinum";
import { ProgressBar } from "./progress-bar";
import { SteamHeaderImage } from "./steam-header-image";

interface PlatinumCardProps {
  platinum: PlatinumWithGame;
}

export function PlatinumCard({ platinum }: PlatinumCardProps) {
  const progress = getPlatinumProgress(platinum);

  return (
    <Link
      href={`/platina/${platinum.id}`}
      className="block bg-[#13131f] border border-white/[0.07] rounded-xl overflow-hidden hover:border-[#7c6af7]/40 transition-colors"
    >
      {platinum.game ? (
        <SteamHeaderImage appid={platinum.game.appid} name={platinum.jogo} />
      ) : (
        <div className="aspect-[460/215] bg-[#1a1a28] flex items-center justify-center px-4">
          <span className="text-xs font-bold text-[#666058] truncate">
            {platinum.jogo}
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#f0ede8] truncate m-0">
              {platinum.jogo}
            </h3>
            <p className="text-[11px] text-[#666058] mt-1">
              {platinum.game
                ? `${toHours(platinum.game.playtime_forever)}h jogadas`
                : `${platinum.points} pontos`}
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#a89df9] shrink-0">
            {progress}%
          </span>
        </div>

        <ProgressBar progress={progress} />

        <div className="flex items-center justify-between gap-3 mt-2">
          <p className="text-[11px] text-[#555048]">
            {platinum.trofeuAtual}/{platinum.trofeuFinal} conquistas
          </p>
          <span className="text-[11px] font-bold text-[#7c6af7]">Detalhes</span>
        </div>
      </div>
    </Link>
  );
}
