"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Game } from "../../dashboard/interfaces/game";
import { Avatar } from "../../dashboard/components/avatar";
import { pct } from "../../dashboard/utils/dashboard-math";
import { AchievementList } from "../components/achievement-list";
import { CreateGuideModal } from "../components/create-guide-modal";
import { ErrorBanner } from "../components/error-banner";
import { GuidePanel } from "../components/guide-panel";
import { LoadingState } from "../components/loading-state";
import { ProgressBar } from "../components/progress-bar";
import { SteamHeaderImage } from "../components/steam-header-image";
import type {
  AchievementsResponse,
  SteamAchievement,
} from "../interfaces/achievement";
import type { GamesResponse, PlatinumRecord, PlatinumsResponse } from "../interfaces/platinum";
import type { GuidesResponse, PlatinumGuide } from "../interfaces/guide";

type AchievementFilter = "all" | "earned" | "pending";

export default function PlatinumDetailPage() {
  const params = useParams<{ id: string }>();
  const platinumId = params.id;
  const [games, setGames] = useState<Game[]>([]);
  const [platinum, setPlatinum] = useState<PlatinumRecord | null>(null);
  const [profile, setProfile] = useState<{ personaname: string; avatarfull: string } | null>(null);
  const [achievements, setAchievements] = useState<SteamAchievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] =
    useState<SteamAchievement | null>(null);
  const [guides, setGuides] = useState<PlatinumGuide[]>([]);
  const [achievementFilter, setAchievementFilter] = useState<AchievementFilter>("all");
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const game = useMemo(() => {
    if (!platinum) return undefined;

    return games.find(
      (candidate) => candidate.name.toLowerCase() === platinum.jogo.toLowerCase()
    );
  }, [games, platinum]);

  const progress = platinum?.trofeuFinal
    ? pct(platinum.trofeuAtual, platinum.trofeuFinal)
    : 0;
  const earnedAchievements = achievements.filter(
    (achievement) => achievement.achieved
  );
  const filteredAchievements = achievements.filter((achievement) => {
    if (achievementFilter === "earned") return achievement.achieved;
    if (achievementFilter === "pending") return !achievement.achieved;

    return true;
  });
  const profileName = profile?.personaname ?? "Jogador Steam";
  const profileAvatar = profile?.avatarfull;

  const loadGuides = useCallback(
    async (
      gameName: string,
      achievementApiName: string,
      onlyApproved: boolean
    ) => {
      setLoadingGuides(true);

      try {
        const response = await fetch(
          `/api/guias-platinas?jogo=${encodeURIComponent(
            gameName
          )}&conquistaApiName=${encodeURIComponent(
            achievementApiName
          )}`
        );
        const data = (await response.json()) as GuidesResponse;

        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar guias");
        }

        setGuides(data.guides || []);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Falha ao carregar guias"
        );
      } finally {
        setLoadingGuides(false);
      }
    },
    []
  );

  useEffect(() => {
    async function loadDetail() {
      try {
        const [gamesRes, platinumsRes] = await Promise.all([
          fetch("/api/games"),
          fetch("/api/platinas"),
        ]);

        if (!gamesRes.ok || !platinumsRes.ok) {
          throw new Error("Falha ao carregar dados da platina");
        }

        const gamesData = (await gamesRes.json()) as GamesResponse;
        const platinumsData = (await platinumsRes.json()) as PlatinumsResponse;
        const currentPlatinum =
          platinumsData.platinums?.find((item) => item.id === platinumId) ?? null;

        if (!currentPlatinum) {
          throw new Error("Platina nao encontrada");
        }

        const ownedGames = gamesData.games || [];
        const matchedGame = ownedGames.find(
          (candidate) =>
            candidate.name.toLowerCase() === currentPlatinum.jogo.toLowerCase()
        );

        setGames(ownedGames);
        setProfile(gamesData.profile || null);
        setPlatinum(currentPlatinum);

        if (matchedGame) {
          const achievementsRes = await fetch(
            `/api/steam-achievements?appid=${matchedGame.appid}`
          );
          const achievementsData =
            (await achievementsRes.json()) as AchievementsResponse;

          if (!achievementsRes.ok) {
            throw new Error(
              achievementsData.error || "Falha ao carregar conquistas"
            );
          }

          const loadedAchievements = achievementsData.achievements || [];
          const firstAchievement = loadedAchievements[0] || null;

          setAchievements(loadedAchievements);
          setSelectedAchievement(firstAchievement);

          if (firstAchievement) {
            await loadGuides(currentPlatinum.jogo, firstAchievement.apiname, false);
          }
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Falha ao carregar platina"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [loadGuides, platinumId]);

  function selectAchievement(achievement: SteamAchievement) {
    setSelectedAchievement(achievement);

    if (platinum) {
      loadGuides(platinum.jogo, achievement.apiname, approvedOnly);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <main className="min-h-screen bg-[#0c0c10] text-[#f0ede8] font-['Sora',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');`}</style>

      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#0c0c10]/90 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/platina" className="font-bold text-base tracking-tight">
          <span className="opacity-50">{"\u2620"}</span> UndeadGame
        </Link>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            className="text-[12px] font-semibold text-[#a89df9] border border-[#7c6af7]/25 bg-[#7c6af7]/10 rounded-lg px-3 py-2 hover:bg-[#7c6af7]/20 transition-colors"
          >
            Dashboard
          </Link>
          <div className="text-right">
            <p className="text-[13px] font-semibold text-[#f0ede8]">{profileName}</p>
            <p className="text-[11px] text-[#7c6af7]">guia de platina</p>
          </div>
          <Avatar src={profileAvatar} name={profileName} />
        </div>
      </nav>

      <div className="max-w-[1180px] mx-auto px-6 py-8">
        {errorMessage && <ErrorBanner message={errorMessage} />}

        {platinum && (
          <>
            <section className="bg-[#13131f] border border-white/[0.07] rounded-2xl overflow-hidden mb-8">
              {game ? (
                <SteamHeaderImage appid={game.appid} name={platinum.jogo} />
              ) : (
                <div className="aspect-[460/160] bg-[#1a1a28]" />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] text-[#666058]">platina</p>
                    <h1 className="text-2xl font-bold text-[#f0ede8]">
                      {platinum.jogo}
                    </h1>
                  </div>
                  <span className="text-sm font-bold text-[#a89df9]">
                    {progress}%
                  </span>
                </div>
                <div className="mt-4">
                  <ProgressBar progress={progress} />
                </div>
                <p className="text-[12px] text-[#666058] mt-2">
                  {platinum.trofeuAtual}/{platinum.trofeuFinal} conquistas
                </p>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[11px] text-[#666058]">checklist</p>
                    <h2 className="text-lg font-bold text-[#f0ede8]">
                      Conquistas
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-white/[0.07] bg-[#13131f] p-1">
                      {[
                        { label: "Todas", value: "all" },
                        { label: "Conquistadas", value: "earned" },
                        { label: "Pendentes", value: "pending" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setAchievementFilter(option.value as AchievementFilter)
                          }
                          className={`text-[11px] font-bold rounded-md px-2.5 py-1.5 transition-colors ${
                            achievementFilter === option.value
                              ? "bg-[#7c6af7] text-white"
                              : "text-[#666058] hover:text-[#f0ede8]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <span className="text-[12px] font-bold text-[#a89df9]">
                      {earnedAchievements.length}/{achievements.length}
                    </span>
                  </div>
                </div>
                <AchievementList
                  achievements={filteredAchievements}
                  onSelectAchievement={selectAchievement}
                  selectedAchievementApiName={selectedAchievement?.apiname}
                />
              </section>

              <GuidePanel
                guides={loadingGuides ? [] : guides}
                onCreateGuide={() => setModalOpen(true)}
                selectedAchievement={selectedAchievement}
              />
            </div>
          </>
        )}
      </div>

      {modalOpen && platinum && selectedAchievement && (
        <CreateGuideModal
          achievement={selectedAchievement}
          gameName={platinum.jogo}
          onClose={() => setModalOpen(false)}
          onCreated={() =>
            loadGuides(platinum.jogo, selectedAchievement.apiname, approvedOnly)
          }
        />
      )}
    </main>
  );
}
