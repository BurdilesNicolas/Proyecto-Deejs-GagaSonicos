import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/LOGO DEEJS 2.svg";
import fotoNicolas from "../../Img/Integrantes/Nicolas Burdiles.png";
import fotoMaximo from "../../Img/Integrantes/Maximo Maroa.png";
import fotoRamiro from "../../Img/Integrantes/Ramiro Flores.png";
import fotoLuca from "../../Img/Integrantes/Luca Kletzel.png";
import "../estilos/Nosotros.css";

// Fotos y encuadres individuales para mantener los rostros bien posicionados.
const integrantes = [
  {
    id: 1,
    nombre: "Nicolas Burdiles",
    imagen: fotoNicolas,
    posicion: "center 38%",
    color: "#b69cff",
  },
  {
    id: 2,
    nombre: "Maximo Maroa",
    imagen: fotoMaximo,
    posicion: "center 24%",
    color: "#7dd9d0",
  },
  {
    id: 3,
    nombre: "Ramiro Flores",
    imagen: fotoRamiro,
    posicion: "center 36%",
    color: "#ffc47d",
  },
  {
    id: 4,
    nombre: "Luca Kletzel",
    imagen: fotoLuca,
    posicion: "center 24%",
    color: "#ff9eb5",
  },
];

// Principios que guían la colaboración y el trabajo del equipo.
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

  // Revela los elementos a medida que entran en pantalla.
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

  return (
    <main className="nosotros-page" ref={paginaRef}>
      {/* Presentación del equipo y acceso directo a la lista de integrantes. */}
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
          <div className="nosotros-visual__vinilo" />
          <span className="nosotros-visual__centro">
            <img src={logo} alt="" />
          </span>
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

      {/* Tarjetas con datos editables y espacios reservados para las fotos de perfil. */}
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
          <p>Conocé a las personas que forman parte de DEEJ&apos;S.</p>
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
                <img
                  className="nosotros-card__foto"
                  src={integrante.imagen}
                  alt={`Foto de ${integrante.nombre}`}
                  style={{ objectPosition: integrante.posicion }}
                />
              </div>
              <div className="nosotros-card__nombre">
                <h3>{integrante.nombre}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Historia de cómo surgió la idea y qué busca ofrecer el proyecto. */}
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

      {/* Valores compartidos que orientan la forma de trabajar del equipo. */}
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

      {/* Cierre de la página con un acceso para volver al inicio. */}
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
    </main>
  );
}

export default Nosotros;
