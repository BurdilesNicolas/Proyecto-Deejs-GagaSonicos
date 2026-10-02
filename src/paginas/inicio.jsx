import { useState } from "react";
import "../estilos/Inicio.css";

function Inicio() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalCards = 8;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === totalCards - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalCards - 1 : prev - 1));
  };

  return (
    <div>
      <div className="hero">
        <h1>DEEJ`S</h1>
        <p></p>
        <div className="botones_inicio">
          <button>
            <a href="..\paginas\Productos">Explorar</a>
          </button>
          <button>
            <a href=""></a>Conocernos
          </button>
        </div>
        <p></p>
      </div>
      <div className="secundario">
        <div className="subtitulo">
          <h2>Novedades</h2>
        </div>

        <div className="carousel-container">
          <button className="nav-btn prev" onClick={prevSlide}>&#10094;</button>

          <div className="carousel-viewport">
            <div
              className="cards"
              style={{ transform: `translateX(-${currentIndex * 25}vw)` }}
            >
              {/* Carta 1 */}
              <div className="card">
                <p>Tema 1</p>
                <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                  <h3 className="card-title">"nombre"</h3>
                  <img src="" alt="" className="card-img" />
                  <p className="card-text">Autor:</p>
                </div>
              </div>
              {/* Carta 2 */}
              <div className="card">
                <p>Tema 2</p>
                <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                  <h3 className="card-title">"nombre"</h3>
                  <img src="" alt="" className="card-img" />
                  <p className="card-text">Autor:</p>
                </div>
              </div>
              {/* Carta 3 */}
              <div className="card">
                <p>Tema 3</p>
                <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                  <h3 className="card-title">"nombre"</h3>
                  <img src="" alt="" className="card-img" />
                  <p className="card-text">Autor:</p>
                </div>
              </div>
              {/* Carta 4 */}
              <div className="card">
                <p>Tema 4</p>
                <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                  <h3 className="card-title">"nombre"</h3>
                  <img src="" alt="" className="card-img" />
                  <p className="card-text">Autor: "autor"</p>
                </div>
              </div>
              {/* Carta 5 */}
              <div className="card">
                <p>Tema 5</p>
                <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                  <h3 className="card-title">"nombre"</h3>
                  <img src="" alt="" className="card-img" />
                  <p className="card-text">Autor: "autor"</p>
                </div>
              </div>
              {/* Carta 6 */}
              <div className="card">
                <p>Tema 6</p>
                <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                  <h3 className="card-title">"nombre"</h3>
                  <img src="" alt="" className="card-img" />
                  <p className="card-text">Autor: "autor"</p>
                </div>
              </div>
              {/* Carta 7 */}
              <div className="card">
                <p>Tema 7</p>
                <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                  <h3 className="card-title">"nombre"</h3>
                  <img src="" alt="" className="card-img" />
                  <p className="card-text">Autor: "autor"</p>
                </div>
              </div>
              {/* Carta 8 */}
              <div className="card">
                <p>Tema 8</p>
                <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                  <h3 className="card-title">"nombre"</h3>
                  <img src="" alt="" className="card-img" />
                  <p className="card-text">Autor: "autor"</p>
                </div>
              </div>
              {/* Carta 9 */}
              <div className="card">
                <p>Tema 9</p>
                <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                  <h3 className="card-title">"nombre"</h3>
                  <img src="" alt="" className="card-img" />
                  <p className="card-text">Autor: "autor"</p>
                </div>
              </div>
              {/* Carta 10 */}
              <div className="card">
                <p>Tema 10</p>
                <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                  <h3 className="card-title">"nombre"</h3>
                  <img src="" alt="" className="card-img" />
                  <p className="card-text">Autor: "autor"</p>
                </div>
              </div>
            </div>
          </div>
          <button className="nav-btn next" onClick={nextSlide}>&#10095;</button>
        </div>
      </div>
    </div>
  );
}
export default Inicio;