import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    const data = await response.json();
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

export async function GET() {
  const cookieStore = await cookies();
  const steamId = cookieStore.get("steamid")?.value;
  if (!steamId) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "STEAM_API_KEY nao configurada" }, { status: 500 });
  }

  const [gamesRes, profileRes] = await Promise.all([
    fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`
    ),
    fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
    ),
  ]);

  const gamesData = await gamesRes.json();
  const profileData = await profileRes.json();

  const games = gamesData.response?.games || [];
  const profile = profileData.response?.players?.[0] || null;
  const gamesWithAchievements = await Promise.all(
    games.map(async (game: { appid: number; name: string; playtime_forever: number }) => {
      const achievementSummary = await getAchievementSummary({
        appid: game.appid,
        apiKey,
        steamId,
      });

      return {
        ...game,
        ...achievementSummary,
      };
    })
  );
const res = NextResponse.json({ games: gamesWithAchievements, profile });
  
  res.cookies.set("steamid", steamId, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}

