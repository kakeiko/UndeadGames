import type { NextRequest } from "next/server";

function normalizeBaseUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  return value.trim().replace(/^['"]|['"]$/g, "").replace(/\/$/, "");
}

export function getRequestOrigin(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");

  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL) ?? req.nextUrl.origin;
}
