import type { JSX } from "react";

interface StatChipProps {
  label: string;
  value: string | number;
  accentClass: string;
  accentBorder: string;
}

export function StatChip({
  label,
  value,
  accentClass,
  accentBorder,
}: StatChipProps): JSX.Element {
  return (
    <div className={`bg-white/[0.03] border ${accentBorder} rounded-xl px-4 py-2.5 text-center`}>
      <p className={`text-xl font-bold ${accentClass} m-0`}>{value}</p>
      <p className="text-xs text-[#666058] mt-0.5">{label}</p>
    </div>
  );
}
