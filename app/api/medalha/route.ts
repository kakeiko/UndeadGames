import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(request: Request) {
    const body = await request.json();
    const { icon, objetivo, steamId, adjetivo } = body;
    if (!icon || !objetivo || !steamId || !adjetivo) {
        return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    const medalha = await prisma.medalha.create({
        data: {
            icon: icon,
            objetivo: objetivo,
            adjetivo: adjetivo,
            dono: {
                connect: { steamId }
            }
        },
    });

    return NextResponse.json(medalha);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get("steamId");
    const filtro = searchParams.get("adjetivo")
    let badges
    if (!steamId) {
        return NextResponse.json({ error: "Steam ID não fornecido" }, { status: 400 });
    }
    if (!filtro) {
        badges = await prisma.medalha.findMany({
            where: {
                donoSteamId: steamId
            }
        });
    }
    
    else {
        badges = await prisma.medalha.findMany({
            where: {
                donoSteamId: steamId,
                adjetivo: filtro,
            }
        });
    }

    return NextResponse.json({ badges });
}

export async function PUT(request: Request) {
    const body = await request.json();
    const medalha = await prisma.medalha.updateMany({
        where: {
            objetivo: body.objetivo,
            donoSteamId : body.donoSteamId
        },
        data: {
            conquistada:true
        },
    });

    return NextResponse.json(medalha);
}