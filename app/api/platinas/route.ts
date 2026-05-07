import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/app/utils/prisma";

interface PlatinumGameInput {
  name?: string;
  trofeusConquistados?: number;
  trofeusExistentes?: number;
}

function calculatePlatinumPoints(trofeuFinal: number, trofeuAtual: number) {
  return (trofeuFinal - trofeuAtual) * 10 + 500;
}

async function getSteamId() {
  const cookieStore = await cookies();
  return cookieStore.get("steamid")?.value;
}

async function findUserPlatinums(steamId: string) {
  return prisma.platinas.findMany({
    where: {
      donoSteamId: steamId,
    },
    orderBy: {
      id: "desc",
    },
  });
}

export async function GET() {
  const steamId = await getSteamId();

  if (!steamId) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const platinums = await findUserPlatinums(steamId);

  return NextResponse.json({ platinums });
}

export async function POST(request: Request) {
  const steamId = await getSteamId();

  if (!steamId) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as { games?: PlatinumGameInput[] };
  const games = body.games ?? [];

  if (games.length === 0) {
    return NextResponse.json(
      { error: "Selecione pelo menos um jogo para platinar" },
      { status: 400 }
    );
  }

  const validGames = games.filter(
    (game) =>
      game.name &&
      typeof game.trofeusConquistados === "number" &&
      typeof game.trofeusExistentes === "number"
  );

  if (validGames.length === 0) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const existingPlatinums = await prisma.platinas.findMany({
    where: {
      donoSteamId: steamId,
      jogo: {
        in: validGames.map((game) => game.name as string),
      },
    },
    select: {
      jogo: true,
    },
  });
  const existingGames = new Set(existingPlatinums.map((platinum) => platinum.jogo));

  const gamesToCreate = validGames.filter(
    (game) => !existingGames.has(game.name as string)
  );

  await Promise.all(
    gamesToCreate.map((game) => {
      const trofeuAtual = game.trofeusConquistados ?? 0;
      const trofeuFinal = game.trofeusExistentes ?? 0;

      return prisma.platinas.create({
        data: {
          jogo: game.name as string,
          trofeuInicial: trofeuAtual,
          trofeuAtual,
          trofeuFinal,
          points: calculatePlatinumPoints(trofeuFinal, trofeuAtual),
          dono: {
            connect: { steamId },
          },
        },
      });
    })
  );

  const platinums = await findUserPlatinums(steamId);

  return NextResponse.json({ platinums }, { status: 201 });
}

export async function PUT(request: Request) {
  const steamId = await getSteamId();

  if (!steamId) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    trofeuAtual?: number;
    concluido?: boolean;
  };

  if (!body.id) {
    return NextResponse.json({ error: "Platina nao informada" }, { status: 400 });
  }

  const platinum = await prisma.platinas.findFirst({
    where: {
      id: body.id,
      donoSteamId: steamId,
    },
  });

  if (!platinum) {
    return NextResponse.json({ error: "Platina nao encontrada" }, { status: 404 });
  }

  const nextTrofeuAtual =
    typeof body.trofeuAtual === "number" ? body.trofeuAtual : platinum.trofeuAtual;
  const concluido = body.concluido ?? nextTrofeuAtual >= platinum.trofeuFinal;

  const updatedPlatinum = await prisma.platinas.update({
    where: {
      id: body.id,
    },
    data: {
      trofeuAtual: nextTrofeuAtual,
      concluido,
    },
  });
  if (concluido) {
      await prisma.user.update({
        where: {
            steamId : steamId
        },
        data: {
            points: {
                increment: platinum?.points ?? 0,
            },
        },
      });
  }

  const platinas = await prisma.platinas.findMany({
        where: {
            donoSteamId: steamId,
            concluido: true
        }
    });
  
  if (platinas.length >= 1) {
        await prisma.medalha.updateMany({
            where: {
                objetivo: "Caçador de Platina",
                donoSteamId : steamId
            },
            data: {
                conquistada:true
            },
        });
        if (platinas.length >= 10) {
                await prisma.medalha.updateMany({
                    where: {
                        objetivo: "Mestre das Platinas",
                        donoSteamId : steamId
                    },
                    data: {
                        conquistada:true
                    },
                });
                if (platinas.length >= 100) {
                    await prisma.medalha.updateMany({
                        where: {
                            objetivo: "Lendário",
                            donoSteamId : steamId
                        },
                        data: {
                            conquistada:true
                        },
                    });
                }  
        }   
    }
  return NextResponse.json({ platinum: updatedPlatinum });
}
