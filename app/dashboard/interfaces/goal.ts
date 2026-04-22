export interface Goal {
  id: string;
  jogo: string;
  objetivo: string;
  points: number;
  concluido: boolean;
  donoSteamId: string;
  horaInicial: number;
  currentMinutes: number;
  targetMinutes: number;
  trofeuInicial: number;
  currentTrophies: number;
  targetTrophies: number;
}
