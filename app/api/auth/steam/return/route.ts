import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";
import type { Badge } from "@/app/dashboard/interfaces/badge";

const MOCK_BADGES: Badge[] = [
  { id: '1', icon: "\u{1F9DF}", objetivo: "Primeiro comeback", conquistada: true },
  { id: '2', icon: "\u{1F525}", objetivo: "3 metas seguidas", conquistada: true },
  { id: '3', icon: "\u2694\uFE0F", objetivo: "Caçador de backlog", conquistada: false },
  { id: '4', icon: "\u{1F451}", objetivo: "100 pontos", conquistada: false },
  { id: '5', icon: "\u{1F480}", objetivo: "Lendário", conquistada: false },
];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  const claimedId = params["openid.claimed_id"];
  if (!claimedId) {
    return NextResponse.redirect(new URL("/", appUrl));
  }

  const validateParams = new URLSearchParams({
    ...params,
    "openid.mode": "check_authentication",
  });

  const steamRes = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST",
    body: validateParams,
  });

  const text = await steamRes.text();
  if (!text.includes("is_valid:true")) {
    return NextResponse.redirect(new URL("/", appUrl));
  }

  const steamId = claimedId.split("/").pop()!;

  const response = NextResponse.redirect(new URL("/dashboard", appUrl));
  response.cookies.set("steamid", steamId, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  const existingUser = await prisma.user.findUnique({ where: { steamId } });

  if (!existingUser) {
    prisma.user.create({ data: { steamId } }).then(() => {
      Promise.all(
        MOCK_BADGES.map((badge) =>
          fetch(`${appUrl}/api/medalha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ icon: badge.icon, objetivo: badge.objetivo, steamId }),
          })
        )
      ).catch(console.error);
    });
  }

  return response;
}