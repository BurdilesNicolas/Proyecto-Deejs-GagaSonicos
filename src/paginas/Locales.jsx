import "../estilos/Locales.css";

function Locales() {
  const locales = [
    {
      id: 1,
      nombre: "Club Neon Center",
      direccion: "Av. Principal 123, Centro",
      estado: "Súper Activo",
      horario: "18:00 - 04:00",
      evento: "Neon Night Fever - Viernes 22:00h",
      descripcion: "El epicentro de la luz y el sonido en el corazón de la ciudad. Especialistas en Tech-House.",
      imagen: "https://images.unsplash.com/photo-1514525253361-bee8718a74a9?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      nombre: "Vibe North Lounge",
      direccion: "Calle Norte 456, Sector 2",
      estado: "Abierto",
      horario: "16:00 - 02:00",
      evento: "Sunset Chill Session - Sábado 19:00h",
      descripcion: "Elegancia, confort y ritmos profundos para mentes sofisticadas. Ideal para Deep House.",
      imagen: "https://images.unsplash.com/photo-1571266028246-75c77bc6783f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      nombre: "Sonic South Base",
      direccion: "Bulevar del Sur 789, Zona Industrial",
      estado: "En Preparación",
      horario: "Próximamente",
      evento: "Gran Apertura: Sonic Boom - Dic 2026",
      descripcion: "El bunker del sonido industrial. Preparando la mayor potencia acústica de la región.",
      imagen: "https://images.unsplash.com/photo-1470225620780-dba8ba36b42c?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      nombre: "Electric East",
      direccion: "Av. del Sol 101, Este",
      estado: "Abierto",
      horario: "20:00 - 05:00",
      evento: "Electro-Flash Night - Jueves 21:00h",
      descripcion: "Energía eléctrica y beats frenéticos. El hogar del EDM y Future House.",
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
              <div className="local-details">
                <span>⏰</span> {local.horario}
              </div>
              <div className="local-event">
                <strong>Próximo:</strong> {local.evento}
              </div>
              <p className="local-desc">{local.descripcion}</p>
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
        <div style={{ width: "100%" }}>
          <iframe
            width="100%"
            height="600"
            frameborder="0"
            scrolling="no"
            marginheight="0"
            marginwidth="0"
            src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=es&amp;q=Lanin%202020,%20neuquen+(Zizou)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
            title="Google Maps"
          >
            <a href="https://www.mapsdirections.info/calcular-la-poblacion-en-un-mapa/">Estimar la población</a>
          </iframe>
        </div>
        <div className="about-features">
          <div className="feature-item">
            <span className="feature-icon">🔊</span>
            <strong className="feature-label">Sonido Hi-Fi</strong>
            <p className="feature-desc">Acústica profesional en cada sala.</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✨</span>
            <strong className="feature-label">Ambiente VIP</strong>
            <p className="feature-desc">Espacios exclusivos y confort total.</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <strong className="feature-label">Energía Pura</strong>
            <p className="feature-desc">La mejor vibra de la ciudad.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Locales;
