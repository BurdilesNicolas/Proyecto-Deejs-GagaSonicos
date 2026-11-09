import "../estilos/Locales.css";

function Locales() {
  // Comercios musicales verificados en Neuquén Capital.
  const locales = [
    {
      id: 1,
      nombre: "Casa Bonelli",
      direccion: "Jujuy 385, Neuquén Capital",
      categoria: "Instrumentos y audio",
      especialidad: "Instrumentos musicales, sonido e iluminación profesional.",
      imagen: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80",
      mapa: "https://www.google.com/maps/search/?api=1&query=Casa+Bonelli%2C+Jujuy+385%2C+Neuqu%C3%A9n",
      mapaIncrustado: "https://maps.google.com/maps?q=Casa+Bonelli%2C+Jujuy+385%2C+Neuqu%C3%A9n&output=embed"
    },
    {
      id: 2,
      nombre: "Todo Música",
      direccion: "Av. Argentina 261, Neuquén Capital",
      categoria: "Instrumentos y audio",
      especialidad: "Instrumentos, audio y equipamiento para músicos.",
      imagen: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
      mapa: "https://www.google.com/maps/search/?api=1&query=Todo+M%C3%BAsica%2C+Avenida+Argentina+261%2C+Neuqu%C3%A9n",
      mapaIncrustado: "https://maps.google.com/maps?q=Todo+M%C3%BAsica%2C+Avenida+Argentina+261%2C+Neuqu%C3%A9n&output=embed"
    },
    {
      id: 3,
      nombre: "Prowatt",
      direccion: "Pte. Sarmiento 595, Neuquén Capital",
      categoria: "Audio e iluminación",
      especialidad: "Equipos de audio, sonido, luces, accesorios y electrónica.",
      imagen: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
      mapa: "https://www.google.com/maps/search/?api=1&query=Prowatt%2C+Presidente+Sarmiento+595%2C+Neuqu%C3%A9n",
      mapaIncrustado: "https://maps.google.com/maps?q=Prowatt%2C+Presidente+Sarmiento+595%2C+Neuqu%C3%A9n&output=embed"
    },
    {
      id: 4,
      nombre: "Disquería Almendra",
      direccion: "M. Láinez 185, Neuquén Capital",
      categoria: "Disquería",
      especialidad: "Vinilos, CDs y casetes para coleccionar y descubrir música.",
      imagen: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=800&q=80",
      mapa: "https://www.google.com/maps/search/?api=1&query=Disquer%C3%ADa+Almendra%2C+M.+L%C3%A1inez+185%2C+Neuqu%C3%A9n",
      mapaIncrustado: "https://maps.google.com/maps?q=Disquer%C3%ADa+Almendra%2C+M.+L%C3%A1inez+185%2C+Neuqu%C3%A9n&output=embed"
    },
  ];

  return (
    <div className="locales-page">
      {/* Presentación principal de la página de locales. */}
      <header className="locales-header">
        <h1 className="locales-title">Nuestros Locales</h1>
        <p className="locales-subtitle">Descubrí tiendas de música e instrumentos en Neuquén Capital</p>
      </header>

      {/* Crea una tarjeta por cada local usando sus datos como contenido. */}
      <div className="locales-grid">
        {locales.map((local) => (
          <div key={local.id} className="local-card">
            {/* La imagen y el estado identifican visualmente cada sede. */}
            <div className="local-image-container">
              <span className="local-badge">{local.categoria}</span>
              <img src={local.imagen} alt={`${local.categoria}, imagen ilustrativa`} className="local-image" />
            </div>
            {/* Cada iframe centra el mapa en la dirección del comercio. */}
            <div className="local-map">
              <iframe
                src={local.mapaIncrustado}
                title={`Mapa de ubicación de ${local.nombre}`}
                loading="lazy"
                frameBorder="0"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="local-info">
              <div className="local-name">{local.nombre}</div>
              {/* Dirección y productos destacados de cada comercio. */}
              <div className="local-details">
                <i className="bi bi-geo-alt-fill" aria-hidden="true" />
                <span>{local.direccion}</span>
              </div>
              <div className="local-event">
                <strong>Encontrás:</strong> {local.especialidad}
              </div>
              <p className="local-desc">Imagen ilustrativa del rubro.</p>
              {/* Abre la ubicación individual del comercio en Google Maps. */}
              <a href={local.mapa} className="local-btn" target="_blank" rel="noreferrer">
                Ver ubicación
                <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Categorías de productos disponibles en los comercios del listado. */}
      <section className="locales-about">
        <h2 className="about-title">Música para cada experiencia</h2>
        <p className="about-text">
          Cada tarjeta incluye un mapa para que puedas localizar el comercio y planear tu visita.
        </p>
        {/* Rubros que se pueden encontrar en los comercios del listado. */}
        <div className="about-features">
          <div className="feature-item">
            <i className="bi bi-volume-up-fill feature-icon" aria-hidden="true" />
            <strong className="feature-label">Instrumentos</strong>
            <p className="feature-desc">Guitarras, teclados y otros instrumentos musicales.</p>
          </div>
          <div className="feature-item">
            <i className="bi bi-speaker-fill feature-icon" aria-hidden="true" />
            <strong className="feature-label">Audio e iluminación</strong>
            <p className="feature-desc">Equipos, accesorios y luces para sonido profesional.</p>
          </div>
          <div className="feature-item">
            <i className="bi bi-vinyl-fill feature-icon" aria-hidden="true" />
            <strong className="feature-label">Música física</strong>
            <p className="feature-desc">Discos, vinilos y casetes para coleccionar.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Locales;
