import { useState } from "react";
import "../estilos/Inicio.css";

function Inicio() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const musicData = [
    { id: 1, title: "Sinfonía No. 5", artist: "Beethoven", image: "https://via.placeholder.com/300x300?text=Beethoven" },
    { id: 2, title: "Bohemian Rhapsody", artist: "Queen", image: "https://via.placeholder.com/300x300?text=Queen" },
    { id: 3, title: "Billie Jean", artist: "Michael Jackson", image: "https://via.placeholder.com/300x300?text=MJ" },
    { id: 4, title: "Imagine", artist: "John Lennon", image: "https://via.placeholder.com/300x300?text=Lennon" },
    { id: 5, title: "Smooth Criminal", artist: "Michael Jackson", image: "https://via.placeholder.com/300x300?text=MJ2" },
    { id: 6, title: "Like a Virgin", artist: "Madonna", image: "https://via.placeholder.com/300x300?text=Madonna" },
    { id: 7, title: "Hotel California", artist: "Eagles", image: "https://via.placeholder.com/300x300?text=Eagles" },
    { id: 8, title: "Stayin' Alive", artist: "Bee Gees", image: "https://via.placeholder.com/300x300?text=BeeGees" },
    { id: 9, title: "Thriller", artist: "Michael Jackson", image: "https://via.placeholder.com/300x300?text=Thriller" },
    { id: 10, title: "Yesterday", artist: "The Beatles", image: "https://via.placeholder.com/300x300?text=Beatles" },
  ];

  const totalCards = musicData.length;
  const cardsToShow = 3;
  const maxIndex = totalCards - cardsToShow;

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
        <div className="botones_inicio">
          <button className="btn-explorar">
            <a href="/productos">Explorar</a>
          </button>
          <button className="btn-conocernos">
            <a href="">Conocernos</a>
          </button>
        </div>
      </div>
      <div className="secundario">
        <div className="subtitulo">
          <h2 className="section-title">Temas de Música</h2>
        </div>

        <div className="music-carousel-wrapper">
          <button className="music-nav-btn prev" onClick={prevSlide}>
            &#10094;
          </button>

          <div className="music-carousel-viewport">
            <div
              className="music-cards-container"
              style={{
                transform: `translateX(-${currentIndex * 31.33}vw)`,
              }}
            >
              {musicData.map((music) => (
                <div className="music-card" key={music.id}>
                  <div className="music-card-inner">
                    <div className="music-img-wrapper">
                      <img src={music.image} alt={music.title} className="music-img" />
                    </div>
                    <div className="music-info">
                      <h3 className="music-title">{music.title}</h3>
                      <p className="music-artist">{music.artist}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="music-nav-btn next" onClick={nextSlide}>
            &#10095;
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inicio;
