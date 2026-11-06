async function spotifyRequest(params) {
  const query = new URLSearchParams(params);
  const response = await fetch(`/api/spotify?${query.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || `No se pudo consultar Spotify (HTTP ${response.status}).`,
    );
  }

  return data;
}

export async function searchSpotify(query, types = ["track"], limit = 8) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    throw new Error("Escribí algo para buscar en Spotify.");
  }

  const allowedTypes = new Set(["track", "artist", "album"]);
  const selectedTypes = [...new Set(types)].filter((type) =>
    allowedTypes.has(type),
  );
  if (selectedTypes.length === 0) {
    throw new Error("Elegí canciones, artistas o álbumes para buscar.");
  }

  return spotifyRequest({
    q: normalizedQuery,
    type: selectedTypes.join(","),
    limit: String(Math.min(Math.max(limit, 1), 10)),
  });
}

export async function getSpotifyTracks(query = "top hits") {
  const { tracks } = await searchSpotify(query, ["track"], 10);
  return tracks.map((track) => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    image: track.album.images[0]?.url ?? "",
    spotifyUrl: track.external_urls?.spotify,
  }));
}

export async function getSpotifyAlbums(query = "top albums") {
  const { albums } = await searchSpotify(query, ["album"], 10);
  return albums.map((album) => ({
    id: album.id,
    title: album.name,
    artist: album.artists.map((artist) => artist.name).join(", "),
    image: album.images[0]?.url ?? "",
    spotifyAlbumId: album.id,
    spotifyUrl: album.external_urls?.spotify,
  }));
}

export async function getSpotifyAlbum(albumId) {
  if (!albumId) {
    throw new Error("Falta el identificador del álbum de Spotify.");
  }

  return spotifyRequest({ albumId });
}
