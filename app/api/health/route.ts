import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({
    ok: true,
  });

  response.headers.set(
    "Access-Control-Allow-Origin",
    "https://undeadgames.vercel.app"
  );

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return response;
}