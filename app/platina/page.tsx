"use client";

import { usePlatina } from "./hooks/usePlatina";
import { EligibleGamesSection } from "./components/eligible-games-section";
import { ErrorBanner } from "./components/error-banner";
import { LoadingState } from "./components/loading-state";
import { PageNav } from "./components/page-nav";
import { PlatinumSummary } from "./components/platinum-summary";
import { PlatinumsSection } from "./components/platinums-section";
import { Section } from "../dashboard/components/section";
import { BadgeCard } from "../dashboard/components/badge-card";

export default function Platina() {
  const {
    badge,
    loading,
    saving,
    errorMessage,
    search,
    selectedAppIds,
    showAddGames,
    profileName,
    profileAvatar,
    pendingPlatinums,
    completedPlatinums,
    eligibleGames,
    shouldShowGameSelection,
    platinums,
    setSearch,
    setShowAddGames,
    toggleGameSelection,
    saveSelectedGames,
  } = usePlatina();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <main className="min-h-screen bg-[#0c0c10] text-[#f0ede8] font-['Sora',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');`}</style>

      <PageNav profileAvatar={profileAvatar} profileName={profileName} />

      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {errorMessage && <ErrorBanner message={errorMessage} />}

        <PlatinumSummary
          completedCount={completedPlatinums.length}
          eligibleCount={eligibleGames.length}
          pendingCount={pendingPlatinums.length}
          totalCount={platinums.length}
        />

        {shouldShowGameSelection && (
          <EligibleGamesSection
            games={eligibleGames}
            onSaveSelected={saveSelectedGames}
            onSearchChange={setSearch}
            onToggleGame={toggleGameSelection}
            saving={saving}
            search={search}
            selectedAppIds={selectedAppIds}
          />
        )}

        {platinums.length > 0 && (
          <PlatinumsSection
            completedPlatinums={completedPlatinums}
            onAddGame={() => setShowAddGames((current) => !current)}
            pendingPlatinums={pendingPlatinums}
          />
        )}

        <Section title="Medalhas da Platina">
          {badge.length === 0 ? (
            <p className="text-[#555048] text-sm">Nenhuma medalha criada ainda.</p>
          ) : (
            <div
              className="grid gap-2.5"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}
            >
              {badge.map((b) => (
                <BadgeCard key={b.id} badge={b} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </main>
  );
}