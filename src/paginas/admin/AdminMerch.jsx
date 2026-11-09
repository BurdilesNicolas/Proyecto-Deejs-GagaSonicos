import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { normalizar } from "../../data/Productos";
import FormularioMerch from "../../componentes/admin/FormularioMerch";
import {
  actualizarMerch,
  crearMerch,
  eliminarMerch,
  suscribirMerch,
} from "../../services/merchService";
import "../../estilos/Admin.css";
import "../../estilos/AdminProductos.css";

function precio(numero) {
  return `$${Number(numero || 0).toLocaleString("es-AR")}`;
}

function AdminMerch() {
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todas");
  const [articuloEditando, setArticuloEditando] = useState(null);
  const [articuloAEliminar, setArticuloAEliminar] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => suscribirMerch(
    (datos) => {
      setArticulos(datos);
      setCargando(false);
      setError("");
    },
    (err) => {
      console.error("Error al cargar merch:", err);
      setError(err.code === "permission-denied"
        ? "Firestore rechazó la consulta. Revisá las reglas de la colección merch."
        : "No se pudo cargar el catálogo de merch.");
      setCargando(false);
    }
  ), []);

  useEffect(() => {
    if (!aviso) return undefined;
    const temporizador = setTimeout(() => setAviso(""), 3500);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  const categorias = useMemo(
    () => [...new Set(articulos.map((articulo) => articulo.categoria).filter(Boolean))].sort(),
    [articulos]
  );
  const articulosVisibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return articulos.filter((articulo) => {
      const coincideCategoria = categoriaActiva === "todas" || articulo.categoria === categoriaActiva;
      const coincideTexto = !texto || normalizar(
        `${articulo.nombre} ${articulo.categoria} ${articulo.descripcion || ""}`
      ).includes(texto);
      return coincideCategoria && coincideTexto;
    });
  }, [articulos, busqueda, categoriaActiva]);

  async function guardarArticulo(datos) {
    setGuardando(true);
    setError("");
    try {
      if (articuloEditando) {
        await actualizarMerch(articuloEditando.id, datos);
        setAviso("Artículo actualizado correctamente.");
      } else {
        await crearMerch(datos);
        setAviso("Artículo creado correctamente.");
      }
      setMostrarFormulario(false);
      setArticuloEditando(null);
    } catch (err) {
      console.error("Error al guardar artículo de merch:", err);
      setError(err.code === "permission-denied"
        ? "No tenés permisos para guardar merch. Revisá tu rol y las reglas de Firestore."
        : "No se pudo guardar el artículo. Intentá nuevamente.");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminacion() {
    if (!articuloAEliminar) return;
    setGuardando(true);
    setError("");
    try {
      await eliminarMerch(articuloAEliminar.id);
      setAviso("Artículo eliminado correctamente.");
      setArticuloAEliminar(null);
    } catch (err) {
      console.error("Error al eliminar artículo de merch:", err);
      setError(err.code === "permission-denied"
        ? "No tenés permisos para eliminar merch. Revisá tu rol y las reglas de Firestore."
        : "No se pudo eliminar el artículo.");
    } finally {
      setGuardando(false);
    }
  }

  function abrirCrear() {
    setArticuloEditando(null);
    setMostrarFormulario(true);
  }

  function abrirEditar(articulo) {
    setArticuloEditando(articulo);
    setMostrarFormulario(true);
  }

  return (
    <div className="admin-page">
      <div className="admin-contenedor">
        <Link to="/Admin" className="admin-volver"><i className="bi bi-arrow-left"></i> Volver al panel</Link>

        <header className="ap-encabezado">
          <div>
            <h1 className="ap-titulo">Gestión de merch</h1>
            <p className="ap-descripcion">Administrá indumentaria, accesorios y stock de la tienda.</p>
          </div>
          <button type="button" className="ap-boton ap-boton-principal" onClick={abrirCrear}>
            <i className="bi bi-plus-lg"></i> Nuevo artículo
          </button>
        </header>

        {aviso && <p className="ap-aviso" role="status"><i className="bi bi-check-circle"></i> {aviso}</p>}
        {error && <p className="ap-alerta-error" role="alert"><i className="bi bi-exclamation-triangle"></i> {error}</p>}

        <section className="ap-panel">
          <div className="ap-resumen">
            <div className="ap-stat"><strong>{articulos.length}</strong><span>Artículos registrados</span></div>
            <div className="ap-stat"><strong>{categorias.length}</strong><span>Categorías</span></div>
            <div className="ap-stat">
              <strong>{articulos.reduce((total, articulo) =>
                total + (articulo.variantes ?? []).reduce((suma, variante) => suma + Number(variante.stock || 0), 0), 0
              )}</strong>
              <span>Unidades en stock</span>
            </div>
          </div>

          <div className="ap-herramientas">
            <label className="ap-buscador">
              <i className="bi bi-search"></i>
              <input className="ap-input" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar artículos" />
            </label>
            <select className="ap-input" value={categoriaActiva} onChange={(e) => setCategoriaActiva(e.target.value)}>
              <option value="todas">Todas las categorías</option>
              {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
            </select>
          </div>

          <div className="ap-tabla-contenedor">
            {cargando ? (
              <div className="ap-estado"><div className="ap-spinner"></div>Cargando merch...</div>
            ) : articulosVisibles.length === 0 ? (
              <div className="ap-estado"><i className="bi bi-bag"></i><p>{articulos.length === 0 ? "Todavía no hay artículos de merch." : "No hay artículos que coincidan con la búsqueda."}</p></div>
            ) : (
              <table className="ap-tabla">
                <thead><tr><th>Artículo</th><th>Categoría</th><th>Precio</th><th>Variantes</th><th>Stock</th><th className="ap-acciones-col">Acciones</th></tr></thead>
                <tbody>
                  {articulosVisibles.map((articulo) => {
                    const variantes = articulo.variantes ?? [];
                    const stock = variantes.reduce((total, variante) => total + Number(variante.stock || 0), 0);
                    return (
                      <tr key={articulo.id}>
                        <td>
                          <div className="ap-producto-celda">
                            <img src={articulo.imagen} alt="" />
                            <div><strong>{articulo.nombre}</strong><span>{articulo.descripcion || "—"}</span></div>
                          </div>
                        </td>
                        <td>{articulo.categoria || "—"}</td>
                        <td>{precio(articulo.precio)}</td>
                        <td>{variantes.map((variante) => [variante.talle, variante.color].filter(Boolean).join(" / ")).join(", ") || "—"}</td>
                        <td>{stock}</td>
                        <td className="ap-acciones-col">
                          <button type="button" className="ap-icono-boton" title="Editar" aria-label={`Editar ${articulo.nombre}`} onClick={() => abrirEditar(articulo)}><i className="bi bi-pencil-square"></i></button>
                          <button type="button" className="ap-icono-boton ap-icono-peligro" title="Eliminar" aria-label={`Eliminar ${articulo.nombre}`} onClick={() => setArticuloAEliminar(articulo)}><i className="bi bi-trash3"></i></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <p className="ap-pie-tabla">Mostrando {articulosVisibles.length} de {articulos.length} artículos.</p>
        </section>
      </div>

      {mostrarFormulario && (
        <div className="ap-modal-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget && !guardando) setMostrarFormulario(false); }}>
          <section className="ap-modal ap-modal-grande" role="dialog" aria-modal="true" aria-labelledby="am-form-titulo">
            <div className="ap-modal-encabezado">
              <div><h2 id="am-form-titulo">{articuloEditando ? "Editar artículo" : "Nuevo artículo de merch"}</h2><p>Completá la información del artículo y sus variantes.</p></div>
              <button type="button" className="ap-cerrar" onClick={() => setMostrarFormulario(false)} disabled={guardando} aria-label="Cerrar"><i className="bi bi-x-lg"></i></button>
            </div>
            <FormularioMerch
              key={articuloEditando?.id ?? "nuevo"}
              merch={articuloEditando}
              onGuardar={guardarArticulo}
              onCancelar={() => { setMostrarFormulario(false); setArticuloEditando(null); }}
              guardando={guardando}
            />
          </section>
        </div>
      )}

      {articuloAEliminar && (
        <div className="ap-modal-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget && !guardando) setArticuloAEliminar(null); }}>
          <section className="ap-modal ap-modal-confirmacion" role="alertdialog" aria-modal="true" aria-labelledby="am-eliminar-titulo">
            <div className="ap-modal-icono-peligro"><i className="bi bi-trash3"></i></div>
            <h2 id="am-eliminar-titulo">Eliminar artículo</h2>
            <p>¿Seguro que querés eliminar <strong>{articuloAEliminar.nombre}</strong>? Esta acción no se puede deshacer.</p>
            <div className="ap-formulario-acciones">
              <button className="ap-boton ap-boton-secundario" type="button" onClick={() => setArticuloAEliminar(null)} disabled={guardando}>Cancelar</button>
              <button className="ap-boton ap-boton-eliminar" type="button" onClick={confirmarEliminacion} disabled={guardando}>{guardando ? "Eliminando..." : "Sí, eliminar"}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminMerch;
