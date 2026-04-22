import type { JSX } from "react";

interface NewGoalCardProps {
  onClick: () => void;
}

export function NewGoalCard({ onClick }: NewGoalCardProps): JSX.Element {
  return (
    <button
      className="bg-[#7c6af7]/5 border border-dashed border-[#7c6af7]/35 rounded-xl px-4 py-3.5 cursor-pointer w-full flex flex-col items-center justify-center gap-1.5 min-h-[90px] hover:bg-[#7c6af7]/10 transition-colors"
      onClick={onClick}
    >
      <span className="text-[22px] leading-none">{"\uFF0B"}</span>
      <span className="text-[13px] font-semibold text-[#a89df9]">Nova meta</span>
    </button>
  );
}
