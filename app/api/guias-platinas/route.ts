import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/app/utils/prisma";

async function getSteamId() {
  const cookieStore = await cookies();
  return cookieStore.get("steamid")?.value;
}

export async function GET(request: Request) {
  const steamId = await getSteamId();
  const { searchParams } = new URL(request.url);
  const jogo = searchParams.get("jogo");
  const conquistaApiName = searchParams.get("conquistaApiName");

  if (!steamId) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  if (!jogo) {
    return NextResponse.json({ error: "Jogo nao informado" }, { status: 400 });
  }

  if (!conquistaApiName) {
    return NextResponse.json(
      { error: "Conquista nao informada" },
      { status: 400 }
    );
  }

  const guides = await prisma.guias_Platinas.findMany({
    where: {
      jogo,
      conquistaApiName,
      aprovado: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json({ guides });
}

export async function POST(request: Request) {
  const steamId = await getSteamId();

  if (!steamId) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    jogo?: string;
    conquistaApiName?: string;
    conquistaNome?: string;
    texto?: string;
    link?: string;
  };

  if (!body.jogo || !body.conquistaApiName || !body.conquistaNome || !body.texto || !body.link) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const guide = await prisma.guias_Platinas.create({
    data: {
      jogo: body.jogo,
      conquistaApiName: body.conquistaApiName,
      conquistaNome: body.conquistaNome,
      titulo: `Guia de ${body.conquistaNome}`,
      descricao: "",
      texto: body.texto,
      link: body.link,
      aprovado: false,
      dono: {
        connect: { steamId },
      },
    },
  });

  return NextResponse.json({ guide }, { status: 201 });
}
