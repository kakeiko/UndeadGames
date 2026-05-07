import type { SteamAchievement } from "../interfaces/achievement";

interface AchievementListProps {
  achievements: SteamAchievement[];
  onSelectAchievement: (achievement: SteamAchievement) => void;
  selectedAchievementApiName?: string;
}

export function AchievementList({
  achievements,
  onSelectAchievement,
  selectedAchievementApiName,
}: AchievementListProps) {
  if (achievements.length === 0) {
    return (
      <p className="text-[13px] text-[#555048]">
        Nenhuma conquista encontrada para este jogo.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {achievements.map((achievement) => (
        <button
          type="button"
          key={achievement.apiname}
          onClick={() => onSelectAchievement(achievement)}
          className={`text-left bg-[#13131f] border rounded-xl p-3 flex gap-3 transition-colors ${
            selectedAchievementApiName === achievement.apiname
              ? "border-[#7c6af7] ring-2 ring-[#7c6af7]/20"
              : "border-white/[0.07] hover:border-[#7c6af7]/40"
          }`}
        >
          <div className="h-14 w-14 rounded-lg bg-white/[0.04] overflow-hidden shrink-0">
            {achievement.icon || achievement.iconGray ? (
              <img
                src={achievement.achieved ? achievement.icon : achievement.iconGray}
                alt={achievement.name}
                className={`h-full w-full object-cover ${
                  achievement.achieved ? "" : "grayscale opacity-45"
                }`}
              />
            ) : (
              <div className="h-full w-full bg-white/[0.04]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#f0ede8] truncate">
                {achievement.name}
              </h3>
              <span
                className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                  achievement.achieved
                    ? "bg-[#3fcf8e]/15 text-[#6ddcaa]"
                    : "bg-white/[0.04] text-[#666058]"
                }`}
              >
                {achievement.achieved ? "conquistada" : "pendente"}
              </span>
            </div>
            <p className="text-[12px] text-[#666058] mt-1 leading-relaxed">
              {achievement.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
