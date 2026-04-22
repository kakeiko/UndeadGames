import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(request: Request) {
    const body = await request.json();

    const dados = await prisma.dadosProgresso.create({
        data: {
            horaInicial: body.horaInicial,
            horaFinal: body.horaFinal,
            horaAtual: body.horaInicial,
            trofeuInicial: body.trofeuInicial,
            trofeuFinal: body.trofeuFinal,
            trofeuAtual: body.trofeuInicial,
            metaId: body.meta,
        },
    });

    return NextResponse.json(dados);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const metaId = searchParams.get("metaId");

    if (!metaId) {
        return NextResponse.json({ error: "Meta ID não fornecido" }, { status: 400 });
    }

    const dados = await prisma.dadosProgresso.findMany({
        where: {
            metaId: metaId
        }
    });

    return NextResponse.json({ dados });
}

export async function PUT(request: Request) {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const metaId = searchParams.get("metaId");
     if (!metaId) {
        console.error(metaId);
        return NextResponse.json({ error: "Meta ID não fornecido" }, { status: 400 });
    }
    const dadosAtualizados = await prisma.dadosProgresso.updateMany({
        where: {
            metaId: metaId
        },
        data: {
            horaAtual: body.horaAtual,
            trofeuAtual: body.trofeuAtual
        }
    })
    

    return NextResponse.json({ dados: dadosAtualizados });

}