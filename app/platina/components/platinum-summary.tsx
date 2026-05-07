import { StatChip } from "../../dashboard/components/stat-chip";

interface PlatinumSummaryProps {
  completedCount: number;
  eligibleCount: number;
  pendingCount: number;
  totalCount: number;
}

export function PlatinumSummary({
  completedCount,
  eligibleCount,
  pendingCount,
  totalCount,
}: PlatinumSummaryProps) {
  return (
    <div className="bg-[#13131f] border border-white/[0.07] rounded-2xl p-6 mb-8 flex flex-wrap items-center gap-6">
      <div className="flex-1 min-w-[220px]">
        <p className="text-[11px] text-[#555048] mb-0.5">rota de conclusao</p>
        <h1 className="text-[22px] font-bold tracking-tight">Platinas</h1>
      </div>
      <div className="flex gap-2.5 flex-wrap">
        <StatChip
          label="total"
          value={totalCount}
          accentClass="text-[#7c6af7]"
          accentBorder="border-[#7c6af7]/20"
        />
        <StatChip
          label="pendentes"
          value={pendingCount}
          accentClass="text-[#e8a045]"
          accentBorder="border-[#e8a045]/20"
        />
        <StatChip
          label="concluidas"
          value={completedCount}
          accentClass="text-[#3fcf8e]"
          accentBorder="border-[#3fcf8e]/20"
        />
        <StatChip
          label="jogos elegiveis"
          value={eligibleCount}
          accentClass="text-[#f07090]"
          accentBorder="border-[#f07090]/20"
        />
      </div>
    </div>
  );
}
