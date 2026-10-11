import "../estilos/Locales.css";

function Locales() {
  const locales = [
    {
      id: 1,
      nombre: "Club Neon Center",
      direccion: "Av. Principal 123, Centro",
      estado: "Súper Activo",
      imagen: "https://images.unsplash.com/photo-1514525253361-bee8718a74a9?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      nombre: "Vibe North Lounge",
      direccion: "Calle Norte 456, Sector 2",
      estado: "Abierto",
      imagen: "https://images.unsplash.com/photo-1571266028246-75c77bc6783f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      nombre: "Sonic South Base",
      direccion: "Bulevar del Sur 789, Zona Industrial",
      estado: "En Preparación",
      imagen: "https://images.unsplash.com/photo-1470225620780-dba8ba36b42c?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      nombre: "Electric East",
      direccion: "Av. del Sol 101, Este",
      estado: "Abierto",
      imagen: "https://images.unsplash.com/photo-1516450360452-937a4b327e7f?auto=format&fit=crop&w=600&q=80"
    },
  ];

  return (
    <div className="locales-page">
      <header className="locales-header">
        <h1 className="locales-title">Nuestros Locales</h1>
        <p className="locales-subtitle">Siente la vibración de GagaSonicos en cada rincón</p>
      </header>

      <div className="locales-grid">
        {locales.map((local) => (
          <div key={local.id} className="local-card">
            <div className="local-image-container">
              <span className="local-badge">{local.estado}</span>
              <img src={local.imagen} alt={local.nombre} className="local-image" />
            </div>
            <div className="local-info">
              <div className="local-name">{local.nombre}</div>
              <div className="local-details">
                <span>📍</span> {local.direccion}
              </div>
              <a href={`#local-${local.id}`} className="local-btn">
                Ver Experiencia
              </a>
            </div>
          </div>
        ))}
      </div>

      <section className="locales-about">
        <h2 className="about-title">Sobre nuestra red de locales</h2>
        <p className="about-text">
          En GagaSonicos, no solo ofrecemos música, creamos espacios de conexión. Cada uno de nuestros locales
          ha sido diseñado para brindar una experiencia sensorial completa, combinando la mejor acústica
          con un diseño vanguardista. Desde el corazón del centro hasta las zonas industriales más disruptivas,
          nuestras sedes están equipadas con tecnología de sonido de última generación para asegurar que
          cada beat se sienta en el alma.
        </p>
        <div className="about-features">
          <div className="feature-item">
            <strong className="feature-label">Sonido Hi-Fi</strong>
          </div>
          <div className="feature-item">
            <strong className="feature-label">Ambiente VIP</strong>
          </div>
          <div className="feature-item">
            <strong className="feature-label">Energía Pura</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Locales;
