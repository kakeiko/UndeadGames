import { Section } from "../../dashboard/components/section";
import type { PlatinumWithGame } from "../interfaces/platinum";
import { PlatinumList } from "./platinum-list";
import { StatusTitle } from "./status-title";

const platinumGridStyle = {
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
};

interface PlatinumsSectionProps {
  completedPlatinums: PlatinumWithGame[];
  onAddGame: () => void;
  pendingPlatinums: PlatinumWithGame[];
}

export function PlatinumsSection({
  completedPlatinums,
  onAddGame,
  pendingPlatinums,
}: PlatinumsSectionProps) {
  return (
    <Section
      title="Minhas platinas"
      action={
        <button
          type="button"
          onClick={onAddGame}
          className="text-[12px] font-bold rounded-lg px-3 py-2 bg-[#7c6af7] text-white hover:bg-[#9585f9] transition-colors"
        >
          Adicionar jogo
        </button>
      }
    >
      <div className="grid gap-4" style={platinumGridStyle}>
        <div>
          <StatusTitle accentClass="text-[#e8a045]" dotClass="bg-[#e8a045]">
            Pendentes ({pendingPlatinums.length})
          </StatusTitle>
          <PlatinumList
            emptyMessage="Nenhuma platina pendente."
            platinums={pendingPlatinums}
          />
        </div>

        <div>
          <StatusTitle accentClass="text-[#3fcf8e]" dotClass="bg-[#3fcf8e]">
            Concluidas ({completedPlatinums.length})
          </StatusTitle>
          <PlatinumList
            emptyMessage="Nenhuma platina concluida ainda."
            platinums={completedPlatinums}
          />
        </div>
      </div>
    </Section>
  );
}
