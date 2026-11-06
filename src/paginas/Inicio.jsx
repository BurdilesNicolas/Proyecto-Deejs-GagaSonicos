import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SpotifyCard from "../componentes/inicio/SpotifyCard";
import { searchSpotify } from "../services/spotify";
import "../estilos/Inicio.css";

const SEARCH_TYPES = [
  { value: "track", label: "Canciones" },
  { value: "artist", label: "Artistas" },
  { value: "album", label: "Álbumes" },
  { value: "all", label: "Todo" },
];

function MediaSection({ id, eyebrow, title, type, items, emptyMessage }) {
  return (
    <section className="home-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="home-section__heading">
        <div>
          <p className="home-eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`}>{title}</h2>
        </div>
      </div>
      {items.length > 0 ? (
        <div className={`media-grid media-grid--${type}`}>
          {items.map((item) => (
            <SpotifyCard key={`${type}-${item.id}`} item={item} type={type} />
          ))}
        </div>
      ) : (
        <p className="home-empty">{emptyMessage}</p>
      )}
    </section>
  );
}

function Inicio() {
  const [homeContent, setHomeContent] = useState({
    tracks: [],
    artists: [],
    albums: [],
    discovery: [],
  });
  const [homeError, setHomeError] = useState("");
  const [homeLoading, setHomeLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [searchResults, setSearchResults] = useState([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      searchSpotify("hip hop", ["track"], 8),
      searchSpotify("hip hop", ["artist"], 8),
      searchSpotify("new music", ["album"], 8),
      searchSpotify("indie music", ["track", "artist", "album"], 8),
    ])
      .then(([tracks, artists, albums, discovery]) => {
        if (active) {
          setHomeContent({
            tracks: tracks.tracks,
            artists: artists.artists,
            albums: albums.albums,
            discovery: [
              ...discovery.tracks.slice(0, 3).map((item) => ({ item, type: "track" })),
              ...discovery.artists.slice(0, 3).map((item) => ({ item, type: "artist" })),
              ...discovery.albums.slice(0, 3).map((item) => ({ item, type: "album" })),
            ],
          });
        }
      })
      .catch((error) => {
        if (active) setHomeError(error.message);
      })
      .finally(() => {
        if (active) setHomeLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError("");
    setSearchSubmitted(true);
    setSearchResults([]);
    try {
      const types =
        searchType === "all" ? ["track", "artist", "album"] : [searchType];
      const results = await searchSpotify(searchQuery, types, 10);
      setSearchResults([
        ...results.tracks.map((item) => ({ item, type: "track" })),
        ...results.artists.map((item) => ({ item, type: "artist" })),
        ...results.albums.map((item) => ({ item, type: "album" })),
      ]);
    } catch (error) {
      setSearchError(error.message);
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <main className="inicio-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">
            <span className="home-hero__dot" />
            DEEJ&apos;S · CULTURA MUSICAL
          </p>
          <h1 id="home-hero-title">
            Encontrá el sonido <span>que va con vos.</span>
          </h1>
          <p className="home-hero__description">
            Explorá canciones, artistas y discos. Una puerta de entrada a música
            nueva y a tus próximos favoritos.
          </p>
          <div className="home-hero__actions">
            <a className="home-button home-button--primary" href="#explorador">
              Explorar música <i className="bi bi-arrow-down" aria-hidden="true" />
            </a>
            <Link className="home-button home-button--secondary" to="/productos">
              Ver productos <i className="bi bi-arrow-up-right" aria-hidden="true" />
            </Link>
          </div>
          <p className="home-hero__note">
            <i className="bi bi-activity" aria-hidden="true" />
            Música real de Spotify, seleccionada para explorar.
          </p>
        </div>
        <div className="home-hero__visual" aria-hidden="true">
          <div className="home-equalizer">
            <div className="home-equalizer__header">
              <span className="home-equalizer__status" />
              <span>VISUALIZADOR DE AUDIO</span>
              <i className="bi bi-sliders2" />
            </div>
            <div className="home-equalizer__display">
              <i className="bi bi-soundwave" />
              <div className="home-equalizer__bars">
                {[38, 57, 30, 75, 48, 88, 55, 37, 68, 96, 61, 43, 79, 52, 91, 63, 35, 72, 48, 85, 57, 38, 67, 94, 50, 76, 43, 62, 87, 47, 70].map((height, index) => (
                  <span
                    key={index}
                    style={{ "--bar-height": `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="home-equalizer__footer">
              <span>FRECUENCIAS</span>
              <span className="home-equalizer__levels"><i /><i /><i /><i /><i /></span>
              <i className="bi bi-bar-chart-line" />
            </div>
          </div>
        </div>
      </section>

      <section className="spotify-connect" aria-label="Catálogo de Spotify">
        <div className="spotify-connect__copy">
          <span className="spotify-connect__icon">
            <i className="bi bi-music-note-list" aria-hidden="true" />
          </span>
          <div>
            <h2>Catálogo musical</h2>
            <p>
              Temas, artistas y álbumes disponibles desde Spotify, sin iniciar sesión.
            </p>
          </div>
        </div>
        <span className="spotify-connect__status">
          <span className="spotify-connect__status-dot" />
          API pública
        </span>
      </section>

      <div className="home-content">
        <section className="home-section home-search" id="explorador" aria-labelledby="search-title">
          <div className="home-section__heading">
            <div>
              <p className="home-eyebrow">Encontrá lo que buscás</p>
              <h2 id="search-title">Explorador musical</h2>
            </div>
          </div>
          <form className="music-search" onSubmit={handleSearch}>
            <label className="visually-hidden" htmlFor="music-search-query">
              Buscar canciones, artistas o álbumes
            </label>
            <i className="bi bi-search" aria-hidden="true" />
            <input
              id="music-search-query"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscá una canción, artista o álbum"
              maxLength={100}
              required
            />
            <label className="visually-hidden" htmlFor="music-search-type">
              Tipo de resultado
            </label>
            <select
              id="music-search-type"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
              {SEARCH_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <button type="submit" disabled={searchLoading}>
              {searchLoading ? "Buscando…" : "Buscar"}
            </button>
          </form>
          {searchError && <p className="home-feedback home-feedback--error" role="alert">{searchError}</p>}
          {searchLoading && <p className="home-feedback" role="status">Buscando en Spotify…</p>}
          {searchSubmitted && !searchLoading && !searchError && searchResults.length === 0 && (
            <p className="home-feedback">No encontramos resultados. Probá con otra búsqueda.</p>
          )}
          {searchResults.length > 0 && (
            <div className="media-grid media-grid--search" aria-live="polite">
              {searchResults.map(({ item, type }) => (
                <SpotifyCard key={`${type}-${item.id}`} item={item} type={type} />
              ))}
            </div>
          )}
        </section>

        {homeLoading && (
          <p className="home-feedback home-feedback--loading" role="status">
            <span className="home-spinner" /> Cargando selecciones desde Spotify…
          </p>
        )}
        {homeError && <p className="home-feedback home-feedback--error" role="alert">{homeError}</p>}

        {!homeLoading && !homeError && (
          <>
            <MediaSection
              id="canciones-destacadas"
              eyebrow="Para ponerle play"
              title="Canciones destacadas"
              type="track"
              items={homeContent.tracks}
              emptyMessage="Spotify no devolvió canciones para esta búsqueda."
            />
            <MediaSection
              id="artistas-destacados"
              eyebrow="Nuevas voces y clásicos"
              title="Artistas para descubrir"
              type="artist"
              items={homeContent.artists}
              emptyMessage="Spotify no devolvió artistas para esta búsqueda."
            />
            <MediaSection
              id="albumes-recomendados"
              eyebrow="Discos para explorar"
              title="Álbumes para explorar"
              type="album"
              items={homeContent.albums}
              emptyMessage="Spotify no devolvió álbumes para esta búsqueda."
            />
            <section className="home-section home-discovery" aria-labelledby="discovery-title">
              <div className="home-section__heading">
                <div>
                  <p className="home-eyebrow">Una búsqueda, nuevas posibilidades</p>
                  <h2 id="discovery-title">Descubrí algo distinto</h2>
                  <p className="home-section__description">
                    Resultados de búsqueda de Spotify; no usamos el endpoint de recomendaciones.
                  </p>
                </div>
              </div>
              {homeContent.discovery.length > 0 ? (
                <div className="media-grid media-grid--discovery">
                  {homeContent.discovery.map(({ item, type }) => (
                    <SpotifyCard key={`discovery-${type}-${item.id}`} item={item} type={type} />
                  ))}
                </div>
              ) : (
                <p className="home-empty">Spotify no devolvió resultados para descubrir.</p>
              )}
            </section>
          </>
        )}

        <section className="home-about" id="nosotros" aria-labelledby="about-title">
          <div className="home-about__icon"><i className="bi bi-soundwave" aria-hidden="true" /></div>
          <div>
            <p className="home-eyebrow">DEEJ&apos;S</p>
            <h2 id="about-title">Pasión por el sonido</h2>
            <p>
              Compartimos una obsesión por la calidad auditiva: desde los vinilos
              más raros hasta la tecnología de audio para disfrutar cada nota.
            </p>
          </div>
          <Link className="home-button home-button--secondary" to="/productos">
            Explorar productos <i className="bi bi-arrow-up-right" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Inicio;
