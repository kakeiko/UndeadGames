"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Avatar } from "./components/avatar";
import { BadgeCard } from "./components/badge-card";
import { GameCard } from "./components/game-card";
import { GoalCard } from "./components/goal-card";
import { NewGoalCard } from "./components/new-goal-card";
import { NewGoalModal } from "./components/new-goal-modal";
import { ProgressBar } from "./components/progress-bar";
import { Section } from "./components/section";
import { StatChip } from "./components/stat-chip";
import type { Game } from "./interfaces/game";
import type { Goal } from "./interfaces/goal";
import { clamp } from "./utils/dashboard-math";
import { Badge } from "./interfaces/badge";



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
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [points, setPoints] = useState(0);
  const [profile, setProfile] = useState<{ personaname: string; avatarfull: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [steamId, setSteamId] = useState<string | null>(null);
  const [badge, setBadge] = useState<Badge[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [gamesRes] = await Promise.all([
          fetch("/api/games"),
        ]);
        if (!gamesRes.ok) {
          throw new Error("Falha ao carregar jogos");
        }


        const gamesData = await gamesRes.json();
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
        setProfile(gamesData.profile);
        setSteamId(currentSteamId);
        setGoals(goalsWithProgress);
        const jogosWithMetas = filtered.map((game: Game) => ({
          ...game,
          metas: metasData.goals?.filter((g) => g.jogo === game.name) || [],
        })).filter((game) => game.metas.length > 0);
        
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
        setGoals([]);
        setPoints(0);
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

      <NewGoalModal 
        steamId={steamId || null}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        games={games}
      />

      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#0c0c10]/90 backdrop-blur-xl sticky top-0 z-50">
        <span className="font-bold text-base tracking-tight">
          <span className="opacity-50">{"\u2620"}</span> UndeadGame
        </span>
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-[13px] font-semibold text-[#f0ede8]">{profileName}</p>
            <p className="text-[11px] text-[#7c6af7]">{points} pts</p>
          </div>
          <Avatar src={profileAvatar} name={profileName} />
        </div>
        <Link href="/api/auth/logout">Logout</Link>
      </nav>

      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="bg-[#13131f] border border-white/[0.07] rounded-2xl p-6 mb-8 flex flex-wrap items-center gap-6">
          <Avatar src={profileAvatar} name={profileName} />
          <div className="flex-1 min-w-[180px]">
            <p className="text-[11px] text-[#555048] mb-0.5">bem-vindo de volta</p>
            <h1 className="text-[22px] font-bold tracking-tight">{profileName}</h1>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <StatChip label="jogos no backlog" value={games.length} accentClass="text-[#7c6af7]" accentBorder="border-[#7c6af7]/20" />
            <StatChip label={"metas conclu\u00EDdas"} value={doneGoals.length} accentClass="text-[#3fcf8e]" accentBorder="border-[#3fcf8e]/20" />
            <StatChip label="pontos" value={points} accentClass="text-[#e8a045]" accentBorder="border-[#e8a045]/20" />
            <StatChip
              label="medalhas"
              value={`${badge.filter((b) => b.conquistada).length}/${badge.length}`}
              accentClass="text-[#f07090]"
              accentBorder="border-[#f07090]/20"
            />
          </div>
        </div>

        <Section
          title={`Backlog (${games.length} jogos \u00B7 menos de 10h)`}
          action={<span className="text-xs text-[#555048]">apenas jogos com &lt; 10h</span>}
        >
          {games.length === 0 ? (
            <p className="text-[#555048] text-sm">Nenhum jogo encontrado com menos de 10 horas.</p>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {games.map((game) => (
                <GameCard key={game.appid} game={game}/>
              ))}
            </div>
          )}
        </Section>

        <Section title="Metas">
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div>
              <p className="text-xs font-semibold text-[#e8a045] mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8a045] inline-block" />
                Pendentes ({pendingGoals.length})
              </p>
              <div className="flex flex-col gap-2.5">
                {pendingGoals.map((g) => <GoalCard key={g.id} goal={g} />)}
                <NewGoalCard onClick={() => setModalOpen(true)} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3fcf8e] mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rAounded-full bg-[#3fcf8e] inline-block" />
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

        <Section title="Pontos & Medalhas">
          <div className="bg-[#13131f] border border-white/[0.07] rounded-xl px-5 py-4 mb-5 flex items-center justify-center gap-3">
            <span className="text-[32px] font-bold text-[#e8a045]">{points}</span>
            <span className="text-[13px] text-[#555048]">pontos</span>
          </div>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
            {badge.map((b) => <BadgeCard key={b.id} badge={b} />)}
          </div>
        </Section>
      </div>
    </main>
  );
}
