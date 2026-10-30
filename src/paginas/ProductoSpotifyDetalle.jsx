import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSpotifyAlbum } from '../services/spotify'
import '../estilos/ProductoDetalle.css'

function ProductoSpotifyDetalle() {
  const { spotifyAlbumId } = useParams()
  const [album, setAlbum] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    setAlbum(null)
    setError('')
    window.scrollTo(0, 0)

    getSpotifyAlbum(spotifyAlbumId)
      .then((data) => {
        if (activo) setAlbum(data)
      })
      .catch((fetchError) => {
        console.error('Spotify album detail error:', fetchError)
        if (activo) setError('No pudimos cargar este álbum desde Spotify. Inténtalo nuevamente más tarde.')
      })

    return () => {
      activo = false
    }
  }, [spotifyAlbumId])

  if (error) {
    return (
      <div className="pagina-detalle">
        <div className="detalle-contenedor detalle-vacio">
          <h1>No pudimos cargar el álbum</h1>
          <p>{error}</p>
          <Link to="/" className="detalle-btn detalle-btn-principal">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="pagina-detalle">
        <div className="detalle-contenedor detalle-vacio" role="status">
          <p>Cargando álbum de Spotify...</p>
        </div>
      </div>
    )
  }

  const artists = album.artists.map((artist) => artist.name).join(', ')
  const image = album.images[0]?.url
  const spotifyUrl = album.external_urls?.spotify
  const ficha = [
    ['Artista', artists],
    ['Lanzamiento', album.release_date],
    ['Cantidad de temas', album.total_tracks],
    ['Sello', album.label],
  ].filter(([, value]) => value)

  return (
    <div className="pagina-detalle">
      <div className="detalle-contenedor">
        <nav className="detalle-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link>
          <span aria-hidden="true"> › </span>
          <span>{album.name}</span>
        </nav>

        <section className="detalle-hero">
          <div className="detalle-visual">
            <div className="detalle-portada-wrap">
              <div className="detalle-disco" aria-hidden="true" />
              <div className="detalle-funda" aria-hidden="true" />
              <div className="detalle-portada">
                {image ? (
                  <img src={image} alt={`Portada de ${album.name}`} />
                ) : (
                  <span className="detalle-portada-vacia" aria-hidden="true">♪</span>
                )}
              </div>
            </div>
          </div>

          <div className="detalle-panel">
            <div className="detalle-info">
              <h1 className="detalle-titulo">“{album.name}”</h1>
              <p className="detalle-artista">{artists}</p>
              {spotifyUrl && (
                <a
                  className="detalle-btn detalle-btn-secundario"
                  href={spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir en Spotify
                </a>
              )}
            </div>

            <div className="detalle-spotify">
              <iframe
                title={`Escuchar ${album.name} en Spotify`}
                src={`https://open.spotify.com/embed/album/${encodeURIComponent(album.id)}?utm_source=generator&theme=0`}
                width="100%"
                height="352"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <details className="detalle-acordeon" open>
          <summary>Información del álbum</summary>
          <div className="detalle-acordeon-contenido">
            <dl className="detalle-ficha">
              {ficha.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </details>
      </div>
    </div>
  )
}

export default ProductoSpotifyDetalle
