import type { ReactNode } from "react";

interface StatusTitleProps {
  accentClass: string;
  dotClass: string;
  children: ReactNode;
}

export function StatusTitle({
  accentClass,
  dotClass,
  children,
}: StatusTitleProps) {
  return (
    <p className={`text-xs font-semibold ${accentClass} mb-2.5 flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} inline-block`} />
      {children}
    </p>
  );
}
