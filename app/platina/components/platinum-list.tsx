import type { PlatinumWithGame } from "../interfaces/platinum";
import { PlatinumCard } from "./platinum-card";

interface PlatinumListProps {
  emptyMessage: string;
  platinums: PlatinumWithGame[];
}

export function PlatinumList({ emptyMessage, platinums }: PlatinumListProps) {
  if (platinums.length === 0) {
    return <p className="text-[13px] text-[#444038]">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {platinums.map((platinum) => (
        <PlatinumCard key={platinum.id} platinum={platinum} />
      ))}
    </div>
  );
}
