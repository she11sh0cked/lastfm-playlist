import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { user, type },
  } = req;

  const data = await fetch(
    `https://www.last.fm/player/station/user/${user}/${type}`
  )
    .then((response) => response.json())
    .then((response) => response.playlist)
    .then((response) =>
      response.map((song) => ({
        name: song.name,
        artists: song.artists.map((artist) => artist.name),
        urls: {
          lastfm: `https://www.last.fm${song.url}`,
          ...Object.fromEntries(
            (song.playlinks ?? []).map((playlink) => [
              playlink.affiliate,
              playlink.url,
            ])
          ),
        },
      }))
    );

  res.statusCode = 200;
  res.json(data);
}
