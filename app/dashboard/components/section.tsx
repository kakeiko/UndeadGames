import type { JSX, ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function Section({ title, children, action }: SectionProps): JSX.Element {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-bold text-[#f0ede8] tracking-tight m-0">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
