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

       