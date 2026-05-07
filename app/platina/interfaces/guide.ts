export interface PlatinumGuide {
  id: string;
  jogo: string;
  conquistaApiName?: string | null;
  conquistaNome?: string | null;
  titulo: string;
  descricao: string;
  texto: string;
  link: string;
  aprovado: boolean;
  donoSteamId: string;
}

export interface GuidesResponse {
  guides?: PlatinumGuide[];
  guide?: PlatinumGuide;
  error?: string;
}
