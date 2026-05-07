"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Avatar } from "./components/avatar";
import { BadgeCard } from "./components/badge-card";
import { GoalCard } from "./components/goal-card";
import { PlatinumCard } from "./components/platinum-card";
import { Section } from "./components/section";
import { StatChip } from "./components/stat-chip";
import type { Game } from "./interfaces/game";
import type { Goal } from "./interfaces/goal";
import { Badge } from "./interfaces/badge";
import type {
  PlatinumRecord,
  PlatinumsResponse,
  PlatinumWithGame,
} from "./interfaces/platinum";



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
    horaInicial: horaInicial,
    currentMinutes: horaAtual - horaInicial,
    targetMinutes: horaFinal,
    trofeuInicial: trofeuInicial,
    currentTrophies: trofeuAtual - trofeuInicial,
    targetTrophies: trofeuFinal,
  };
}

export default function Dashboard() {

  const [games, setGames] = useState<Game[]>([]);
  const [ownedGames, setOwnedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [points, setPoints] = useState(0);
  const [profile, setProfile] = useState<{ personaname: string; avatarfull: string } | null>(null);
  const [badge, setBadge] = useState<Badge[]>([]);
  const [platinums, setPlatinums] = useState<PlatinumRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [gamesRes, platinumsRes] = await Promise.all([
          fetch("/api/games"),
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
        const filtered = gamesData.games.filter((g: Game) => g.playtime_forever < 600);
        const currentSteamId = gamesData.profile?.steamid || null;
        let metasData: { goals?: GoalBase[] } = { goals: [] };
        if (currentSteamId) {
          const badgeRes = await fetch(`/api/medalha?steamId=${currentSteamId}`);
          const badgeData = await badgeRes.json()
          setBadge(badgeData.badges || [])
          const metasRes = await fetch(`/api/metas?steamId=${currentSteamId}`);
          
          if (!metasRes.ok) {
            throw new Error("Falha ao carregar metas");
          }
          
          metasData = await metasRes.json();
          
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
        
        setGames(filtered);
        setOwnedGames(gamesData.games || []);
        setProfile(gamesData.profile);
        setPlatinums(platinumsData.platinums || []);
        setGoals(goalsWithProgress);
        const jogosWithMetas = filtered.map((game: Game) => ({
          ...game,
          metas: metasData.goals?.filter((g) => g.jogo === game.name) || [],
        })).filter((game: Game & { metas: GoalBase[] }) => game.metas.length > 0);
        
        for (const jogo of jogosWithMetas) {
          const meta =  metasData.goals?.find((g) => g.jogo === jogo.name);
          const dadosRes = await fetch(`/api/dadosprogresso?metaId=${meta?.id}`);
          
          const dadosData = await dadosRes.json();
          const dados = dadosData.dados?.[0];
          if ((jogo.playtime_forever != dados.horaAtual) || jogo.trofeusConquistados != dados.trofeuAtual) {
            await fetch(`/api/dadosprogresso?metaId=${meta?.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                horaAtual: dadosData.dados?.[0].horaAtual + jogo.playtime_forever - (dadosData.dados?.[0].horaInicial || 0),
                trofeuAtual:dadosData.dados?.[0].trofeuAtual + jogo.trofeusConquistados - (dadosData.dados?.[0].trofeuInicial || 0),
              }),
            });
          }
          const horasConcluidas = dados.horaAtual - dados.horaInicial >= dados.horaFinal && dados.horaFinal !== 0;
          const trofeusConcluidos = dados.trofeuAtual - dados.trofeuInicial >= dados.trofeuFinal && dados.trofeuFinal !== 0;
          const metaJaConcluida = meta?.concluido === true;
          
          if ((horasConcluidas || trofeusConcluidos) && !metaJaConcluida) {
            await fetch(`/api/metas`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ metaId: meta?.id, steamId: currentSteamId }),
            });
            setGoals((prevGoals) =>
              prevGoals.map((g) =>
                g.id === meta?.id ? { ...g, concluido: true } : g
          )
        );
        const badgeRes = await fetch(`/api/medalha?steamId=${currentSteamId}`);
        const badgeData = await badgeRes.json();
        setBadge(badgeData.badges || []);
      }
      const pointsRes = await fetch('/api/points');
      const pointsData = await pointsRes.json();
      setPoints(typeof pointsData.points === "number" ? pointsData.points : 0);
      
    }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        setGames([]);
        setOwnedGames([]);
        setGoals([]);
        setPlatinums([]);
        setPoints(0);
        setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar dashboard");
      } finally {
        setLoading(false);
        
      }
    }

    loadDashboard();
  }, []);

  const profileName = profile?.personaname ?? "Jogador Steam";
  const profileAvatar = profile?.avatarfull;

  const doneGoals = goals.filter((g) => g.concluido === true);
  const pendingGoals = goals.filter((g) => g.concluido === false);
  const earnedBadges = badge.filter((b) => b.conquistada);
  const lockedBadges = badge.filter((b) => !b.conquistada);
  const gamesByName = new Map(ownedGames.map((game) => [game.name.toLowerCase(), game]));
  const enrichedPlatinums: PlatinumWithGame[] = platinums.map((platinum) => ({
    ...platinum,
    game: gamesByName.get(platinum.jogo.toLowerCase()),
  }));
  const completedPlatinums = enrichedPlatinums.filter((p) => p.concluido);
  const pendingPlatinums = enrichedPlatinums.filter((p) => !p.concluido);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0c0c10] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[40px] mb-3 animate-spin inline-block">{"\u2620"}</div>
          <p className="text-[#666058] font-['Sora',sans-serif] text-sm">Carregando seus jogos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0c0c10] text-[#f0ede8] font-['Sora',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');`}</style>

      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#0c0c10]/90 backdrop-blur-xl sticky top-0 z-50">
        <span className="font-bold text-base tracking-tight">
          <span className="opacity-50">{"\u2620"}</span> UndeadGame
        </span>
        <div className="flex items-center gap-2.5">
          <Link
            href="/backlog"
            className="text-[12px] font-semibold text-[#a89df9] border border-[#7c6af7]/25 bg-[#7c6af7]/10 rounded-lg px-3 py-2 hover:bg-[#7c6af7]/20 transition-colors"
          >
            Backlog
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

      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-[#ff7b72]/30 bg-[#ff7b72]/10 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#ff9b94]">
              Nao foi possivel carregar os dados da Steam
            </p>
            <p className="mt-1 text-sm text-[#ffd7d3]">{errorMessage}</p>
          </div>
        )}

        <div className="bg-[#13131f] border border-white/[0.07] rounded-2xl p-6 mb-8 flex flex-wrap items-center gap-6">
          <Avatar src={profileAvatar} name={profileName} />
          <div className="flex-1 min-w-[180px]">
            <p className="text-[11px] text-[#555048] mb-0.5">bem-vindo de volta</p>
            <h1 className="text-[22px] font-bold tracking-tight">{profileName}</h1>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <StatChip label="jogos no backlog" value={games.length} accentClass="text-[#7c6af7]" accentBorder="border-[#7c6af7]/20" />
            <StatChip label={"metas conclu\u00EDdas"} value={doneGoals.length} accentClass="text-[#3fcf8e]" accentBorder="border-[#3fcf8e]/20" />
            <StatChip label="metas pendentes" value={pendingGoals.length} accentClass="text-[#e8a045]" accentBorder="border-[#e8a045]/20" />
            <StatChip label="pontos" value={points} accentClass="text-[#e8a045]" accentBorder="border-[#e8a045]/20" />
            <StatChip
              label="medalhas"
              value={`${earnedBadges.length}/${badge.length}`}
              accentClass="text-[#f07090]"
              accentBorder="border-[#f07090]/20"
            />
            <StatChip
              label="platinas"
              value={`${completedPlatinums.length}/${platinums.length}`}
              accentClass="text-[#3fcf8e]"
              accentBorder="border-[#3fcf8e]/20"
            />
          </div>
        </div>

        <Section title="Resumo de Pontos">
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <div className="bg-[#13131f] border border-white/[0.07] rounded-xl px-5 py-4">
              <p className="text-[11px] text-[#555048] mb-1">total acumulado</p>
              <p className="text-[34px] leading-none font-bold text-[#e8a045]">{points}</p>
              <p className="text-[11px] text-[#666058] mt-2">pontos do usuario</p>
            </div>
            <div className="bg-[#13131f] border border-white/[0.07] rounded-xl px-5 py-4">
              <p className="text-[11px] text-[#555048] mb-1">metas</p>
              <p className="text-[24px] leading-none font-bold text-[#f0ede8]">{doneGoals.length + pendingGoals.length}</p>
              <p className="text-[11px] text-[#666058] mt-2">{doneGoals.length} concluidas / {pendingGoals.length} pendentes</p>
            </div>
            <div className="bg-[#13131f] border border-white/[0.07] rounded-xl px-5 py-4">
              <p className="text-[11px] text-[#555048] mb-1">medalhas gerais</p>
              <p className="text-[24px] leading-none font-bold text-[#f07090]">{earnedBadges.length}/{badge.length}</p>
              <p className="text-[11px] text-[#666058] mt-2">{lockedBadges.length} bloqueadas</p>
            </div>
            <div className="bg-[#13131f] border border-white/[0.07] rounded-xl px-5 py-4">
              <p className="text-[11px] text-[#555048] mb-1">platinas</p>
              <p className="text-[24px] leading-none font-bold text-[#3fcf8e]">{completedPlatinums.length}/{platinums.length}</p>
              <p className="text-[11px] text-[#666058] mt-2">{pendingPlatinums.length} em andamento</p>
            </div>
          </div>
        </Section>

        <Section title="Metas">
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div>
              <p className="text-xs font-semibold text-[#e8a045] mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8a045] inline-block" />
                Pendentes ({pendingGoals.length})
              </p>
              <div className="flex flex-col gap-2.5">
                {pendingGoals.length === 0 ? (
                  <p className="text-[13px] text-[#444038]">Nenhuma meta pendente.</p>
                ) : (
                  pendingGoals.map((g) => <GoalCard key={g.id} goal={g} />)
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3fcf8e] mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3fcf8e] inline-block" />
                {"Conclu\u00EDdas"} ({doneGoals.length})
              </p>
              <div className="flex flex-col gap-2.5">
                {doneGoals.length === 0 ? (
                  <p className="text-[13px] text-[#444038]">{"Nenhuma meta conclu\u00EDda ainda."}</p>
                ) : (
                  doneGoals.map((g) => <GoalCard key={g.id} goal={g} />)
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Platinas">
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div>
              <p className="text-xs font-semibold text-[#e8a045] mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8a045] inline-block" />
                Pendentes ({pendingPlatinums.length})
              </p>
              <div className="flex flex-col gap-2.5">
                {pendingPlatinums.length === 0 ? (
                  <p className="text-[13px] text-[#444038]">Nenhuma platina pendente.</p>
                ) : (
                  pendingPlatinums.map((platinum) => (
                    <PlatinumCard key={platinum.id} platinum={platinum} />
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3fcf8e] mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3fcf8e] inline-block" />
                Concluidas ({completedPlatinums.length})
              </p>
              <div className="flex flex-col gap-2.5">
                {completedPlatinums.length === 0 ? (
                  <p className="text-[13px] text-[#444038]">Nenhuma platina concluida.</p>
                ) : (
                  completedPlatinums.map((platinum) => (
                    <PlatinumCard key={platinum.id} platinum={platinum} />
                  ))
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Medalhas Gerais">
          <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
            {badge.map((b) => <BadgeCard key={b.id} badge={b} />)}
          </div>
        </Section>
      </div>
    </main>
  );
}
