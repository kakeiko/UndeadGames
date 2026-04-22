import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";
import type { Badge } from "@/app/dashboard/interfaces/badge";

const MOCK_BADGES: Badge[] = [
  { id: '1', icon: "\u{1F9DF}", objetivo: "Primeiro comeback", conquistada: true },
  { id: '2', icon: "\u{1F525}", objetivo: "3 metas seguidas", conquistada: true },
  { id: '3', icon: "\u2694\uFE0F", objetivo: "Ca\u00E7ador de backlog", conquistada: false },
  { id: '4', icon: "\u{1F451}", objetivo: "100 pontos", conquistada: false },
  { id: '5', icon: "\u{1F480}", objetivo: "Lend\u00E1rio", conquistada: false },
];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);

  const claimedId = params["openid.claimed_id"];
  if (!claimedId) {
    return NextResponse.redirect(new URL("/", req.url));
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
    return NextResponse.redirect(new URL("/", req.url));
  }

  const steamId = claimedId.split("/").pop()!;

  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  const cookie = response.cookies.set("steamid", steamId, {
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
          fetch(`${req.nextUrl.origin}/api/medalha`, {
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