import { useState } from "react";
import "../estilos/Locales.css";

function Locales() {
  const locales = [
    {
      id: 1,
      nombre: "Aguja Azul Discos",
      direccion: "Portal Patagonia, Juan Julián Lastra 2400, Neuquén",
      tipo: "Vinilos, CDs y ediciones especiales",
      horario: "Horario de referencia del centro comercial",
      descripcion:
        "Tienda de discos ficticia para el proyecto, ubicada como referencia en este centro comercial real.",
      imagen:
        "https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=600&q=80",
      fuenteImagen: "https://unsplash.com/",
      creditoImagen: "Imagen ilustrativa (Unsplash)",
      altImagen: "Discos de vinilo; imagen ilustrativa",
      mapQuery: "Portal Patagonia, Juan Julián Lastra 2400, Neuquén, Argentina",
    },
    {
      id: 2,
      nombre: "Sur Sonoro",
      direccion: "Alto Comahue Shopping, Neuquén Capital",
      tipo: "CDs, vinilos y merchandising musical",
      horario: "Horario de referencia del centro comercial",
      descripcion:
        "Socio comercial ficticio dedicado a música. El punto del mapa señala el centro comercial real, no un local confirmado.",
      imagen:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80",
      fuenteImagen: "https://unsplash.com/",
      creditoImagen: "Imagen ilustrativa (Unsplash)",
      altImagen: "Escenario de un recital; imagen ilustrativa",
      mapQuery: "Alto Comahue Shopping, Neuquén, Argentina",
    },
    {
      id: 3,
      nombre: "Frecuencia Sur",
      direccion: "Av. Argentina y Roca, centro de Neuquén",
      tipo: "Instrumentos, audio y accesorios",
      horario: "Horario comercial de referencia",
      descripcion:
        "Tienda de instrumentos ficticia para el proyecto, situada como referencia en una zona comercial real de Neuquén.",
      imagen:
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80",
      fuenteImagen: "https://unsplash.com/",
      creditoImagen: "Imagen ilustrativa (Unsplash)",
      altImagen: "Guitarra; imagen ilustrativa",
      mapQuery: "Avenida Argentina y Roca, Neuquén, Argentina",
    },
  ];
  const [localSeleccionado, setLocalSeleccionado] = useState(locales[0]);
  const mapaUrl = `https://maps.google.com/maps?width=100%25&height=600&hl=es&q=${encodeURIComponent(
    localSeleccionado.mapQuery
  )}&t=&z=15&ie=UTF8&iwloc=B&output=embed`;

  return (
    <div className="locales-page">
      <header className="locales-header">
        <h1 className="locales-title">Socios musicales</h1>
        <p className="locales-subtitle">
          Propuesta ficticia de comercios en puntos reales de Neuquén
        </p>
      </header>

      <div className="locales-grid">
        {locales.map((local) => (
          <div key={local.id} className="local-card">
            <div className="local-image-container">
              <img
                src={local.imagen}
                alt={local.altImagen}
                className="local-image"
              />
              <span className="local-badge">Socio ficticio</span>
              <a
                className="local-image-credit"
                href={local.fuenteImagen}
                target="_blank"
                rel="noreferrer"
              >
                {local.creditoImagen}
              </a>
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
                <strong>Tipo:</strong> {local.tipo}
              </div>
              <p className="local-desc">{local.descripcion}</p>
              <button
                type="button"
                className="local-btn"
                onClick={() => {
                  setLocalSeleccionado(local);
                  document
                    .getElementById("mapa-locales")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Ver punto de referencia
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="locales-about">
        <h2 className="about-title">Propuesta para el proyecto</h2>
        <p className="about-text">
          Los nombres y comercios son ficticios y representan posibles socios
          comerciales. Las ubicaciones del mapa corresponden a centros o zonas
          comerciales reales; no indican que estas tiendas existan allí ni que
          haya acuerdos con los establecimientos.
        </p>
        <h3 className="about-title" id="mapa-locales">
          Punto de referencia: {localSeleccionado.direccion}
        </h3>
        <div style={{ width: "100%" }}>
          <iframe
            width="100%"
            height="600"
            title={`Mapa de ${localSeleccionado.nombre}`}
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={mapaUrl}
          />
        </div>
        <div className="about-features">
          <div className="feature-item">
            <span className="feature-icon">📚</span>
            <strong className="feature-label">Discos</strong>
            <p className="feature-desc">Vinilos y CDs.</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎸</span>
            <strong className="feature-label">Instrumentos</strong>
            <p className="feature-desc">Tiendas de música y accesorios.</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔊</span>
            <strong className="feature-label">Audio</strong>
            <p className="feature-desc">Equipos y sonido.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Locales;
