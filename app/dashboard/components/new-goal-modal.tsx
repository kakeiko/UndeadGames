"use client";

import { useState, type MouseEvent } from "react";

import { GOAL_OPTIONS } from "../constants/goal-options";
import type { Game } from "../interfaces/game";
import type { NewGoalModalProps } from "../interfaces/new-goal-modal-props";
import { toHours } from "../utils/dashboard-math";

type GoalOption = (typeof GOAL_OPTIONS)[number];

interface ExtendedNewGoalModalProps extends NewGoalModalProps {
  steamId: string | null;
}

export function NewGoalModal({
  steamId,
  open,
  onClose,
  games,
}: ExtendedNewGoalModalProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedOption, setSelectedOption] = useState<GoalOption | null>(null);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleConfirm() {
    if (!selectedGame || !selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const metaResponse = await fetch("/api/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName: selectedGame.name,
          label: selectedOption.label,
          points: selectedOption.points,
          steamId: steamId ?? "unknown",
        }),
      });

      const metaData = await metaResponse.json();

      if (!metaResponse.ok) {
        setErrorMessage(
          typeof metaData?.error === "string"
            ? metaData.error
            : "Nao foi possivel criar a meta para esse jogo."
        );
        return;
      }

      const horaInicial =
        games.find((g) => g.appid === selectedGame.appid)?.playtime_forever || 0;
      const horaFinal = selectedOption.targetMinutes;
      const trofeuInicial =
        games.find((g) => g.appid === selectedGame.appid)?.trofeusConquistados || 0;
      const trofeuFinal = selectedOption.targetTrophes;

      const progressResponse = await fetch("/api/dadosprogresso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horaInicial,
          horaFinal,
          trofeuInicial,
          trofeuFinal,
          meta: metaData.id,
        }),
      });

      if (!progressResponse.ok) {
        const progressData = await progressResponse.json().catch(() => null);
        setErrorMessage(
          typeof progressData?.error === "string"
            ? progressData.error
            : "A meta foi criada, mas houve um problema ao salvar o progresso inicial."
        );
        return;
      }

      resetState();
      onClose();
      window.location.reload();
    } catch {
      setErrorMessage("Ocorreu um erro inesperado ao criar a meta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetState() {
    setSelectedGame(null);
    setSelectedOption(null);
    setSearch("");
    setErrorMessage(null);
  }

  function handleBackdrop(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleClose() {
    resetState();
    setIsSubmitting(false);
    onClose();
  }

  if (!open) return null;

  const canConfirm = selectedGame && selectedOption;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={handleBackdrop}
    >
      <div className="bg-[#13131f] border border-white/[0.08] rounded-2xl w-full max-w-[520px] shadow-2xl shadow-black/60 overflow-hidden animate-[modalIn_0.2s_ease-out]">
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(16px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1);    }
          }
        `}</style>

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-bold text-[#f0ede8] tracking-tight">Nova Meta</h2>
            <p className="text-[11px] text-[#555048] mt-0.5">Escolha um jogo e defina seu objetivo</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#555048] hover:text-[#f0ede8] flex items-center justify-center transition-colors text-lg leading-none"
          >
            x
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {errorMessage && (
            <div className="rounded-xl border border-[#ff7b72]/30 bg-[#ff7b72]/10 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#ff9b94]">
                Nao foi possivel criar a meta
              </p>
              <p className="mt-1 text-sm text-[#ffd7d3]">{errorMessage}</p>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-[#7c6af7] uppercase tracking-widest mb-2.5 block">
              Escolha o jogo
            </label>

            <div className="relative mb-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555048] text-sm">
                Buscar
              </span>
              <input
                type="text"
                placeholder="Buscar jogo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0c0c10] border border-white/[0.07] rounded-xl pl-16 pr-4 py-2.5 text-sm text-[#f0ede8] placeholder-[#444038] outline-none focus:border-[#7c6af7]/50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
              {filtered.length === 0 && (
                <p className="text-xs text-[#444038] py-3 text-center">Nenhum jogo encontrado.</p>
              )}
              {filtered.map((game) => {
                const hours = toHours(game.playtime_forever);
                const active = selectedGame?.appid === game.appid;

                return (
                  <button
                    key={game.appid}
                    onClick={() => {
                      setSelectedGame(game);
                      setErrorMessage(null);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all ${
                      active
                        ? "bg-[#7c6af7]/15 border-[#7c6af7]/40"
                        : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08]"
                    }`}
                  >
                    <img
                      src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                      alt={game.name}
                      className="w-16 h-[30px] object-cover rounded-md shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#f0ede8] truncate">{game.name}</p>
                      <p className="text-[11px] text-[#555048]">
                        {hours === 0 ? "nunca jogado" : `${hours}h jogadas`}
                      </p>
                    </div>
                    {active && <span className="text-[#7c6af7] text-base shrink-0">OK</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#e8a045] uppercase tracking-widest mb-2.5 block">
              Escolha a meta
            </label>
            <div className="flex flex-col gap-2">
              {GOAL_OPTIONS.map((opt) => {
                const active = selectedOption?.label === opt.label;

                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setSelectedOption(opt);
                      setErrorMessage(null);
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                      active
                        ? "bg-[#e8a045]/10 border-[#e8a045]/40"
                        : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg leading-none">{opt.icon}</span>
                      <span className={`text-[13px] font-semibold ${active ? "text-[#f0bc7a]" : "text-[#f0ede8]"}`}>
                        {opt.label}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        active
                          ? "bg-[#e8a045]/15 text-[#f0bc7a] border-[#e8a045]/30"
                          : "bg-white/[0.03] text-[#555048] border-white/[0.06]"
                      }`}
                    >
                      +{opt.points} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`rounded-xl border px-4 py-3 flex items-center justify-between transition-all duration-300 ${
              canConfirm
                ? "bg-[#7c6af7]/[0.06] border-[#7c6af7]/25"
                : "bg-white/[0.02] border-white/[0.04] opacity-40"
            }`}
          >
            <div>
              <p className="text-[11px] text-[#555048] mb-0.5">Recompensa ao concluir</p>
              <p className="text-[13px] font-semibold text-[#f0ede8]">
                {selectedGame ? selectedGame.name : "-"} · {selectedOption ? selectedOption.label : "-"}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[22px] font-bold text-[#e8a045] leading-none">
                +{selectedOption ? selectedOption.points : "?"}
              </p>
              <p className="text-[10px] text-[#555048] mt-0.5">pontos</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-[13px] font-semibold text-[#555048] hover:text-[#f0ede8] hover:border-white/[0.12] transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isSubmitting}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
              canConfirm && !isSubmitting
                ? "bg-[#7c6af7] text-white hover:bg-[#9585f9] shadow-lg shadow-[#7c6af7]/25 cursor-pointer"
                : "bg-white/[0.04] text-[#444038] cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Criando..." : "Criar meta"}
          </button>
        </div>
      </div>
    </div>
  );
}
