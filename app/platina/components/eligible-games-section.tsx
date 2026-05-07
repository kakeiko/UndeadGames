import type { Game } from "../../dashboard/interfaces/game";
import { Section } from "../../dashboard/components/section";
import { EligibleGameCard } from "./eligible-game-card";

const cardGridStyle = {
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
};

interface EligibleGamesSectionProps {
  games: Game[];
  onSaveSelected: () => void;
  onSearchChange: (value: string) => void;
  onToggleGame: (appid: number) => void;
  saving: boolean;
  search: string;
  selectedAppIds: Set<number>;
}

export function EligibleGamesSection({
  games,
  onSaveSelected,
  onSearchChange,
  onToggleGame,
  saving,
  search,
  selectedAppIds,
}: EligibleGamesSectionProps) {
  const selectedCount = selectedAppIds.size;

  return (
    <Section
      title="Escolha jogos para platinar"
      action={
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar jogo..."
            className="w-[210px] bg-[#13131f] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-[#f0ede8] placeholder-[#444038] outline-none focus:border-[#7c6af7]/50 transition-colors"
          />
          <button
            type="button"
            onClick={onSaveSelected}
            disabled={selectedCount === 0 || saving}
            className={`text-[12px] font-bold rounded-lg px-3 py-2 transition-colors ${
              selectedCount === 0 || saving
                ? "bg-white/[0.04] text-[#444038] cursor-not-allowed"
                : "bg-[#7c6af7] text-white hover:bg-[#9585f9]"
            }`}
          >
            {saving ? "Salvando..." : `Adicionar (${selectedCount})`}
          </button>
        </div>
      }
    >
      {games.length === 0 ? (
        <p className="text-[#555048] text-sm">
          Nenhum jogo elegivel encontrado para platinar agora.
        </p>
      ) : (
        <div className="grid gap-3" style={cardGridStyle}>
          {games.map((game) => (
            <EligibleGameCard
              key={game.appid}
              game={game}
              onToggle={onToggleGame}
              selected={selectedAppIds.has(game.appid)}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
