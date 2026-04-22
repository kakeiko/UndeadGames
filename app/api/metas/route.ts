import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(request: Request) {
    const body = await request.json();
    const { gameName, label, points, steamId } = body;
    if (!gameName || !label || !points || !steamId) {
        return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const pendingGoal = await prisma.meta.findFirst({
        where: {
            jogo: gameName,
            donoSteamId: steamId,
            concluido: false,
        }
    });

    if (pendingGoal) {
        return NextResponse.json(
            { error: "Ja existe uma meta pendente para este jogo. Conclua a meta atual antes de criar outra." },
            { status: 409 }
        );
    }

    const meta = await prisma.meta.create({
        data: {
            jogo: gameName,
            objetivo: label,
            points: points,
            dono: {
                connect: { steamId }
            }
        },
    });

    return NextResponse.json(meta);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get("steamId");

    if (!steamId) {
        return NextResponse.json({ error: "Steam ID não fornecido" }, { status: 400 });
    }

    const goals = await prisma.meta.findMany({
        where: {
            donoSteamId: steamId
        }
    });

    return NextResponse.json({ goals });
}
export async function PUT(request: Request) {
    
    const body = await request.json();
    const meta = await prisma.meta.update({
        where: {
            id : body.metaId
        },
        data: {
            concluido:true
        },
    });

    const goals = await prisma.meta.findMany({
        where: {
            donoSteamId: body.steamId
        }
    });

    const metaAtual = goals.find((g) => g.id === body.metaId);

    const user = await prisma.user.update({
            where: {
                steamId : body.steamId
            },
            data: {
                points: {
                    increment: metaAtual?.points ?? 0,
                },
            },
        });
    if (user.points >= 100) {
         await prisma.medalha.updateMany({
            where: {
                objetivo: "100 pontos",
                donoSteamId : body.steamId
            },
            data: {
                conquistada:true
            },
        });
        
    }
    if (goals.length >= 1) {
        await prisma.medalha.updateMany({
            where: {
                objetivo: "Primeiro comeback",
                donoSteamId : body.steamId
            },
            data: {
                conquistada:true
            },
        });
        if (goals.length >= 3) {
                await prisma.medalha.updateMany({
                    where: {
                        objetivo: "3 metas seguidas",
                        donoSteamId : body.steamId
                    },
                    data: {
                        conquistada:true
                    },
                });
                if (goals.length >= 10) {
                    await prisma.medalha.updateMany({
                        where: {
                            objetivo: "Ca\u00E7ador de backlog",
                            donoSteamId : body.steamId
                        },
                        data: {
                            conquistada:true
                        },
                    });
                    if (goals.length >= 100) {
                        await prisma.medalha.updateMany({
                            where: {
                                objetivo: "Lend\u00E1rio",
                                donoSteamId : body.steamId
                            },
                            data: {
                                conquistada:true
                            },
                        });
                    }
                }  
        }   
    }

    return NextResponse.json(meta);
}
