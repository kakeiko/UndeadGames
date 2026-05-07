export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mt-3">
      <div
        className="h-full rounded-full bg-[#7c6af7]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
