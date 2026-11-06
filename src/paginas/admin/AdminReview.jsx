//Panel de admin dedicado a la gestión de reseñas. Muestra una tabla con todas las reseñas publicadas en la comunidad (guardadas en Firestore), con filtros, ordenamiento y la opción de eliminarlas. Se accede desde Admin.jsx.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { suscribirResenas, eliminarResena } from "../../services/comunidadService";
import { productos, normalizar } from "../../data/Productos";
import "../../estilos/Admin.css";
import "../../estilos/AdminReview.css";

const ORDENES = [
  { valor: "recientes", etiqueta: "Más recientes" },
  { valor: "antiguas", etiqueta: "Más antiguas" },
  { valor: "mejor", etiqueta: "Mejor calificadas" },
  { valor: "peor", etiqueta: "Peor calificadas" },
];

const formatearFecha = (fecha) =>
  fecha.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

const buscarProducto = (id) => productos.find((p) => p.id === id);

// Estrellas de solo lectura
function Estrellas({ valor }) {
  return (
    <span className="rv-estrellas" role="img" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={`bi bi-star-fill rv-estrella ${n <= valor ? "rv-estrella--llena" : ""}`}
          aria-hidden="true"
        ></i>
      ))}
    </span>
  );
}

// Comentario recortado a 3 líneas, con "Ver más" cuando es largo
function Comentario({ texto }) {
  const [abierto, setAbierto] = useState(false);
  const esLargo = texto.length > 140;

  return (
    <div>
      <p className={`rv-comentario ${esLargo && !abierto ? "rv-comentario--corto" : ""}`}>{texto}</p>
      {esLargo && (
        <button type="button" className="rv-ver-mas" onClick={() => setAbierto(!abierto)}>
          {abierto ? "Ver menos" : "Ver más"}
        </button>
      )}
    </div>
  );
}

// Ventana para confirmar la eliminación (muestra qué reseña se va a borrar)
function ModalEliminar({ resena, eliminando, error, onCancelar, onConfirmar }) {
  const botonCancelar = useRef(null);
  const producto = buscarProducto(resena.productoId);

  // El foco empieza en "Cancelar" (la opción segura) y Esc cierra la ventana
  useEffect(() => {
    botonCancelar.current?.focus();

    const alTeclear = (e) => {
      if (e.key === "Escape" && !eliminando) onCancelar();
    };

    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [eliminando, onCancelar]);

  return (
    <div
      className="rv-modal-fondo"
      onClick={() => !eliminando && onCancelar()} //Cierra la ventana al hacer click fuera de ella
    >
      <div
        className="rv-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="rv-modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rv-modal-icono">
          <i className="bi bi-trash3"></i>
        </div>

        <h2 id="rv-modal-titulo" className="rv-modal-titulo">Eliminar reseña</h2>
        <p className="rv-modal-texto">
          Esta acción no se puede deshacer. La reseña desaparecerá de la comunidad para siempre.
        </p>

        <div className="rv-modal-detalle">
          <div className="rv-modal-detalle-cab">
            <strong>{producto ? producto.nombre : `Producto #${resena.productoId}`}</strong>
            <Estrellas valor={resena.calificacion} />
          </div>
          <p>{resena.comentario}</p>
          <small>Por {resena.autorNombre || "usuario desconocido"}</small>
        </div>

        {error && (
          <p className="rv-modal-error" role="alert">
            <i className="bi bi-exclamation-triangle"></i> {error}
          </p>
        )}

        <div className="rv-modal-acciones">
          <button
            type="button"
            ref={botonCancelar}
            className="rv-btn"
            onClick={onCancelar}
            disabled={eliminando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rv-btn rv-btn--peligro-solido"
            onClick={onConfirmar}
            disabled={eliminando}
          >
            {eliminando ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminReview() { //Muestra la página de administración de reseñas, con filtros, ordenamiento y eliminación. Se accede desde Admin.jsx.
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  //Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroProducto, setFiltroProducto] = useState("todos");
  const [filtroEstrellas, setFiltroEstrellas] = useState("todas");
  const [orden, setOrden] = useState("recientes");

  //Eliminación
  const [aEliminar, setAEliminar] = useState(null); //Reseña pendiente de confirmar
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");
  const [aviso, setAviso] = useState("");

  //Escucha en tiempo real la colección "resenas" de Firestore: al borrar una, la tabla se actualiza sola.
  useEffect(() => {
    const cancelar = suscribirResenas(
      (datos) => {
        setResenas(datos);
        setError("");
        setCargando(false);
      },
      (err) => { //Si ocurre un error al obtener las reseñas, se muestra un mensaje de error en la interfaz.
        console.error("Error al obtener reseñas:", err);
        setError(
          err.code === "permission-denied"
            ? "Firestore rechazó la consulta por permisos. Revisá las reglas de seguridad de la colección resenas."
            : "No se pudieron cargar las reseñas."
        );
        setCargando(false);
      }
    );

    return cancelar; //Cuando el componente se desmonta, deja de escuchar los cambios
  }, []);

  //El aviso de "reseña eliminada" se borra solo
  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(""), 4000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  // Aplica búsqueda + producto + estrellas + orden, todo junto
  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());

    const filtradas = resenas.filter((r) => {
      if (filtroProducto !== "todos" && r.productoId !== Number(filtroProducto)) return false;
      if (filtroEstrellas !== "todas" && r.calificacion !== Number(filtroEstrellas)) return false;
      if (!texto) return true;

      const producto = buscarProducto(r.productoId);

      return ( //Busca el texto en el comentario, el autor, su correo y el producto
        normalizar(r.comentario || "").includes(texto) ||
        normalizar(r.autorNombre || "").includes(texto) ||
        normalizar(r.autorCorreo || "").includes(texto) ||
        normalizar(producto?.nombre || "").includes(texto) ||
        normalizar(producto?.artista || "").includes(texto)
      );
    });

    return [...filtradas].sort((a, b) => {
      if (orden === "antiguas") return a.fecha - b.fecha;
      if (orden === "mejor") return b.calificacion - a.calificacion || b.fecha - a.fecha;
      if (orden === "peor") return a.calificacion - b.calificacion || b.fecha - a.fecha;
      return b.fecha - a.fecha;
    });
  }, [resenas, busqueda, filtroProducto, filtroEstrellas, orden]);

  const promedio = useMemo(
    () => (resenas.length ? resenas.reduce((acc, r) => acc + r.calificacion, 0) / resenas.length : 0),
    [resenas]
  );

  const hayFiltros = busqueda.trim() !== "" || filtroProducto !== "todos" || filtroEstrellas !== "todas";

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroProducto("todos");
    setFiltroEstrellas("todas");
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
      await eliminarResena(aEliminar.id);
      setAEliminar(null);
      setAviso("La reseña fue eliminada.");
    } catch (err) {
      console.error("Error al eliminar la reseña:", err);
      setErrorEliminar(
        err.code === "permission-denied"
          ? "Firestore rechazó la eliminación por permisos. Revisá que tu usuario tenga rol admin y las reglas de seguridad."
          : "No se pudo eliminar la reseña. Intentá nuevamente."
      );
    } finally {
      setEliminando(false);
    }
  };

  return ( //Renderiza la página de administración de reseñas.
    <div className="admin-page">
      <div className="admin-contenedor">

        <Link to="/Admin" className="admin-volver">
          <i className="bi bi-arrow-left"></i>
          Volver al panel
        </Link>

        <header className="rv-encabezado">
          <h1 className="rv-titulo">Gestión de reseñas</h1>
          <p className="rv-descripcion">
            Consulta y moderación de las reseñas publicadas en Deej&apos;s.
          </p>
        </header>

        {aviso && (
          <p className="rv-aviso" role="status">
            <i className="bi bi-check-circle"></i> {aviso}
          </p>
        )}

        <section className="rv-panel">
          {cargando ? ( //Muestra un spinner de carga mientras se obtienen las reseñas desde Firestore.
            <div className="rv-estado" role="status">
              <div className="rv-spinner"></div>
              Cargando reseñas...
            </div>
          ) : error ? ( //Si ocurre un error al obtener las reseñas, se muestra el mensaje de error.
            <div className="rv-estado rv-estado--error">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          ) : resenas.length === 0 ? ( //Si todavía no se publicó ninguna reseña.
            <div className="rv-estado">
              <i className="bi bi-chat-square-text"></i>
              Todavía no hay reseñas publicadas.
            </div>
          ) : (
            <>
              {/* Resumen general */}
              <div className="rv-stats">
                <div className="rv-stat">
                  <span className="rv-stat-valor">{resenas.length}</span>
                  <span className="rv-stat-etiqueta">{resenas.length === 1 ? "Reseña" : "Reseñas"}</span>
                </div>
                <div className="rv-stat">
                  <span className="rv-stat-valor">
                    {promedio.toFixed(1)} <i className="bi bi-star-fill"></i>
                  </span>
                  <span className="rv-stat-etiqueta">Calificación promedio</span>
                </div>
              </div>

              {/* Herramientas: buscador, filtros y orden */}
              <div className="rv-herramientas">
                <div className="rv-buscador">
                  <i className="bi bi-search"></i>
                  <input
                    type="search"
                    className="rv-input"
                    placeholder="Buscar reseñas..."
                    aria-label="Buscar reseñas"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <select
                  className="rv-select"
                  aria-label="Filtrar por producto"
                  value={filtroProducto}
                  onChange={(e) => setFiltroProducto(e.target.value)}
                >
                  <option value="todos">Todos los productos</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>

                <select
                  className="rv-select"
                  aria-label="Filtrar por calificación"
                  value={filtroEstrellas}
                  onChange={(e) => setFiltroEstrellas(e.target.value)}
                >
                  <option value="todas">Todas las calificaciones</option>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "estrella" : "estrellas"}</option>
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
                  Mostrando {visibles.length} de {resenas.length} reseñas
                </span>

                {hayFiltros && (
                  <button type="button" className="rv-limpiar" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </button>
                )}
              </div>

              {visibles.length === 0 ? ( //Si no hay reseñas después de aplicar los filtros.
                <div className="rv-estado">
                  <i className="bi bi-search"></i>
                  No se encontraron reseñas.
                </div>
              ) : (
                <div className="rv-tabla-envoltorio">
                  <table className="rv-tabla">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Autor</th>
                        <th>Calificación</th>
                        <th>Reseña</th>
                        <th>Fecha</th>
                        <th className="rv-col-acciones">Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibles.map((resena) => {
                        const producto = buscarProducto(resena.productoId);

                        return (
                          <tr key={resena.id}>
                            <td data-label="Producto">
                              <div className="rv-producto">
                                <span className="rv-miniatura">
                                  {producto?.imagen && <img src={producto.imagen} alt="" />}
                                </span>
                                <span className="rv-producto-datos">
                                  <strong>{producto ? producto.nombre : `Producto #${resena.productoId}`}</strong>
                                  {producto && <small>{producto.artista}</small>}
                                </span>
                              </div>
                            </td>

                            <td data-label="Autor">
                              <div className="rv-autor">
                                <strong>{resena.autorNombre || <span className="rv-sin-dato">-</span>}</strong>
                                <small>{resena.autorCorreo || ""}</small>
                              </div>
                            </td>

                            <td data-label="Calificación">
                              <Estrellas valor={resena.calificacion} />
                            </td>

                            <td data-label="Reseña">
                              <Comentario texto={resena.comentario || ""} />
                            </td>

                            <td data-label="Fecha" className="rv-fecha">
                              {formatearFecha(resena.fecha)}
                            </td>

                            <td data-label="Acciones" className="rv-col-acciones">
                              <button
                                type="button"
                                className="rv-btn rv-btn--peligro"
                                onClick={() => setAEliminar(resena)}
                                aria-label={`Eliminar la reseña de ${resena.autorNombre || "usuario"}`}
                              >
                                <i className="bi bi-trash3"></i>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
          resena={aEliminar}
          eliminando={eliminando}
          error={errorEliminar}
          onCancelar={cerrarModal}
          onConfirmar={confirmarEliminar}
        />
      )}
    </div>
  );
}

export default AdminReview;
