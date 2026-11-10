import { useEffect, useMemo, useState } from "react";
import { normalizar } from "../data/Productos";
import { searchSpotify } from "../services/spotify";
import "../estilos/ArtistasCatalogo.css";

const ARTISTAS_INICIALES = 3;

function ArtistasCatalogo({ productos, cargandoCatalogo, errorCatalogo }) {
  const [artistas, setArtistas] = useState({
    clave: null,
    resultados: [],
    cargando: false,
  });
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Los productos guardan nombres (a veces varios separados por coma), no perfiles.
  // Se buscan artistas únicos en Spotify para obtener imagen y enlace oficial.
  const nombres = useMemo(() => [...new Set(
    productos.flatMap((producto) =>
      (producto.artista || "")
        .split(",")
        .map((nombre) => nombre.trim())
        .filter(Boolean)
    )
  )], [productos]);
  const claveArtistas = JSON.stringify(nombres);
  const consultaActual = artistas.clave === claveArtistas;
  const perfiles = consultaActual ? artistas.resultados : [];
  const errorActual = consultaActual ? error : "";
  const cargando = !cargandoCatalogo && !errorCatalogo && nombres.length > 0 &&
    (!consultaActual || artistas.cargando);

  useEffect(() => {
    let vigente = true;
    const nombresArtistas = JSON.parse(claveArtistas);

    if (cargandoCatalogo || errorCatalogo || !nombresArtistas.length) {
      return () => {
        vigente = false;
      };
    }

    async function cargarArtistas() {
      try {
        const resultados = await Promise.all(nombresArtistas.map(async (nombre) => {
          const resultado = await searchSpotify(nombre, ["artist"], 5);
          const perfil = resultado.artists?.find(
            (artista) => normalizar(artista.name) === normalizar(nombre)
          );
          return perfil?.external_urls?.spotify ? perfil : null;
        }));

        if (vigente) {
          setArtistas({
            clave: claveArtistas,
            resultados: resultados.filter(Boolean),
            cargando: false,
          });
          setError("");
        }
      } catch (errorCarga) {
        console.error("No se pudieron cargar los perfiles de artistas desde Spotify:", errorCarga);
        if (vigente) {
          setArtistas({ clave: claveArtistas, resultados: [], cargando: false });
          setError(errorCarga.message || "No se pudieron cargar los perfiles de Spotify.");
        }
      }
    }

    cargarArtistas();
    return () => {
      vigente = false;
    };
  }, [claveArtistas, cargandoCatalogo, errorCatalogo, intento]);

  function reintentar() {
    setError("");
    setArtistas({ clave: claveArtistas, resultados: [], cargando: true });
    setIntento((actual) => actual + 1);
  }

  const artistasVisibles = mostrarTodos ? perfiles : perfiles.slice(0, ARTISTAS_INICIALES);

  return (
    <section className="artistas-catalogo" aria-labelledby="artistas-catalogo-titulo">
      <p className="artistas-catalogo-etiqueta">Artistas para descubrir</p>
      <h3 id="artistas-catalogo-titulo">Entradas</h3>
      <p className="artistas-catalogo-descripcion">
        Explorá los artistas de nuestros productos y visitá sus perfiles en Spotify.
      </p>

      {cargandoCatalogo && <p className="artistas-catalogo-estado" role="status">Cargando artistas...</p>}
      {!cargandoCatalogo && errorCatalogo && (
        <p className="artistas-catalogo-estado">Los artistas aparecerán cuando cargue el catálogo.</p>
      )}
      {!cargandoCatalogo && !errorCatalogo && cargando && (
        <p className="artistas-catalogo-estado" role="status">Buscando perfiles en Spotify...</p>
      )}
      {errorActual && (
        <div className="artistas-catalogo-error" role="alert">
          <p>{errorActual}</p>
          <button type="button" onClick={reintentar}>
            Intentar de nuevo
          </button>
        </div>
      )}
      {!cargandoCatalogo && !errorCatalogo && !cargando && !errorActual && nombres.length === 0 && (
        <p className="artistas-catalogo-estado">Todavía no hay artistas cargados en los productos.</p>
      )}
      {!cargandoCatalogo && !errorCatalogo && !cargando && !errorActual && nombres.length > 0 && perfiles.length === 0 && (
        <p className="artistas-catalogo-estado">No encontramos perfiles exactos para los artistas del catálogo.</p>
      )}

      {perfiles.length > 0 && (
        <div className="artistas-catalogo-lista">
          {artistasVisibles.map((artista) => (
            <article className="artista-catalogo-card" key={artista.id}>
              <a
                className="artista-catalogo-enlace"
                href={artista.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir el perfil de ${artista.name} en Spotify`}
              >
                <div className="artista-catalogo-imagen">
                  {artista.images?.[0]?.url
                    ? <img src={artista.images[0].url} alt="" loading="lazy" />
                    : <i className="bi bi-person-music" aria-hidden="true" />}
                  <span className="artista-catalogo-badge">Artista</span>
                </div>
                <div className="artista-catalogo-info">
                  <h4>{artista.name}</h4>
                  <p>Perfil de artista</p>
                  <span>{artista.genres?.slice(0, 2).join(" · ") || "Artista del catálogo"}</span>
                  <strong>
                    Ver en Spotify
                    <i className="bi bi-arrow-up-right" aria-hidden="true" />
                  </strong>
                </div>
              </a>
            </article>
          ))}
        </div>
      )}
      {perfiles.length > ARTISTAS_INICIALES && (
        <button
          type="button"
          className="artistas-catalogo-ver-mas"
          aria-expanded={mostrarTodos}
          onClick={() => setMostrarTodos((actual) => !actual)}
        >
          {mostrarTodos ? "Ver menos" : "Ver más"}
          <i className={`bi ${mostrarTodos ? "bi-chevron-up" : "bi-chevron-down"}`} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}

export default ArtistasCatalogo;
