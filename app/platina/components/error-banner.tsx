export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-xl border border-[#ff7b72]/30 bg-[#ff7b72]/10 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#ff9b94]">
        Nao foi possivel carregar os dados da Steam
      </p>
      <p className="mt-1 text-sm text-[#ffd7d3]">{message}</p>
    </div>
  );
}
