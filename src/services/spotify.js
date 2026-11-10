// Todas las consultas pasan por el endpoint propio del servidor. Así el cliente
// nunca necesita conocer las credenciales de Spotify y recibe los errores con
// un mensaje uniforme para que cada pantalla pueda mostrarlos o registrarlos.
async function spotifyRequest(params) {
  // URLSearchParams codifica correctamente los parámetros de búsqueda,
  // incluyendo espacios y caracteres especiales del nombre consultado.
  const query = new URLSearchParams(params);
  const response = await fetch(`/api/spotify?${query.toString()}`);
  const data = await response.json();

  // El servidor devuelve el mensaje de Spotify cuando está disponible;
  // ante otra respuesta HTTP, se informa el código para facilitar el diagnóstico.
  if (!response.ok) {
    throw new Error(
      data.error || `No se pudo consultar Spotify (HTTP ${response.status}).`,
    );
  }

  return data;
}

// Busca canciones, artistas o álbumes. Filtra los tipos no permitidos, elimina
// opciones repetidas y mantiene el límite dentro del rango aceptado por el API.
export async function searchSpotify(query, types = ["track"], limit = 8) {
  // Se recortan espacios para evitar enviar búsquedas vacías o innecesariamente
  // rodeadas de espacios al servicio externo.
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    throw new Error("Escribí algo para buscar en Spotify.");
  }

  // Esta lista coincide con los tipos que habilita el endpoint del proyecto.
  const allowedTypes = new Set(["track", "artist", "album"]);
  const selectedTypes = [...new Set(types)].filter((type) =>
    allowedTypes.has(type),
  );
  if (selectedTypes.length === 0) {
    throw new Error("Elegí canciones, artistas o álbumes para buscar.");
  }

  // La respuesta conserva el formato de Spotify con sus grupos tracks,
  // artists y albums; cada consumidor puede elegir el que solicitó.
  return spotifyRequest({
    q: normalizedQuery,
    type: selectedTypes.join(","),
    limit: String(Math.min(Math.max(limit, 1), 10)),
  });
}

// Adaptador para las pantallas que necesitan canciones en un formato sencillo:
// nombre, artista, imagen y enlace, sin obligarlas a conocer toda la respuesta.
export async function getSpotifyTracks(query = "top hits") {
  const { tracks } = await searchSpotify(query, ["track"], 10);
  return tracks.map((track) => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    // Algunas respuestas no incluyen imágenes; la cadena vacía permite que
    // la interfaz utilice su imagen alternativa sin fallar.
    image: track.album.images[0]?.url ?? "",
    spotifyUrl: track.external_urls?.spotify,
  }));
}

// Adaptador equivalente para álbumes. También expone el ID separado porque
// el reproductor y la página de detalle lo usan para solicitar el álbum.
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

// Recupera un álbum puntual a partir de su ID de Spotify; el endpoint del
// servidor reconoce este parámetro y evita realizar una búsqueda por texto.
export async function getSpotifyAlbum(albumId) {
  // Validación local para responder con un error entendible antes de hacer
  // una petición que no podría identificar ningún álbum.
  if (!albumId) {
    throw new Error("Falta el identificador del álbum de Spotify.");
  }

  return spotifyRequest({ albumId });
}
