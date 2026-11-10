//Panel de admin dedicado a la gestión de recomendaciones. Muestra una tabla con todas las recomendaciones publicadas en la pestaña "Comunidad" (guardadas en Firestore), con filtros, ordenamiento y la opción de eliminarlas. Se accede desde Admin.jsx.
//Reutiliza los estilos de AdminReview.css (prefijo rv-), así los dos paneles se ven igual.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  suscribirRecomendaciones,
  eliminarRecomendacion,
  TIPOS_RECOMENDACION,
} from "../../services/comunidadService";
import { normalizar } from "../../data/Productos";
import ModalEliminar from "../../componentes/admin/ModalEliminar";
import ComentarioExpandible from "../../componentes/admin/ComentarioExpandible";
import "../../estilos/Admin.css";
import "../../estilos/AdminReview.css";

const ORDENES = [
  { valor: "recientes", etiqueta: "Más recientes" },
  { valor: "antiguas", etiqueta: "Más antiguas" },
  { valor: "populares", etiqueta: "Más me gusta" },
];

const formatearFecha = (fecha) =>
  fecha.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

function AdminRecomendacion() { //Muestra la página de administración de recomendaciones, con filtros, ordenamiento y eliminación. Se accede desde Admin.jsx.
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  //Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [orden, setOrden] = useState("recientes");

  //Eliminación
  const [aEliminar, setAEliminar] = useState(null); //Recomendación pendiente de confirmar
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");
  const [aviso, setAviso] = useState("");

  //Escucha en tiempo real la colección "recomendaciones" de Firestore: al borrar una, la tabla se actualiza sola.
  useEffect(() => {
    const cancelar = suscribirRecomendaciones(
      (datos) => {
        setRecomendaciones(datos);
        setError("");
        setCargando(false);
      },
      (err) => { //Si ocurre un error al obtener las recomendaciones, se muestra un mensaje de error en la interfaz.
        console.error("Error al obtener recomendaciones:", err);
        setError(
          err.code === "permission-denied"
            ? "Firestore rechazó la consulta por permisos. Revisá las reglas de seguridad de la colección recomendaciones."
            : "No se pudieron cargar las recomendaciones."
        );
        setCargando(false);
      }
    );

    return cancelar; //Cuando el componente se desmonta, deja de escuchar los cambios
  }, []);

  //El aviso de "recomendación eliminada" se borra solo
  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(""), 4000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  // Aplica búsqueda + tipo + orden, todo junto
  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());

    const filtradas = recomendaciones.filter((r) => {
      if (filtroTipo !== "todos" && r.tipo !== filtroTipo) return false;
      if (!texto) return true;

      return ( //Busca el texto en el título, el comentario, el autor y su correo
        normalizar(r.titulo || "").includes(texto) ||
        normalizar(r.comentario || "").includes(texto) ||
        normalizar(r.autorNombre || "").includes(texto) ||
        normalizar(r.autorCorreo || "").includes(texto)
      );
    });

    return [...filtradas].sort((a, b) => {
      if (orden === "antiguas") return a.fecha - b.fecha;
      if (orden === "populares") return b.votantes.length - a.votantes.length || b.fecha - a.fecha;
      return b.fecha - a.fecha;
    });
  }, [recomendaciones, busqueda, filtroTipo, orden]);

  const totalMeGusta = useMemo(
    () => recomendaciones.reduce((acc, r) => acc + r.votantes.length, 0),
    [recomendaciones]
  );

  const hayFiltros = busqueda.trim() !== "" || filtroTipo !== "todos";

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroTipo("todos");
  };

  const cerrarModal = useCallback(() => { //useCallback evita que el modal reinicie su foco en cada render
    setAEliminar(null);
    setErrorEliminar("");
  }, []);

  const confirmarEliminar = async () => {
    if (!aEliminar) return;

    setEliminando(true);
    setErrorEliminar("");

    try {
      await eliminarRecomendacion(aEliminar.id);
      setAEliminar(null);
      setAviso("La recomendación fue eliminada.");
    } catch (err) {
      console.error("Error al eliminar la recomendación:", err);
      setErrorEliminar(
        err.code === "permission-denied"
          ? "Firestore rechazó la eliminación por permisos. Revisá que tu usuario tenga rol admin y las reglas de seguridad."
          : "No se pudo eliminar la recomendación. Intentá nuevamente."
      );
    } finally {
      setEliminando(false);
    }
  };

  return ( //Renderiza la página de administración de recomendaciones.
    <div className="admin-page">
      <div className="admin-contenedor">

        <Link to="/Admin" className="admin-volver">
          <i className="bi bi-arrow-left"></i>
          Volver al panel
        </Link>

        <header className="rv-encabezado">
          <h1 className="rv-titulo">Gestión de recomendaciones</h1>
          <p className="rv-descripcion">
            Consulta y moderación de las recomendaciones que la comunidad publica en Deej&apos;s.
          </p>
        </header>

        {aviso && (
          <p className="rv-aviso" role="status">
            <i className="bi bi-check-circle"></i> {aviso}
          </p>
        )}

        <section className="rv-panel">
          {cargando ? ( //Muestra un spinner de carga mientras se obtienen las recomendaciones desde Firestore.
            <div className="rv-estado" role="status">
              <div className="rv-spinner"></div>
              Cargando recomendaciones...
            </div>
          ) : error ? ( //Si ocurre un error al obtener las recomendaciones, se muestra el mensaje de error.
            <div className="rv-estado rv-estado--error">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          ) : recomendaciones.length === 0 ? ( //Si todavía no se publicó ninguna recomendación.
            <div className="rv-estado">
              <i className="bi bi-music-note-list"></i>
              Todavía no hay recomendaciones publicadas.
            </div>
          ) : (
            <>
              {/* Resumen general */}
              <div className="rv-stats">
                <div className="rv-stat">
                  <span className="rv-stat-valor">{recomendaciones.length}</span>
                  <span className="rv-stat-etiqueta">
                    {recomendaciones.length === 1 ? "Recomendación" : "Recomendaciones"}
                  </span>
                </div>
                <div className="rv-stat">
                  <span className="rv-stat-valor">
                    {totalMeGusta} <i className="bi bi-heart-fill rv-stat-corazon"></i>
                  </span>
                  <span className="rv-stat-etiqueta">Me gusta en total</span>
                </div>
              </div>

              {/* Herramientas: buscador, filtro por tipo y orden */}
              <div className="rv-herramientas rv-herramientas--tres">
                <div className="rv-buscador">
                  <i className="bi bi-search"></i>
                  <input
                    type="search"
                    className="rv-input"
                    placeholder="Buscar recomendaciones..."
                    aria-label="Buscar recomendaciones"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <select
                  className="rv-select"
                  aria-label="Filtrar por tipo"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todos los tipos</option>
                  {TIPOS_RECOMENDACION.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>

                <select
                  className="rv-select"
                  aria-label="Ordenar por"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                >
                  {ORDENES.map((o) => (
                    <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
                  ))}
                </select>
              </div>

              {/* Resumen de resultados */}
              <div className="rv-resumen">
                <span>
                  Mostrando {visibles.length} de {recomendaciones.length} recomendaciones
                </span>

                {hayFiltros && (
                  <button type="button" className="rv-limpiar" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </button>
                )}
              </div>

              {visibles.length === 0 ? ( //Si no hay recomendaciones después de aplicar los filtros.
                <div className="rv-estado">
                  <i className="bi bi-search"></i>
                  No se encontraron recomendaciones.
                </div>
              ) : (
                <div className="rv-tabla-envoltorio">
                  <table className="rv-tabla">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Recomendación</th>
                        <th>Autor</th>
                        <th>Me gusta</th>
                        <th>Fecha</th>
                        <th className="rv-col-acciones">Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibles.map((reco) => (
                        <tr key={reco.id}>
                          <td data-label="Tipo">
                            <span className="rv-tag">{reco.tipo || "-"}</span>
                          </td>

                          <td data-label="Recomendación">
                            <div className="rv-reco">
                              <strong>{reco.titulo || <span className="rv-sin-dato">-</span>}</strong>
                              <ComentarioExpandible texto={reco.comentario || ""} />
                            </div>
                          </td>

                          <td data-label="Autor">
                            <div className="rv-autor">
                              <strong>{reco.autorNombre || <span className="rv-sin-dato">-</span>}</strong>
                              <small>{reco.autorCorreo || ""}</small>
                            </div>
                          </td>

                          <td data-label="Me gusta">
                            <span className="rv-megusta">
                              <i className="bi bi-heart-fill"></i> {reco.votantes.length}
                            </span>
                          </td>

                          <td data-label="Fecha" className="rv-fecha">
                            {formatearFecha(reco.fecha)}
                          </td>

                          <td data-label="Acciones" className="rv-col-acciones">
                            <button
                              type="button"
                              className="rv-btn rv-btn--peligro"
                              onClick={() => setAEliminar(reco)}
                              aria-label={`Eliminar la recomendación ${reco.titulo || ""}`}
                            >
                              <i className="bi bi-trash3"></i>
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {aEliminar && (
        <ModalEliminar
          titulo="Eliminar recomendación"
          texto="Esta acción no se puede deshacer. La recomendación desaparecerá de la comunidad para siempre."
          eliminando={eliminando}
          error={errorEliminar}
          onCancelar={cerrarModal}
          onConfirmar={confirmarEliminar}
        >
          <div className="rv-modal-detalle-cab">
            <strong>{aEliminar.titulo}</strong>
            <span className="rv-tag">{aEliminar.tipo}</span>
          </div>
          <p>{aEliminar.comentario}</p>
          <small>Por {aEliminar.autorNombre || "usuario desconocido"}</small>
        </ModalEliminar>
      )}
    </div>
  );
}

export default AdminRecomendacion;
