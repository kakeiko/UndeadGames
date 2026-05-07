import { NextResponse } from "next/server";
import { cookies } from "next/headers";


const HORA_FAIXAS = {
  "menos8h": { min: 0, max: 60*8 },
  "mais8h": { min: 60*8, max: Infinity },
} as const;

type HoraFaixa = keyof typeof HORA_FAIXAS;

function parseFilters(searchParams: URLSearchParams) {
  const appid = searchParams.get("appid");
  const faixaHora = searchParams.get("faixaHora") as HoraFaixa | null;
  const platinado = searchParams.get("platinado");
  
  return {
    appid: appid ? Number(appid) : null,
    faixaHora: faixaHora && faixaHora in HORA_FAIXAS ? faixaHora : null,
    platinado: platinado === "true" ? true : platinado === "false" ? false : null,
  };
}

function applyFilters(
  games: Game[],
  filters: ReturnType<typeof parseFilters>
): Game[] {
  return games.filter((game) => {
    if (filters.appid !== null && game.appid !== filters.appid) {
      return false;
    }

    if (filters.faixaHora !== null) {
      const { min, max } = HORA_FAIXAS[filters.faixaHora];
      if (game.playtime_forever < min || game.playtime_forever >= max) {
        return false;
      }
    }

    if (filters.platinado !== null) {
      const isPlatinado =
        game.trofeusExistentes > 0 &&
        game.trofeusConquistados >= game.trofeusExistentes;

      if (isPlatinado !== filters.platinado) {
        return false;
      }
    }

    return true;
  });
}

async function readSteamJson(response: Response, source: string) {
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        `Steam respondeu 401 em ${source}. Verifique se a STEAM_API_KEY esta valida e autorizada.`
      );
    }

    throw new Error(`Steam respondeu ${response.status} em ${source}`);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Steam retornou uma resposta que nao e JSON em ${source}`);
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`Steam retornou JSON invalido em ${source}`);
  }
}

async function getAchievementSummary({
  appid,
  apiKey,
  steamId,
}: {
  appid: number;
  apiKey: string;
  steamId: string;
}) {
  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apiKey}&steamid=${steamId}&appid=${appid}`
    );

    if (!response.ok) {
      return { trofeusConquistados: 0, trofeusExistentes: 0 };
    }

    const data = await readSteamJson(response, "conquistas");
    const achievements = data.playerstats?.achievements;

    if (!Array.isArray(achievements)) {
      return { trofeusConquistados: 0, trofeusExistentes: 0 };
    }

    const trofeusExistentes = achievements.length;
    const trofeusConquistados = achievements.filter(
      (achievement: { achieved?: number }) => achievement.achieved === 1
    ).length;

    return { trofeusConquistados, trofeusExistentes };
  } catch {
    return { trofeusConquistados: 0, trofeusExistentes: 0 };
  }
}

interface Game {
  appid: number;
  name: string;
  playtime_forever: number;
  trofeusConquistados: number;
  trofeusExistentes: number;
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const steamId = cookieStore.get("steamid")?.value;

    if (!steamId) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const apiKey = process.env.STEAM_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "STEAM_API_KEY nao configurada" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const filters = parseFilters(searchParams);

    const [gamesRes, profileRes] = await Promise.all([
      fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`
      ),
      fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
      ),
    ]);

    const gamesData = await readSteamJson(gamesRes, "jogos");
    const profileData = await readSteamJson(profileRes, "perfil");

    const rawGames: { appid: number; name: string; playtime_forever: number }[] =
      gamesData.response?.games || [];
    const profile = profileData.response?.players?.[0] || null;

    const gamesWithAchievements: Game[] = await Promise.all(
      rawGames.map(async (game) => {
        const achievementSummary = await getAchievementSummary({
          appid: game.appid,
          apiKey,
          steamId,
        });

        return { ...game, ...achievementSummary };
      })
    );

    const filteredGames = applyFilters(gamesWithAchievements, filters);

    const res = NextResponse.json({ games: filteredGames, profile });

    res.cookies.set("steamid", steamId, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha inesperada ao carregar dados da Steam";

    console.error("Erro em /api/games:", message);

    return NextResponse.json(
      { error: "Nao foi possivel carregar os jogos da Steam.", details: message },
      { status: 502 }
    );
  }
}