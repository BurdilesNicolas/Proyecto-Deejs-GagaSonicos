import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productos as productosLocales, normalizar } from "../../data/Productos";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  importarCatalogoInicial,
  suscribirProductos,
} from "../../services/productosService";
import FormularioProducto from "../../componentes/admin/FormularioProducto";
import "../../estilos/Admin.css";
import "../../estilos/AdminProductos.css";

function precio(numero) {
  return `$${Number(numero || 0).toLocaleString("es-AR")}`;
}

function AdminProductos() {
  // productos contiene la copia de Firestore que se dibuja en la tabla.
  const [productos, setProductos] = useState([]);
  // Los estados de carga y error permiten mostrar respuestas claras si Firestore tarda o rechaza la consulta.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Búsqueda y categoría se aplican localmente sobre los productos ya descargados.
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  // productoEditando distingue el modo edición del modo creación del formulario compartido.
  const [productoEditando, setProductoEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  // Se guarda el producto elegido para pedir confirmación antes de eliminarlo.
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [importando, setImportando] = useState(false);

  // Al entrar, se escucha el catálogo en tiempo real; Firestore devuelve una función
  // para cancelar la escucha cuando se abandona esta pantalla.
  // Los avisos de éxito desaparecen solos y se limpia el temporizador al salir de la página.
  useEffect(() => {
    const cancelar = suscribirProductos(
      (datos) => {
        setProductos(datos);
        setCargando(false);
        setError("");
      },
      (err) => {
        console.error("Error al cargar productos:", err);
        setError(err.code === "permission-denied"
          ? "Firestore rechazó la consulta. Revisá las reglas de la colección productos."
          : "No se pudieron cargar los productos.");
        setCargando(false);
      }
    );
    return cancelar;
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(""), 3500);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  // Las categorías disponibles salen de los datos actuales para no mostrar filtros vacíos.
  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoria).filter(Boolean))].sort(),
    [productos]
  );

  // La normalización permite buscar sin distinguir mayúsculas ni tildes.
  // Ambos filtros deben coincidir para que un producto aparezca en la tabla.
  const productosVisibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    return productos.filter((producto) => {
      const coincideCategoria = filtroCategoria === "todas" || producto.categoria === filtroCategoria;
      const coincideTexto = !texto || normalizar(`${producto.nombre} ${producto.artista || ""}`).includes(texto);
      return coincideCategoria && coincideTexto;
    });
  }, [productos, busqueda, filtroCategoria]);

  // El mismo formulario sirve para crear y editar: si hay producto seleccionado,
  // se actualiza su documento; de lo contrario se agrega uno nuevo a Firestore.
  async function guardarProducto(datos) {
    setGuardando(true);
    try {
      if (productoEditando) {
        await actualizarProducto(productoEditando.id, datos);
        setAviso("Producto actualizado correctamente.");
      } else {
        await crearProducto(datos);
        setAviso("Producto creado correctamente.");
      }
      setMostrarFormulario(false);
      setProductoEditando(null);
    } catch (err) {
      console.error("Error al guardar producto:", err);
      setError(err.code === "permission-denied"
        ? "No tenés permisos para guardar productos. Revisá tu rol y las reglas de Firestore."
        : "No se pudo guardar el producto. Intentá nuevamente.");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminacion() {
    // La eliminación solo continúa después de que el administrador eligió un producto.
    if (!productoAEliminar) return;
    setGuardando(true);
    try {
      await eliminarProducto(productoAEliminar.id);
      setAviso("Producto eliminado correctamente.");
      setProductoAEliminar(null);
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setError(err.code === "permission-denied"
        ? "No tenés permisos para eliminar productos. Revisá las reglas de Firestore."
        : "No se pudo eliminar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  // Importa el catálogo estático inicial y conserva los IDs para no romper
  // referencias existentes, como las reseñas asociadas a esos productos.
  async function importarCatalogo() {
    if (!window.confirm("Se copiarán los productos actuales a Firestore. ¿Querés continuar?")) return;
    setImportando(true);
    setError("");
    try {
      await importarCatalogoInicial(productosLocales);
      setAviso("Catálogo inicial importado. Los IDs existentes se conservaron.");
    } catch (err) {
      console.error("Error al importar el catálogo:", err);
      setError("No se pudo importar el catálogo. Revisá las reglas de Firestore.");
    } finally {
      setImportando(false);
    }
  }

  function abrirCrear() {
    // Limpia la selección anterior para que el formulario se abra vacío.
    setProductoEditando(null);
    setMostrarFormulario(true);
  }

  function abrirEditar(producto) {
    // Pasa al formulario la información actual del producto que se eligió en la tabla.
    setProductoEditando(producto);
    setMostrarFormulario(true);
  }

  // La vista combina el resumen del catálogo, filtros y tabla; los formularios
  // y la confirmación de borrado aparecen en modales para mantener el contexto.
  return (
    <div className="admin-page">
      <div className="admin-contenedor">
        <Link to="/Admin" className="admin-volver"><i className="bi bi-arrow-left"></i> Volver al panel</Link>

        <header className="ap-encabezado">
          <div>
            <h1 className="ap-titulo">Gestión de productos</h1>
            <p className="ap-descripcion">Administrá el catálogo físico de Deej&apos;s.</p>
          </div>
          <button type="button" className="ap-boton ap-boton-principal" onClick={abrirCrear}>
            <i className="bi bi-plus-lg"></i> Nuevo producto
          </button>
        </header>

        {aviso && <p className="ap-aviso" role="status"><i className="bi bi-check-circle"></i> {aviso}</p>}
        {error && <p className="ap-alerta-error" role="alert"><i className="bi bi-exclamation-triangle"></i> {error}</p>}

        <section className="ap-panel">
          <div className="ap-resumen">
            <div className="ap-stat"><strong>{productos.length}</strong><span>Productos registrados</span></div>
            <div className="ap-stat"><strong>{categorias.length}</strong><span>Categorías</span></div>
            {productos.length === 0 && !cargando && (
              <button type="button" className="ap-boton ap-boton-secundario" onClick={importarCatalogo} disabled={importando}>
                {importando ? "Importando..." : "Importar catálogo actual"}
              </button>
            )}
          </div>

          <div className="ap-herramientas">
            <label className="ap-buscador"><i className="bi bi-search"></i><input className="ap-input" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por álbum o artista" /></label>
            <select className="ap-input" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="todas">Todas las categorías</option>
              {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
            </select>
          </div>

          {/* La tabla calcula el stock sumando las existencias de cada formato físico. */}
          <div className="ap-tabla-contenedor">
            {cargando ? (
              <div className="ap-estado"><div className="ap-spinner"></div>Cargando productos...</div>
            ) : productosVisibles.length === 0 ? (
              <div className="ap-estado"><i className="bi bi-disc"></i><p>{productos.length === 0 ? "Todavía no hay productos en Firestore." : "No hay productos que coincidan con la búsqueda."}</p></div>
            ) : (
              <table className="ap-tabla">
                <thead><tr><th>Producto</th><th>Categoría</th><th>Precio base</th><th>Formatos</th><th>Stock total</th><th className="ap-acciones-col">Acciones</th></tr></thead>
                <tbody>
                  {productosVisibles.map((producto) => {
                    const stock = (producto.formatos ?? []).reduce((total, formato) => total + Number(formato.stock || 0), 0);
                    return (
                      <tr key={producto.id}>
                        <td><div className="ap-producto-celda"><img src={producto.imagen} alt="" /><div><strong>{producto.nombre}</strong><span>{producto.artista}</span></div></div></td>
                        <td>{producto.categoria || "—"}</td>
                        <td>{precio(producto.precio)}</td>
                        <td>{(producto.formatos ?? []).map((f) => f.nombre).join(", ") || "—"}</td>
                        <td>{stock}</td>
                        <td className="ap-acciones-col"><button type="button" className="ap-icono-boton" title="Editar" aria-label={`Editar ${producto.nombre}`} onClick={() => abrirEditar(producto)}><i className="bi bi-pencil-square"></i></button><button type="button" className="ap-icono-boton ap-icono-peligro" title="Eliminar" aria-label={`Eliminar ${producto.nombre}`} onClick={() => setProductoAEliminar(producto)}><i className="bi bi-trash3"></i></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <p className="ap-pie-tabla">Mostrando {productosVisibles.length} de {productos.length} productos.</p>
        </section>
      </div>

      {/* El modal reutiliza FormularioProducto tanto para altas como para modificaciones. */}
      {mostrarFormulario && (
        <div className="ap-modal-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget && !guardando) setMostrarFormulario(false); }}>
          <section className="ap-modal ap-modal-grande" role="dialog" aria-modal="true" aria-labelledby="ap-form-titulo">
            <div className="ap-modal-encabezado"><div><h2 id="ap-form-titulo">{productoEditando ? "Editar producto" : "Nuevo producto"}</h2><p>Completá los datos del álbum y sus formatos físicos.</p></div><button type="button" className="ap-cerrar" onClick={() => setMostrarFormulario(false)} disabled={guardando} aria-label="Cerrar"><i className="bi bi-x-lg"></i></button></div>
            <FormularioProducto producto={productoEditando} onGuardar={guardarProducto} onCancelar={() => { setMostrarFormulario(false); setProductoEditando(null); }} guardando={guardando} />
          </section>
        </div>
      )}

      {/* Se solicita confirmación explícita antes de borrar definitivamente en Firestore. */}
      {productoAEliminar && (
        <div className="ap-modal-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget && !guardando) setProductoAEliminar(null); }}>
          <section className="ap-modal ap-modal-confirmacion" role="alertdialog" aria-modal="true" aria-labelledby="ap-eliminar-titulo">
            <div className="ap-modal-icono-peligro"><i className="bi bi-trash3"></i></div>
            <h2 id="ap-eliminar-titulo">Eliminar producto</h2>
            <p>¿Seguro que querés eliminar <strong>{productoAEliminar.nombre}</strong>? Esta acción no se puede deshacer.</p>
            <div className="ap-formulario-acciones"><button className="ap-boton ap-boton-secundario" type="button" onClick={() => setProductoAEliminar(null)} disabled={guardando}>Cancelar</button><button className="ap-boton ap-boton-eliminar" type="button" onClick={confirmarEliminacion} disabled={guardando}>{guardando ? "Eliminando..." : "Sí, eliminar"}</button></div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminProductos;
