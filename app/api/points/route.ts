import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/utils/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const steamId = cookieStore.get("steamid")?.value;

  if (!steamId) {
    return NextResponse.json({ points: 0 }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      steamId,
    },
    select: {
      points: true,
    },
  });

  return NextResponse.json({ points: user?.points ?? 0 });
}
