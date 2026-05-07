import { useCallback, useEffect, useMemo, useState } from "react";

import type { Game } from "../../dashboard/interfaces/game";
import type { Badge } from "../../dashboard/interfaces/badge";
import type {
  PlatinumRecord,
  PlatinumWithGame,
  PlatinumsResponse,
  SteamProfile,
} from "../interfaces/platinum";
import { isEligibleForPlatinum } from "../utils/platinum";

/**
 * Compara os trofeus atuais da Steam com o que está salvo no banco.
 * Se houver diferença, chama PUT /api/platinas para atualizar.
 * Retorna a lista de platinas com os dados mais recentes.
 */
async function syncPlatinums(
  platinums: PlatinumRecord[],
  games: Game[]
): Promise<PlatinumRecord[]> {
  const gamesByName = new Map(
    games.map((game) => [game.name.toLowerCase(), game])
  );

  const updated = await Promise.all(
    platinums.map(async (platinum) => {
      const game = gamesByName.get(platinum.jogo.toLowerCase());

      if (!game) return platinum;

      const trofeuAtualSteam = game.trofeusConquistados ?? 0;
      const semMudanca = trofeuAtualSteam === platinum.trofeuAtual;
      const jaConcluido = platinum.concluido;

      if (semMudanca || jaConcluido) return platinum;

      try {
        const res = await fetch("/api/platinas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: platinum.id,
            trofeuAtual: trofeuAtualSteam,
          }),
        });

        if (!res.ok) return platinum;

        const data = (await res.json()) as { platinum: PlatinumRecord };
        return data.platinum;
      } catch {
        return platinum;
      }
    })
  );

  return updated;
}

interface UsePlatinaReturn {
  // Estado
  games: Game[];
  platinums: PlatinumRecord[];
  profile: SteamProfile | null;
  badge: Badge[];
  loading: boolean;
  saving: boolean;
  errorMessage: string | null;
  search: string;
  selectedAppIds: Set<number>;
  showAddGames: boolean;

  // Derivados
  profileName: string;
  profileAvatar: string | undefined;
  enrichedPlatinums: PlatinumWithGame[];
  pendingPlatinums: PlatinumWithGame[];
  completedPlatinums: PlatinumWithGame[];
  eligibleGames: Game[];
  selectedGames: Game[];
  shouldShowGameSelection: boolean;

  // Ações
  setSearch: (value: string) => void;
  setShowAddGames: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleGameSelection: (appid: number) => void;
  saveSelectedGames: () => Promise<void>;
}

export function usePlatina(): UsePlatinaReturn {
  const [games, setGames] = useState<Game[]>([]);
  const [platinums, setPlatinums] = useState<PlatinumRecord[]>([]);
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [badge, setBadge] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddGames, setShowAddGames] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedAppIds, setSelectedAppIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function loadPageData() {
      try {
        const [gamesRes, platinumsRes] = await Promise.all([
          fetch("/api/games?faixaHora=mais8h&platinado=false"),
          fetch("/api/platinas"),
        ]);

        if (!gamesRes.ok) {
          const errorData = await gamesRes.json().catch(() => null);
          throw new Error(
            typeof errorData?.details === "string"
              ? errorData.details
              : "Falha ao carregar jogos"
          );
        }

        if (!platinumsRes.ok) {
          const errorData = await platinumsRes.json().catch(() => null);
          throw new Error(
            typeof errorData?.error === "string"
              ? errorData.error
              : "Falha ao carregar platinas"
          );
        }

        const gamesData = await gamesRes.json();
        const platinumsData = (await platinumsRes.json()) as PlatinumsResponse;
        const currentSteamId = gamesData.profile?.steamid || null;
        const badgeRes = await fetch(
          `/api/medalha?steamId=${currentSteamId}&adjetivo=Platina`
        );
        const badgeData = await badgeRes.json();

        const loadedGames: Game[] = gamesData.games || [];
        const loadedPlatinums: PlatinumRecord[] = platinumsData.platinums || [];

        const syncedPlatinums = await syncPlatinums(loadedPlatinums, loadedGames);

        console.log(loadedGames)
        setBadge(badgeData.badges || []);
        setGames(loadedGames);
        setProfile(gamesData.profile || null);
        setPlatinums(syncedPlatinums);
      } catch (error) {
        console.error("Erro ao carregar platinas:", error);
        setGames([]);
        setPlatinums([]);
        setErrorMessage(
          error instanceof Error ? error.message : "Falha ao carregar platinas"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, []);

  // Derivados
  const profileName = profile?.personaname ?? "Jogador Steam";
  const profileAvatar = profile?.avatarfull;
  const shouldShowGameSelection = platinums.length === 0 || showAddGames;

  const enrichedPlatinums = useMemo<PlatinumWithGame[]>(() => {
    const gamesByName = new Map(
      games.map((game) => [game.name.toLowerCase(), game])
    );

    return platinums.map((platinum) => ({
      ...platinum,
      game: gamesByName.get(platinum.jogo.toLowerCase()),
    }));
  }, [games, platinums]);

  const pendingPlatinums = useMemo(
    () => enrichedPlatinums.filter((p) => !p.concluido),
    [enrichedPlatinums]
  );

  const completedPlatinums = useMemo(
    () => enrichedPlatinums.filter((p) => p.concluido),
    [enrichedPlatinums]
  );

  const eligibleGames = useMemo(() => {
    const unavailableGameNames = new Set(
      platinums.map((p) => p.jogo.toLowerCase())
    );
    const normalizedSearch = search.toLowerCase();

    return games.filter((game) =>
      isEligibleForPlatinum(game, unavailableGameNames, normalizedSearch)
    );
  }, [games, platinums, search]);

  const selectedGames = useMemo(
    () => eligibleGames.filter((game) => selectedAppIds.has(game.appid)),
    [eligibleGames, selectedAppIds]
  );

  // Ações
  const toggleGameSelection = useCallback((appid: number) => {
    setSelectedAppIds((current) => {
      const next = new Set(current);
      if (next.has(appid)) {
        next.delete(appid);
      } else {
        next.add(appid);
      }
      return next;
    });
  }, []);

  const saveSelectedGames = useCallback(async () => {
    if (selectedGames.length === 0) return;

    try {
      setSaving(true);
      setErrorMessage(null);

      const response = await fetch("/api/platinas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          games: selectedGames.map((game) => ({
            name: game.name,
            trofeusConquistados: game.trofeusConquistados,
            trofeusExistentes: game.trofeusExistentes,
          })),
        }),
      });

      const data = (await response.json()) as PlatinumsResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Falha ao salvar platinas");
      }

      setPlatinums(data.platinums || []);
      setSelectedAppIds(new Set());
      setShowAddGames(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao salvar platinas"
      );
    } finally {
      setSaving(false);
    }
  }, [selectedGames]);

  return {
    // Estado
    games,
    platinums,
    profile,
    badge,
    loading,
    saving,
    errorMessage,
    search,
    selectedAppIds,
    showAddGames,

    // Derivados
    profileName,
    profileAvatar,
    enrichedPlatinums,
    pendingPlatinums,
    completedPlatinums,
    eligibleGames,
    selectedGames,
    shouldShowGameSelection,

    // Ações
    setSearch,
    setShowAddGames,
    toggleGameSelection,
    saveSelectedGames,
  };
}