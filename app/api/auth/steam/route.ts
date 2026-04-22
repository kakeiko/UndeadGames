import { NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/app/utils/request-origin";

export async function GET(req: NextRequest) {
  const origin = getRequestOrigin(req);
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": `${origin}/api/auth/steam/return`,
    "openid.realm": origin,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  const steamUrl = `https://steamcommunity.com/openid/login?${params.toString()}`;

  return NextResponse.redirect(steamUrl);
}
