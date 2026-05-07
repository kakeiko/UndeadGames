export interface SteamAchievement {
  apiname: string;
  name: string;
  description: string;
  achieved: boolean;
  icon?: string;
  iconGray?: string;
}

export interface AchievementsResponse {
  achievements?: SteamAchievement[];
  error?: string;
}
