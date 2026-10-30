// Usamos las claves directamente para evitar errores de lectura de process.env que pueden causar pantalla blanca
const CLIENT_ID = '5ba73035ef284a808509bd5ac8013fce';
const CLIENT_SECRET = '3132ea363dc04f538f629e3582c182d6';

async function getAccessToken() {
  try {
    const authString = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const encodedAuth = btoa(authString);

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedAuth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Spotify Auth Error: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (e) {
    console.error("Error in getAccessToken:", e);
    throw e;
  }
}

export async function getSpotifyTracks(query = 'top hits') {
  try {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching tracks from Spotify');
    }

    const data = await response.json();

    return data.tracks.items.map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      image: track.album.images[0]?.url || 'https://via.placeholder.com/300',
    }));
  } catch (error) {
    console.error('Spotify Service Error:', error);
    throw error;
  }
}

export async function getSpotifyAlbums(query = 'top albums') {
  const token = await getAccessToken();
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching albums from Spotify: ${response.status}`);
  }

  const data = await response.json();
  return data.albums.items.map((album) => ({
    id: album.id,
    title: album.name,
    artist: album.artists.map((artist) => artist.name).join(', '),
    image: album.images[0]?.url || 'https://via.placeholder.com/300',
    spotifyAlbumId: album.id,
  }));
}

export async function getSpotifyAlbum(albumId) {
  const token = await getAccessToken();
  const response = await fetch(
    `https://api.spotify.com/v1/albums/${encodeURIComponent(albumId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching album from Spotify: ${response.status}`);
  }

  return response.json();
}
