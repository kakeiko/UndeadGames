import type { Game } from "./game";

export interface PlatinumRecord {
  id: string;
  jogo: string;
  trofeuInicial: number;
  trofeuFinal: number;
  trofeuAtual: number;
  points: number;
  concluido: boolean;
  donoSteamId: string;
}

export interface PlatinumWithGame extends PlatinumRecord {
  game?: Game;
}

export interface PlatinumsResponse {
  platinums?: PlatinumRecord[];
}
