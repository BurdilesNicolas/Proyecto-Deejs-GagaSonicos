import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../estilos/Inicio.css";
import { productos } from "../data/Productos";
import { getSpotifyAlbums } from "../services/spotify";

const staticMusicData = productos.map((producto) => ({
  id: producto.id,
  productId: producto.id,
  title: producto.nombre,
  artist: producto.artista,
  image: producto.imagen,
}));

function Inicio() {
  const [musicData, setMusicData] = useState(staticMusicData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMusic() {
      try {
        setIsLoading(true);
        const data = await getSpotifyAlbums('90s hip hop rap');
        if (data && data.length > 0) {
          setMusicData(data);
        } else {
          setMusicData(staticMusicData);
        }
      } catch (error) {
        console.error("Spotify API Error, using fallback data:", error);
        setMusicData(staticMusicData);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMusic();
  }, []);

  const totalCards = musicData.length;
  const cardsToShow = 4;
  const maxIndex = Math.max(0, totalCards - cardsToShow);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <div className="inicio-page">
      <div className="hero">
        <h1 className="hero-title">DEEJ`S</h1>
        <div className="hero-icons">
          <i className="bi bi-music-note-beamed floating-icon"></i>
          <i className="bi bi-volume-up floating-icon"></i>
          <i className="bi bi-mic floating-icon"></i>
        </div>
        <div className="botones_inicio">
          <button className="btn-explorar">
            <a href="/productos">Explorar</a>
          </button>
          <button className="btn-conocernos">
            <a href="#nosotros">Conocernos</a>
          </button>
        </div>
      </div>

      <section id="nosotros" className="about-section">
        <div className="about-container">
          <div className="about-header">
            <i className="bi bi-heart-fill heart-icon"></i>
            <h2 className="about-title">Pasión por el Sonido</h2>
            <i className="bi bi-heart-fill heart-icon"></i>
          </div>
          <p className="about-text">
            En DEEJ'S, no solo vendemos equipos; compartimos una obsesión por la calidad auditiva.
            Desde los vinilos más raros hasta la tecnología de audio más avanzada,
            estamos aquí para que cada nota cuente. Bienvenido al destino definitivo para los melómanos.
          </p>
        </div>
      </section>

      <div className="secundario">
        <div className="subtitulo">
          <h2 className="section-title">Álbumes de Música</h2>
        </div>

        <div className="music-carousel-wrapper">
          <button className="music-nav-btn prev" onClick={prevSlide}>
            <i className="bi bi-chevron-left"></i>
          </button>

          <div className="music-carousel-viewport">
            {isLoading ? (
              <div className="loading-music" style={{ color: 'white', textAlign: 'center', width: '100%', padding: '20px' }}>
                Cargando música de Spotify...
              </div>
            ) : (
              <div
                className="music-cards-container"
                style={{
                  transform: `translateX(-${currentIndex * 31.33}vw)`,
                }}
              >
                {musicData && musicData.map((music) => (
                  <div className="music-card" key={music.id}>
                    <Link
                      className="music-card-link"
                      to={
                        music.spotifyAlbumId
                          ? `/Productos/spotify/${music.spotifyAlbumId}`
                          : `/Productos/${music.productId}`
                      }
                      aria-label={`Ver álbum ${music.title} de ${music.artist}`}
                    >
                      <div className="music-card-inner">
                        <div className="music-img-wrapper">
                          <img src={music.image} alt={music.title} className="music-img" />
                        </div>
                        <div className="music-info">
                          <h3 className="music-title">{music.title}</h3>
                          <p className="music-artist">{music.artist}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="music-nav-btn next" onClick={nextSlide}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon"><i className="bi bi-headphones"></i></span>
            <h3>Audio Premium</h3>
            <p>Equipos de alta fidelidad para una experiencia inmersiva.</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon"><i className="bi bi-disc"></i></span>
            <h3>Coleccionismo</h3>
            <p>Vinilos y ediciones limitadas que hacen historia.</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon"><i className="bi bi-music-note-beamed"></i></span>
            <h3>Accesorios</h3>
            <p>Todo lo necesario para optimizar tu setup musical.</p>
          </div>
        </div>
      </div>

      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">¿Listo para elevar tu sonido?</h2>
          <p className="cta-subtitle">Únete a nuestra comunidad y descubre el mundo del audio pro.</p>
          <button className="btn-cta">Ir a la Comunidad</button>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
