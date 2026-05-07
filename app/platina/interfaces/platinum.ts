import type { Game } from "../../dashboard/interfaces/game";

export interface SteamProfile {
  personaname: string;
  avatarfull: string;
}

export interface GamesResponse {
  games?: Game[];
  profile?: SteamProfile | null;
}

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

export interface Medal {
  id: string;
  icon: string;
  objetivo: string;
  conquistada: boolean;
}
