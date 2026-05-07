import type { Game } from "../../dashboard/interfaces/game";

export function SteamHeaderImage({ appid, name }: Pick<Game, "appid" | "name">) {
  return (
    <img
      src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`}
      alt={name}
      className="w-full aspect-[460/215] object-cover block"
    />
  );
}
