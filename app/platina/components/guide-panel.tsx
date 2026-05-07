import type { PlatinumGuide } from "../interfaces/guide";
import type { SteamAchievement } from "../interfaces/achievement";

interface GuidePanelProps {
  approvedOnly: boolean;
  guides: PlatinumGuide[];
  onCreateGuide: () => void;
  onToggleApprovedOnly: (value: boolean) => void;
  selectedAchievement: SteamAchievement | null;
}

export function GuidePanel({
  guides,
  onCreateGuide,
  selectedAchievement,
}: GuidePanelProps) {
  return (
    <aside className="bg-[#13131f] border border-white/[0.07] rounded-2xl p-5 h-fit sticky top-24">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] text-[#666058]">guia da conquista</p>
          <h2 className="text-lg font-bold text-[#f0ede8]">Guias</h2>
          {selectedAchievement && (
            <p className="mt-1 text-[12px] text-[#a89df9]">
              {selectedAchievement.name}
            </p>
          )}
        </div>
      </div>

      {guides.length === 0 ? (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-[#f0ede8]">Nenhum guia encontrado.</p>
          <p className="text-[12px] text-[#666058] mt-1">
            Crie um guia para esta conquista. Ele entra como nao aprovado. Caso seja aprovado você ganhará 40 pontos.
          </p>
          <button
            type="button"
            onClick={onCreateGuide}
            disabled={!selectedAchievement}
            className="mt-4 text-[12px] font-bold rounded-lg px-3 py-2 bg-[#7c6af7] text-white hover:bg-[#9585f9] transition-colors"
          >
            Criar guia
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {guides.map((guide) => (
            <article
              key={guide.id}
              className="rounded-xl border border-white/[0.07] bg-[#0c0c10] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-[#f0ede8]">{guide.titulo}</h3>
                <span
                  className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                    guide.aprovado
                      ? "bg-[#3fcf8e]/15 text-[#6ddcaa]"
                      : "bg-[#e8a045]/15 text-[#f0bc7a]"
                  }`}
                >
                  {guide.aprovado ? "aprovado" : "pendente"}
                </span>
              </div>
              <p className="text-[12px] text-[#c9c1b8] mt-2 leading-relaxed">
                {guide.texto}
              </p>
              <a
                href={guide.link}
                target="_blank"
                className="inline-block text-[12px] font-bold text-[#a89df9] mt-3"
              >
                Abrir link
              </a>
            </article>
          ))}
          <button
            type="button"
            onClick={onCreateGuide}
            className="text-[12px] font-bold rounded-lg px-3 py-2 bg-white/[0.04] text-[#a89df9] hover:bg-white/[0.07] transition-colors"
          >
            Criar outro guia
          </button>
        </div>
      )}
    </aside>
  );
}
