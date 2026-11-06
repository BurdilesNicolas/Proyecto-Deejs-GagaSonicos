const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_URL = "https://api.spotify.com/v1";
const ALLOWED_TYPES = new Set(["track", "artist", "album"]);
const ALBUM_ID_PATTERN = /^[A-Za-z0-9]{1,64}$/;

let cachedToken;
let tokenExpiresAt = 0;
let tokenRequest;

function respond(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  for (const [name, value] of Object.entries(headers)) {
    res.setHeader(name, value);
  }
  res.end(JSON.stringify(body));
}

function credentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId) {
    throw new Error(
      "Falta configurar SPOTIFY_CLIENT_ID en el servidor.",
    );
  }
  if (!clientSecret) {
    throw new Error(
      "Falta configurar SPOTIFY_CLIENT_SECRET en el servidor. Generá una clave nueva en Spotify for Developers; no la compartas por el chat.",
    );
  }

  return { clientId, clientSecret };
}

async function getAccessToken() {
  if (cachedToken && tokenExpiresAt > Date.now() + 30_000) {
    return cachedToken;
  }
  if (tokenRequest) return tokenRequest;

  tokenRequest = (async () => {
    const { clientId, clientSecret } = credentials();
    const authorization = Buffer.from(
      `${clientId}:${clientSecret}`,
      "utf8",
    ).toString("base64");
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 400) {
        throw new Error(
          "Spotify rechazó las credenciales de la aplicación. Revisá el Client ID y regenerá el Client Secret.",
        );
      }
      throw new Error(`Spotify no pudo autorizar la aplicación (HTTP ${response.status}).`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + data.expires_in * 1000;
    return cachedToken;
  })().finally(() => {
    tokenRequest = undefined;
  });

  return tokenRequest;
}

function simplifyArtist(artist) {
  return {
    id: artist.id,
    name: artist.name,
    images: artist.images ?? [],
    genres: artist.genres ?? [],
    popularity: artist.popularity,
    external_urls: artist.external_urls,
  };
}

function simplifyAlbum(album) {
  return {
    id: album.id,
    name: album.name,
    artists: (album.artists ?? []).map(({ id, name, external_urls }) => ({
      id,
      name,
      external_urls,
    })),
    images: album.images ?? [],
    release_date: album.release_date,
    total_tracks: album.total_tracks,
    album_type: album.album_type,
    label: album.label,
    external_urls: album.external_urls,
  };
}

function simplifyTrack(track) {
  return {
    id: track.id,
    name: track.name,
    artists: (track.artists ?? []).map(({ id, name, external_urls }) => ({
      id,
      name,
      external_urls,
    })),
    album: simplifyAlbum(track.album ?? {}),
    popularity: track.popularity,
    external_urls: track.external_urls,
  };
}

async function spotifyFetch(path, token) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) return response.json();

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    throw Object.assign(
      new Error("Spotify limitó temporalmente las consultas."),
      retryAfter ? { retryAfter } : {},
    );
  }
  if (response.status === 401) {
    cachedToken = undefined;
    tokenExpiresAt = 0;
    throw new Error("Spotify rechazó el token de aplicación. Probá de nuevo.");
  }
  if (response.status === 403) {
    throw new Error(
      "Spotify no habilitó este endpoint para la aplicación. Revisá el acceso y las restricciones de la app.",
    );
  }
  throw new Error(`Spotify no pudo completar la búsqueda (HTTP ${response.status}).`);
}

async function handleSpotify(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    respond(res, 405, { error: "Método no permitido." });
    return;
  }

  const params = new URL(req.url, "http://localhost").searchParams;
  const albumId = params.get("albumId");

  if (albumId) {
    if (!ALBUM_ID_PATTERN.test(albumId)) {
      respond(res, 400, { error: "El identificador del álbum no es válido." });
      return;
    }
  } else {
    const query = params.get("q")?.trim();
    const types = (params.get("type") ?? "track")
      .split(",")
      .filter((type) => ALLOWED_TYPES.has(type));
    const parsedLimit = Number(params.get("limit") ?? 8);

    if (!query || query.length > 100) {
      respond(res, 400, { error: "La búsqueda debe tener entre 1 y 100 caracteres." });
      return;
    }
    if (types.length === 0) {
      respond(res, 400, { error: "Elegí canciones, artistas o álbumes para buscar." });
      return;
    }
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 10) {
      respond(res, 400, { error: "La cantidad de resultados debe estar entre 1 y 10." });
      return;
    }
  }

  try {
    const token = await getAccessToken();
    if (albumId) {
      const album = await spotifyFetch(
        `/albums/${encodeURIComponent(albumId)}`,
        token,
      );
      respond(res, 200, simplifyAlbum(album), {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      });
      return;
    }

    const query = new URL(req.url, "http://localhost").searchParams;
    const types = (query.get("type") ?? "track")
      .split(",")
      .filter((type) => ALLOWED_TYPES.has(type));
    const spotifyParams = new URLSearchParams({
      q: query.get("q").trim(),
      type: [...new Set(types)].join(","),
      limit: query.get("limit") ?? "8",
    });
    const data = await spotifyFetch(`/search?${spotifyParams}`, token);

    respond(
      res,
      200,
      {
        tracks: (data.tracks?.items ?? []).map(simplifyTrack),
        artists: (data.artists?.items ?? []).map(simplifyArtist),
        albums: (data.albums?.items ?? []).map(simplifyAlbum),
      },
      { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    );
  } catch (error) {
    respond(
      res,
      error.retryAfter ? 429 : error.message.startsWith("Falta configurar") ? 503 : 502,
      { error: error.message },
      error.retryAfter ? { "Retry-After": error.retryAfter } : {},
    );
  }
}

export default handleSpotify;
