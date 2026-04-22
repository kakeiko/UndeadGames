import { NextResponse } from "next/server";

export async function GET() {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/steam/return`,
    "openid.realm": process.env.NEXT_PUBLIC_BASE_URL!,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  const steamUrl = `https://steamcommunity.com/openid/login?${params.toString()}`;

  return NextResponse.redirect(steamUrl);
}
