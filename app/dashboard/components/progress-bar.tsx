"use client";

import { useEffect, useState, type JSX } from "react";

interface ProgressBarProps {
  value: number;
  colorClass: string;
}

export function ProgressBar({
  value,
  colorClass,
}: ProgressBarProps): JSX.Element {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 200);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="h-[5px] bg-white/[0.07] rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass} rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
