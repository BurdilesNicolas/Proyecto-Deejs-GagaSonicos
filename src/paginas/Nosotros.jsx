import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../estilos/Nosotros.css";

const integrantes = [
  {
    id: 1,
    nombre: "Integrante 01",
    rol: "Coordinación y análisis",
    color: "#b69cff",
    descripcion:
      "Perfil de ejemplo para reemplazar por una presentación breve de la persona y su aporte al equipo.",
    habilidades: ["Organización", "Análisis", "Planificación"],
    responsabilidades: [
      "Coordinar tareas y prioridades del equipo.",
      "Traducir las necesidades del proyecto en objetivos claros.",
      "Acompañar el seguimiento y la revisión de avances.",
    ],
  },
  {
    id: 2,
    nombre: "Integrante 02",
    rol: "Desarrollo frontend",
    color: "#7dd9d0",
    descripcion:
      "Perfil de ejemplo para describir intereses, fortalezas y participación en el desarrollo.",
    habilidades: ["HTML y CSS", "Diseño responsive", "Accesibilidad"],
    responsabilidades: [
      "Construir interfaces claras y adaptables.",
      "Cuidar la consistencia visual de los componentes.",
      "Probar la experiencia en distintos tamaños de pantalla.",
    ],
  },
  {
    id: 3,
    nombre: "Integrante 03",
    rol: "Desarrollo y funcionalidad",
    color: "#ffc47d",
    descripcion:
      "Perfil de ejemplo para sumar una descripción personal auténtica y fácilmente editable.",
    habilidades: ["JavaScript", "Integración", "Resolución de problemas"],
    responsabilidades: [
      "Implementar interacciones y flujos de la aplicación.",
      "Integrar componentes con los datos del proyecto.",
      "Colaborar en la detección y resolución de errores.",
    ],
  },
  {
    id: 4,
    nombre: "Integrante 04",
    rol: "Contenido y calidad",
    color: "#ff9eb5",
    descripcion:
      "Perfil de ejemplo para contar qué aporta esta persona al proyecto y al trabajo colectivo.",
    habilidades: ["Comunicación", "Pruebas", "Documentación"],
    responsabilidades: [
      "Revisar contenidos y claridad de la información.",
      "Validar recorridos y detalles de la experiencia.",
      "Documentar acuerdos y aprendizajes del equipo.",
    ],
  },
];

const valores = [
  {
    icono: "bi-people",
    titulo: "Trabajo en equipo",
    texto: "Combinamos perspectivas y construimos cada solución en conjunto.",
  },
  {
    icono: "bi-chat-dots",
    titulo: "Comunicación",
    texto: "Compartimos avances, escuchamos ideas y pedimos ayuda a tiempo.",
  },
  {
    icono: "bi-lightbulb",
    titulo: "Creatividad",
    texto: "Buscamos formas simples y originales de resolver cada desafío.",
  },
  {
    icono: "bi-check2-circle",
    titulo: "Responsabilidad",
    texto: "Cumplimos acuerdos y cuidamos la calidad de lo que entregamos.",
  },
  {
    icono: "bi-stars",
    titulo: "Compromiso",
    texto: "Aportamos con constancia para alcanzar un objetivo compartido.",
  },
  {
    icono: "bi-arrow-repeat",
    titulo: "Aprendizaje",
    texto: "Probamos, recibimos feedback y mejoramos en cada iteración.",
  },
];

function Nosotros() {
  const paginaRef = useRef(null);
  const dialogRef = useRef(null);
  const [integranteSeleccionado, setIntegranteSeleccionado] = useState(null);

  useEffect(() => {
    const pagina = paginaRef.current;
    if (!pagina || !("IntersectionObserver" in window)) return undefined;

    pagina.classList.add("nosotros-page--reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    pagina.querySelectorAll(".nosotros-reveal").forEach((elemento) => {
      observer.observe(elemento);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !integranteSeleccionado) return undefined;

    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [integranteSeleccionado]);

  const cerrarDialogo = () => setIntegranteSeleccionado(null);

  return (
    <main className="nosotros-page" ref={paginaRef}>
      <section className="nosotros-hero" aria-labelledby="nosotros-titulo">
        <div className="nosotros-hero__contenido">
          <span className="nosotros-eyebrow">
            <span className="nosotros-eyebrow__punto" />
            Un equipo, muchas ideas
          </span>
          <h1 id="nosotros-titulo">
            Conocé a <span>nuestro equipo</span>
          </h1>
          <p>
            Somos cuatro personas trabajando con una misma energía: crear una
            experiencia musical que se disfrute tanto como la música.
          </p>
          <a className="nosotros-button" href="#integrantes">
            Conocé a quienes lo hacen posible
            <i className="bi bi-arrow-down-short" aria-hidden="true" />
          </a>
          <div className="nosotros-hero__nota">
            <i className="bi bi-vinyl" aria-hidden="true" />
            <span>Pasión por la música. Dedicación en cada detalle.</span>
          </div>
        </div>

        <div className="nosotros-hero__visual" aria-hidden="true">
          <div className="nosotros-visual__halo" />
          <div className="nosotros-visual__vinilo">
            <span className="nosotros-visual__centro">
              <i className="bi bi-music-note-beamed" />
            </span>
          </div>
          <div className="nosotros-visual__orbit nosotros-visual__orbit--uno" />
          <div className="nosotros-visual__orbit nosotros-visual__orbit--dos" />
          <span className="nosotros-visual__persona nosotros-visual__persona--uno">
            <i className="bi bi-person-fill" />
          </span>
          <span className="nosotros-visual__persona nosotros-visual__persona--dos">
            <i className="bi bi-person-fill" />
          </span>
          <span className="nosotros-visual__persona nosotros-visual__persona--tres">
            <i className="bi bi-person-fill" />
          </span>
          <span className="nosotros-visual__persona nosotros-visual__persona--cuatro">
            <i className="bi bi-person-fill" />
          </span>
          <span className="nosotros-visual__sello">4 voces · 1 proyecto</span>
        </div>
      </section>

      <section
        className="nosotros-seccion nosotros-integrantes"
        id="integrantes"
        aria-labelledby="integrantes-titulo"
      >
        <div className="nosotros-encabezado nosotros-reveal">
          <span className="nosotros-kicker">
            Las personas detrás del proyecto
          </span>
          <h2 id="integrantes-titulo">Cuatro miradas, un mismo objetivo</h2>
          <p>
            Cada integrante aporta una perspectiva distinta. Estos perfiles son
            ejemplos editables: reemplazá nombres, textos y habilidades por los
            datos reales del equipo.
          </p>
        </div>

        <div className="nosotros-equipo">
          {integrantes.map((integrante, indice) => (
            <article
              className="nosotros-card nosotros-reveal"
              key={integrante.id}
              style={{
                "--member-accent": integrante.color,
                "--reveal-delay": `${indice * 90}ms`,
              }}
            >
              <div className="nosotros-card__imagen">
                <span className="nosotros-card__marco" />
                <span className="nosotros-card__avatar" aria-hidden="true">
                  <i className="bi bi-person-fill" />
                </span>
                <span className="nosotros-card__numero">
                  0{integrante.id} <span>/ 04</span>
                </span>
              </div>
              <div className="nosotros-card__contenido">
                <span className="nosotros-card__rol">{integrante.rol}</span>
                <h3>{integrante.nombre}</h3>
                <p>{integrante.descripcion}</p>
                <div
                  className="nosotros-tags"
                  aria-label="Habilidades principales"
                >
                  {integrante.habilidades.map((habilidad) => (
                    <span key={habilidad}>{habilidad}</span>
                  ))}
                </div>
                <button
                  className="nosotros-card__boton"
                  type="button"
                  onClick={() => setIntegranteSeleccionado(integrante)}
                  aria-label={`Ampliar información de ${integrante.nombre}`}
                >
                  Conocer su aporte
                  <i className="bi bi-arrow-up-right" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="nosotros-historia" aria-labelledby="historia-titulo">
        <div
          className="nosotros-historia__visual nosotros-reveal"
          aria-hidden="true"
        >
          <div className="nosotros-historia__disco">
            <span>
              <i className="bi bi-soundwave" />
            </span>
          </div>
          <div className="nosotros-historia__etiqueta">
            <i className="bi bi-heart-fill" />
            <span>Hecho en equipo</span>
          </div>
        </div>
        <div className="nosotros-historia__texto nosotros-reveal">
          <span className="nosotros-kicker">
            De una idea a un proyecto compartido
          </span>
          <h2 id="historia-titulo">Nuestra historia suena mejor en equipo.</h2>
          <p>
            Nos encontramos con ganas de aprender y de llevar una idea a la
            práctica. La música fue el punto de partida; las ganas de crear una
            experiencia útil, cuidada y cercana nos dieron un rumbo común.
          </p>
          <p>
            Así nació este proyecto: un espacio para descubrir y disfrutar la
            música en formatos físicos. Queremos que cada visita invite a
            explorar, conectar con otros melómanos y encontrar algo que valga la
            pena volver a escuchar.
          </p>
          <div className="nosotros-historia__meta">
            <span>
              <i className="bi bi-people" /> Cuatro aportes
            </span>
            <span>
              <i className="bi bi-music-note-list" /> Una pasión compartida
            </span>
          </div>
        </div>
      </section>

      <section
        className="nosotros-seccion nosotros-valores"
        aria-labelledby="valores-titulo"
      >
        <div className="nosotros-encabezado nosotros-reveal">
          <span className="nosotros-kicker">Lo que nos mueve</span>
          <h2 id="valores-titulo">Nuestra forma de trabajar</h2>
          <p>
            Los valores que ponemos en práctica para avanzar, aprender y crear.
          </p>
        </div>
        <div className="nosotros-valores__grid">
          {valores.map((valor, indice) => (
            <article
              className="nosotros-valor nosotros-reveal"
              key={valor.titulo}
              style={{ "--reveal-delay": `${indice * 65}ms` }}
            >
              <span className="nosotros-valor__icono">
                <i className={`bi ${valor.icono}`} aria-hidden="true" />
              </span>
              <div>
                <h3>{valor.titulo}</h3>
                <p>{valor.texto}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="nosotros-cierre nosotros-reveal">
        <span className="nosotros-cierre__icono" aria-hidden="true">
          <i className="bi bi-vinyl-fill" />
        </span>
        <p className="nosotros-kicker">Una última nota</p>
        <h2>“Las mejores ideas también se disfrutan en equipo.”</h2>
        <p>Gracias por acompañarnos. Nos seguimos encontrando en la música.</p>
        <Link className="nosotros-button nosotros-button--claro" to="/">
          Volver a la página principal
          <i className="bi bi-arrow-right" aria-hidden="true" />
        </Link>
      </section>

      <dialog
        className="nosotros-dialog"
        ref={dialogRef}
        onClose={cerrarDialogo}
        aria-labelledby="nosotros-dialog-titulo"
      >
        {integranteSeleccionado && (
          <div className="nosotros-dialog__contenido">
            <button
              className="nosotros-dialog__cerrar"
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar información"
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
            <span
              className="nosotros-dialog__avatar"
              style={{ "--member-accent": integranteSeleccionado.color }}
              aria-hidden="true"
            >
              <i className="bi bi-person-fill" />
            </span>
            <span className="nosotros-card__rol">
              {integranteSeleccionado.rol}
            </span>
            <h2 id="nosotros-dialog-titulo">{integranteSeleccionado.nombre}</h2>
            <p className="nosotros-dialog__descripcion">
              {integranteSeleccionado.descripcion}
            </p>
            <h3>Su aporte al proyecto</h3>
            <ul>
              {integranteSeleccionado.responsabilidades.map(
                (responsabilidad) => (
                  <li key={responsabilidad}>
                    <i className="bi bi-check2" aria-hidden="true" />
                    {responsabilidad}
                  </li>
                ),
              )}
            </ul>
            <h3>Habilidades</h3>
            <div className="nosotros-tags">
              {integranteSeleccionado.habilidades.map((habilidad) => (
                <span key={habilidad}>{habilidad}</span>
              ))}
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}

export default Nosotros;
