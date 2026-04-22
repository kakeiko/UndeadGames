import type { JSX } from "react";

import type { Goal } from "../interfaces/goal";
import { pct, toHours } from "../utils/dashboard-math";
import { ProgressBar } from "./progress-bar";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps): JSX.Element {
  const done = goal.concluido;
  const hour = goal.targetMinutes != 0
  let progress
  if (hour) {
    progress = pct(goal.currentMinutes, goal.targetMinutes);
  }
  else {
    progress = pct(goal.currentTrophies, goal.targetTrophies)
  }
  return (
    <div className={`bg-[#13131f] border rounded-xl p-4 ${done ? "border-[#3fcf8e]/25" : "border-white/[0.07]"}`}>
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#f0ede8] truncate m-0">{goal.jogo}</p>
          <p className="text-xs text-[#666058] mt-0.5">{goal.objetivo}</p>
        </div>
        
      </div>
      <ProgressBar value={progress!} colorClass={done ? "bg-[#3fcf8e]" : "bg-[#7c6af7]"} />
      <div className="flex justify-between mt-1.5">
        <span className="text-[11px] text-[#555048]">
          {
            hour
              ? `${toHours(goal.currentMinutes)} h / ${toHours(goal.targetMinutes)} h`
              : `${goal.currentTrophies} / ${goal.targetTrophies}`
          }
        </span>
        <span className={`text-[11px] font-semibold ${done ? "text-[#6ddcaa]" : "text-[#a89df9]"}`}>
          {progress}%
        </span>
      </div>
    </div>
  );
}
