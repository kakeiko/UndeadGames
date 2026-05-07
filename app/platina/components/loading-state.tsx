export function LoadingState() {
  return (
    <main className="min-h-screen bg-[#0c0c10] flex items-center justify-center">
      <div className="text-center">
        <div className="text-[40px] mb-3 animate-spin inline-block">{"\u2620"}</div>
        <p className="text-[#666058] font-['Sora',sans-serif] text-sm">
          Carregando platinas...
        </p>
      </div>
    </main>
  );
}
