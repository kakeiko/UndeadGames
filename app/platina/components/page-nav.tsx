import Link from "next/link";

import { Avatar } from "../../dashboard/components/avatar";

interface PageNavProps {
  profileAvatar?: string;
  profileName: string;
}

export function PageNav({ profileAvatar, profileName }: PageNavProps) {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#0c0c10]/90 backdrop-blur-xl sticky top-0 z-50">
      <span className="font-bold text-base tracking-tight">
        <span className="opacity-50">{"\u2620"}</span> UndeadGame
      </span>
      <div className="flex items-center gap-2.5">
        <Link
          href="/dashboard"
          className="text-[12px] font-semibold text-[#a89df9] border border-[#7c6af7]/25 bg-[#7c6af7]/10 rounded-lg px-3 py-2 hover:bg-[#7c6af7]/20 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/backlog"
          className="text-[12px] font-semibold text-[#f0bc7a] border border-[#e8a045]/25 bg-[#e8a045]/10 rounded-lg px-3 py-2 hover:bg-[#e8a045]/20 transition-colors"
        >
          Backlog
        </Link>
        <div className="text-right">
          <p className="text-[13px] font-semibold text-[#f0ede8]">{profileName}</p>
          <p className="text-[11px] text-[#7c6af7]">rota de platinas</p>
        </div>
        <Avatar src={profileAvatar} name={profileName} />
      </div>
      <a href="/api/auth/logout">Logout</a>
    </nav>
  );
}
