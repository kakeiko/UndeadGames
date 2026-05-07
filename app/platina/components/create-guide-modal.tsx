import { useState } from "react";
import type { SteamAchievement } from "../interfaces/achievement";

interface CreateGuideModalProps {
  achievement: SteamAchievement;
  gameName: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateGuideModal({
  achievement,
  gameName,
  onClose,
  onCreated,
}: CreateGuideModalProps) {
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function createGuide() {
    if (!text.trim() || !link.trim()) {
      setErrorMessage("Preencha o texto e o link do guia.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      const response = await fetch("/api/guias-platinas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jogo: gameName,
          conquistaApiName: achievement.apiname,
          conquistaNome: achievement.name,
          texto: text,
          link,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel criar o guia.");
      }

      onCreated();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel criar o guia."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-[520px] rounded-2xl border border-white/[0.08] bg-[#13131f] p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] text-[#666058]">novo guia</p>
            <h2 className="text-lg font-bold text-[#f0ede8]">{achievement.name}</h2>
            <p className="text-[12px] text-[#666058]">{gameName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-[#666058] hover:text-[#f0ede8]"
          >
            Fechar
          </button>
        </div>

        {errorMessage && (
          <p className="mb-3 rounded-lg border border-[#ff7b72]/30 bg-[#ff7b72]/10 px-3 py-2 text-xs text-[#ffd7d3]">
            {errorMessage}
          </p>
        )}

        <label className="block text-[12px] font-semibold text-[#f0ede8] mb-2">
          Texto do guia
        </label>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={7}
          className="w-full resize-none bg-[#0c0c10] border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-[#f0ede8] placeholder-[#444038] outline-none focus:border-[#7c6af7]/50 transition-colors"
          placeholder="Escreva o caminho, dicas ou checklist da platina..."
        />

        <label className="block text-[12px] font-semibold text-[#f0ede8] mt-4 mb-2">
          Link
        </label>
        <input
          value={link}
          onChange={(event) => setLink(event.target.value)}
          className="w-full bg-[#0c0c10] border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-[#f0ede8] placeholder-[#444038] outline-none focus:border-[#7c6af7]/50 transition-colors"
          placeholder="https://..."
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] font-bold rounded-lg px-3 py-2 bg-white/[0.04] text-[#f0ede8] hover:bg-white/[0.07] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={createGuide}
            disabled={saving}
            className="text-[12px] font-bold rounded-lg px-3 py-2 bg-[#7c6af7] text-white hover:bg-[#9585f9] disabled:opacity-50 transition-colors"
          >
            {saving ? "Criando..." : "Criar guia"}
          </button>
        </div>
      </div>
    </div>
  );
}
