import Link from "next/link";

import type { PlatinumWithGame } from "../interfaces/platinum";
import { pct, toHours } from "../utils/dashboard-math";
import { ProgressBar } from "./progress-bar";

interface PlatinumCardProps {
  platinum: PlatinumWithGame;
}

export function PlatinumCard({ platinum }: PlatinumCardProps) {
  const progress = platinum.trofeuFinal
    ? pct(platinum.trofeuAtual, platinum.trofeuFinal)
    : 0;

  return (
    <Link
      href={`/platina/${platinum.id}`}
      className={`block bg-[#13131f] border rounded-xl overflow-hidden transition-colors ${
        platinum.concluido
          ? "border-[#3fcf8e]/25 hover:border-[#3fcf8e]/45"
          : "border-white/[0.07] hover:border-[#7c6af7]/40"
      }`}
    >
      {platinum.game ? (
        <img
          src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${platinum.game.appid}/header.jpg`}
          alt={platinum.jogo}
          className="w-full aspect-[460/215] object-cover block"
        />
      ) : (
        <div className="aspect-[460/215] bg-[#1a1a28] flex items-center justify-center px-4">
          <span className="text-xs font-bold text-[#666058] truncate">
            {platinum.jogo}
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#f0ede8] truncate">
              {platinum.jogo}
            </p>
            <p className="text-[11px] text-[#666058] mt-0.5">
              {platinum.game
                ? `${toHours(platinum.game.playtime_forever)}h jogadas`
                : `${platinum.points} pontos`}
            </p>
          </div>
          <span
            className={`text-[11px] font-bold ${
              platinum.concluido ? "text-[#6ddcaa]" : "text-[#a89df9]"
            }`}
          >
            {progress}%
          </span>
        </div>

        <ProgressBar
          value={progress}
          colorClass={platinum.concluido ? "bg-[#3fcf8e]" : "bg-[#7c6af7]"}
        />

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
