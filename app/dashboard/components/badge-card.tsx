import type { JSX } from "react";

import type { Badge } from "../interfaces/badge";

interface BadgeCardProps {
  badge: Badge;
}

export function BadgeCard({ badge }: BadgeCardProps): JSX.Element {
  return (
    <div
      className={`rounded-xl p-3.5 flex flex-col items-center gap-2 ${
        badge.conquistada
          ? "bg-[#7c6af7]/[0.08] border border-[#7c6af7]/35"
          : "bg-white/[0.02] border border-white/[0.06] opacity-45"
      }`}
    >
      <span className={`text-[28px] leading-none ${badge.conquistada ? "" : "grayscale"}`}>{badge.icon}</span>
      <span
        className={`text-[11px] font-semibold text-center leading-tight ${
          badge.conquistada ? "text-[#a89df9]" : "text-[#555048]"
        }`}
      >
        {badge.objetivo}
      </span>
      {!badge.conquistada && <span className="text-[10px] text-[#444038]">bloqueada</span>}
    </div>
  );
}
