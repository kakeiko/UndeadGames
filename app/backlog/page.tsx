"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Avatar } from "../dashboard/components/avatar";
import { BadgeCard } from "../dashboard/components/badge-card";
import { GameCard } from "../dashboard/components/game-card";
import { GoalCard } from "../dashboard/components/goal-card";
import { NewGoalCard } from "../dashboard/components/new-goal-card";
import { NewGoalModal } from "../dashboard/components/new-goal-modal";
import { Section } from "../dashboard/components/section";
import { StatChip } from "../dashboard/components/stat-chip";
import type { Badge } from "../dashboard/interfaces/badge";
import type { Game } from "../dashboard/interfaces/game";
import type { Goal } from "../dashboard/interfaces/goal";

interface GoalProgressData {
  horaFinal: number;
  horaAtual: number;
  horaInicial: number;
  trofeuFinal: number;
  trofeuAtual: number;
  trofeuInicial: number;
}

type GoalBase = Omit<
  Goal,
  "currentMinutes" | "targetMinutes" | "currentTrophies" | "targetTrophies"
>;

function withGoalProgress(goal: GoalBase, progress?: Partial<GoalProgressData>): Goal {
  const horaFinal = progress?.horaFinal ?? 0;
  const horaAtual = progress?.horaAtual ?? 0;
  const trofeuFinal = progress?.trofeuFinal ?? 0;
  const trofeuAtual = progress?.trofeuAtual ?? 0;
  const horaInicial = progress?.horaInicial ?? 0;
  const trofeuInicial = progress?.trofeuInicial ?? 0;

  return {
    ...goal,
    horaInicial,
    currentMinutes: horaAtual - horaInicial,
    targetMinutes: horaFinal,
    trofeuInicial,
    currentTrophies: trofeuAtual - trofeuInicial,
    targetTrophies: trofeuFinal,
  };
}

export default function Backlog() {
  const [games, setGames] = useState<Game[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [profile, setProfile] = useState<{ personaname: string; avatarfull: string } | null>(null);
  const [steamId, setSteamId] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unplayed" | "started">("all");
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBacklog() {
      try {
        const gamesRes = await fetch("/api/games");

        if (!gamesRes.ok) {
          const errorData = await gamesRes.json().catch(() => null);
          throw new Error(
            typeof errorData?.details === "string"
              ? errorData.details
              : "Falha ao carregar jogos"
          );
        }

        const gamesData = await gamesRes.json();
        const backlogGames = (gamesData.games || []).filter(
          (game: Game) => game.playtime_forever < 600
        );
        const currentSteamId = gamesData.profile?.steamid || null;
        let metasData: { goals?: GoalBase[] } = { goals: [] };

        if (currentSteamId) {
          const filtro = 'Backlog'
          const [metasRes, badgeRes, pointsRes] = await Promise.all([
            fetch(`/api/metas?steamId=${currentSteamId}`),
            fetch(`/api/medalha?steamId=${currentSteamId}&adjetivo=${filtro}`),
            fetch("/api/points"),
          ]);

          if (!metasRes.ok) {
            throw new Error("Falha ao carregar metas");
          }

          metasData = await metasRes.json();

          if (badgeRes.ok) {
            const badgeData = await badgeRes.json();
            setBadges(badgeData.badges || []);
          }

          if (pointsRes.ok) {
            const pointsData = await pointsRes.json();
            setPoints(typeof pointsData.points === "number" ? pointsData.points : 0);
          }
        }

        const goalsWithProgress = await Promise.all(
          (metasData.goals || []).map(async (goal) => {
            const dadosRes = await fetch(`/api/dadosprogresso?metaId=${goal.id}`);

            if (!dadosRes.ok) {
              return withGoalProgress(goal);
            }

            const dadosData = await dadosRes.json();
            const progress = dadosData.dados?.[0] as Partial<GoalProgressData> | undefined;

            return withGoalProgress(goal, progress);
          })
        );

        setGames(backlogGames);
        setProfile(gamesData.profile);
        setSteamId(currentSteamId);
        setGoals(goalsWithProgress);

        const gamesWithGoals = backlogGames
          .map((game: Game) => ({
            ...game,
            metas: metasData.goals?.filter((goal) => goal.jogo === game.name) || [],
          }))
          .filter((game: Game & { metas: GoalBase[] }) => game.metas.length > 0);

        for (const game of gamesWithGoals) {
          const meta = metasData.goals?.find((goal) => goal.jogo === game.name);
          const dadosRes = await fetch(`/api/dadosprogresso?metaId=${meta?.id}`);

          if (!dadosRes.ok) continue;

          const dadosData = await dadosRes.json();
          const dados = dadosData.dados?.[0];

          if (!dados) continue;

          if (
            game.playtime_forever !== dados.horaAtual ||
            game.trofeusConquistados !== dados.trofeuAtual
          ) {
            await fetch(`/api/dadosprogresso?metaId=${meta?.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                horaAtual:
                  dados.horaAtual + game.playtime_forever - (dados.horaInicial || 0),
                trofeuAtual:
                  dados.trofeuAtual + game.trofeusConquistados - (dados.trofeuInicial || 0),
              }),
            });
          }

          const horasConcluidas =
            dados.horaAtual - dados.horaInicial >= dados.horaFinal && dados.horaFinal !== 0;
          const trofeusConcluidos =
            dados.trofeuAtual - dados.trofeuInicial >= dados.trofeuFinal &&
            dados.trofeuFinal !== 0;
          const metaJaConcluida = meta?.concluido === true;

          if ((horasConcluidas || trofeusConcluidos) && !metaJaConcluida) {
            await fetch("/api/metas", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ metaId: meta?.id, steamId: currentSteamId }),
            });

            setGoals((prevGoals) =>
              prevGoals.map((goal) =>
                goal.id === meta?.id ? { ...goal, concluido: true } : goal
              )
            );
          }
        }
      } catch (error) {
        console.error("Erro ao carregar backlog:", error);
        setGames([]);
        setGoals([]);
        setBadges([]);
        setPoints(0);
        setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar backlog");
      } finally {
        setLoading(false);
      }
    }

    loadBacklog();
  }, []);

  const profileName = profile?.personaname ?? "Jogador Steam";
  const profileAvatar = profile?.avatarfull;
  const doneGoals = goals.filter((goal) => goal.concluido === true);
  const pendingGoals = goals.filter((goal) => goal.concluido === false);
  const earnedBadges = badges.filter((badge) => badge.conquistada);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unplayed" && game.playtime_forever === 0) ||
        (statusFilter === "started" && game.playtime_forever > 0);

      return matchesSearch && matchesStatus;
    });
  }, [games, search, statusFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0c0c10] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[40px] mb-3 animate-spin inline-block">{"\u2620"}</div>
          <p className="text-[#666058] font-['Sora',sans-serif] text-sm">Carregando backlog...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0c0c10] text-[#f0ede8] font-['Sora',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');`}</style>

      <NewGoalModal
        steamId={steamId}
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        games={games}
      />

      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/6 bg-[#0c0c10]/90 backdrop-blur-xl sticky top-0 z-50">
        <span className="font-bold text-base tracking-tight">
          <span className="opacity-50">{"\u2620"}</span> UndeadGame
        </span>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            className="text-[12px] font-semibold text-[#a89df9] border border-[#7c6af7]/25 bg-[#7c6af7]/10 rounded-lg px-3 py-2 hover:bg-[#7c6af7]/20 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/platina"
            className="text-[12px] font-semibold text-[#6ddcaa] border border-[#3fcf8e]/25 bg-[#3fcf8e]/10 rounded-lg px-3 py-2 hover:bg-[#3fcf8e]/20 transition-colors"
          >
            Platinas
          </Link>
          <div className="text-right">
            <p className="text-[13px] font-semibold text-[#f0ede8]">{profileName}</p>
            <p className="text-[11px] text-[#7c6af7]">{points} pts</p>
          </div>
          <Avatar src={profileAvatar} name={profileName} />
        </div>
        <a href="/api/auth/logout">Logout</a>
      </nav>

      <div className="max-w-275 mx-auto px-6 py-8">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-[#ff7b72]/30 bg-[#ff7b72]/10 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#ff9b94]">
              Nao foi possivel carregar os dados da Steam
            </p>
            <p className="mt-1 text-sm text-[#ffd7d3]">{errorMessage}</p>
          </div>
        )}

        <div className="bg-[#13131f] border border-white/[0.07] rounded-2xl p-6 mb-8 flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-55">
            <p className="text-[11px] text-[#555048] mb-0.5">operacoes do backlog</p>
            <h1 className="text-[22px] font-bold tracking-tight">Backlog</h1>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <StatChip label="jogos filtrados" value={filteredGames.length} accentClass="text-[#7c6af7]" accentBorder="border-[#7c6af7]/20" />
            <StatChip label="metas pendentes" value={pendingGoals.length} accentClass="text-[#e8a045]" accentBorder="border-[#e8a045]/20" />
            <StatChip label={"metas concluidas"} value={doneGoals.length} accentClass="text-[#3fcf8e]" accentBorder="border-[#3fcf8e]/20" />
            <StatChip label="medalhas" value={`${earnedBadges.length}/${badges.length}`} accentClass="text-[#f07090]" accentBorder="border-[#f07090]/20" />
          </div>
        </div>

        <Section
          title={`Jogos filtrados (${filteredGames.length})`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar jogo..."
                className="w-47.5 bg-[#13131f] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-[#f0ede8] placeholder-[#444038] outline-none focus:border-[#7c6af7]/50 transition-colors"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "unplayed" | "started")}
                className="bg-[#13131f] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-[#f0ede8] outline-none focus:border-[#7c6af7]/50 transition-colors"
              >
                <option value="all">Todos</option>
                <option value="unplayed">Nunca jogados</option>
                <option value="started">Iniciados</option>
              </select>
            </div>
          }
        >
          {filteredGames.length === 0 ? (
            <p className="text-[#555048] text-sm">Nenhum jogo encontrado para esse filtro.</p>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {filteredGames.map((game) => (
                <GameCard key={game.appid} game={game} />
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Metas do backlog"
          action={
            <button
              onClick={() => setGoalModalOpen(true)}
              className="text-[12px] font-bold text-white bg-[#7c6af7] hover:bg-[#9585f9] rounded-lg px-3 py-2 transition-colors"
            >
              Criar meta
            </button>
          }
        >
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div>
              <p className="text-xs font-semibold text-[#e8a045] mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8a045] inline-block" />
                Pendentes ({pendingGoals.length})
              </p>
              <div className="flex flex-col gap-2.5">
                {pendingGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
                <NewGoalCard onClick={() => setGoalModalOpen(true)} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3fcf8e] mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3fcf8e] inline-block" />
                Concluidas ({doneGoals.length})
              </p>
              <div className="flex flex-col gap-2.5">
                {doneGoals.length === 0 ? (
                  <p className="text-[13px] text-[#444038]">Nenhuma meta concluida ainda.</p>
                ) : (
                  doneGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Medalhas do backlog"
        >
          {badges.length === 0 ? (
            <p className="text-[#555048] text-sm">Nenhuma medalha criada ainda.</p>
          ) : (
            <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
              {badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
            </div>
          )}
        </Section>
      </div>
    </main>
  );
}
