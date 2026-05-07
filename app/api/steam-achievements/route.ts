import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface PlayerAchievement {
  apiname: string;
  achieved?: number;
}

interface SchemaAchievement {
  name: string;
  displayName?: string;
  description?: string;
  icon?: string;
  icongray?: string;
}

async function readSteamJson(response: Response, source: string) {
  if (!response.ok) {
    throw new Error(`Steam respondeu ${response.status} em ${source}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appid = searchParams.get("appid");
    const cookieStore = await cookies();
    const steamId = cookieStore.get("steamid")?.value;
    const apiKey = process.env.STEAM_API_KEY;

    if (!steamId) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    if (!appid) {
      return NextResponse.json({ error: "Jogo nao informado" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "STEAM_API_KEY nao configurada" },
        { status: 500 }
      );
    }

    const [playerRes, schemaRes] = await Promise.all([
      fetch(
        `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apiKey}&steamid=${steamId}&appid=${appid}`
      ),
      fetch(
        `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=${appid}`
      ),
    ]);

    const playerData = playerRes.ok
      ? await readSteamJson(playerRes, "conquistas do jogador")
      : null;
    const schemaData = schemaRes.ok
      ? await readSteamJson(schemaRes, "schema de conquistas")
      : null;

    const playerAchievements = new Map(
      ((playerData?.playerstats?.achievements ?? []) as PlayerAchievement[]).map(
        (achievement) => [achievement.apiname, achievement]
      )
    );

    const schemaAchievements =
      (schemaData?.game?.availableGameStats?.achievements ?? []) as SchemaAchievement[];

    const achievements = schemaAchievements.map((achievement) => {
      const playerAchievement = playerAchievements.get(achievement.name);
      const achieved = playerAchievement?.achieved === 1;

      return {
        apiname: achievement.name,
        name: achievement.displayName || achievement.name,
        description: achievement.description || "Sem descricao disponivel.",
        achieved,
        icon: achievement.icon,
        iconGray: achievement.icongray || achievement.icon,
      };
    });

    return NextResponse.json({ achievements });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao carregar conquistas";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
