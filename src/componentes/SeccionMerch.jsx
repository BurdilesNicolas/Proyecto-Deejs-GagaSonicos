import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { agregarAlCarrito, LIMITE_POR_PRODUCTO } from "../data/Carrito";
import { normalizar } from "../data/Productos";
import { suscribirMerch } from "../services/merchService";
import { useUsuarioActual } from "../utils/sesion";
import "../estilos/Merch.css";

function etiquetaVariante(variante) {
  // Usa una etiqueta consistente para seleccionar la variante y guardarla en el carrito.
  return [variante.talle, variante.color].filter(Boolean).join(" / ");
}

function formatearPrecio(numero) {
  return Number(numero || 0).toLocaleString("es-AR");
}

function SeccionMerch({ busqueda = "" }) {
  // Se conserva en estado el inventario y la variante seleccionada por artículo.
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [variantesSeleccionadas, setVariantesSeleccionadas] = useState({});
  const [aviso, setAviso] = useState("");
  const { cuenta, cargando: cargandoSesion } = useUsuarioActual();
  const navigate = useNavigate();

  // Escucha el catálogo público de merch para que las altas y cambios de Administración
  // se vean en esta sección sin tener que recargar la página.
  useEffect(() => suscribirMerch(
    (datos) => {
      setArticulos(datos);
      setCargando(false);
      setError("");
    },
    (err) => {
      console.error("Error al cargar merch:", err);
      setError("No se pudo cargar el catálogo de merch. Revisá la conexión con Firestore.");
      setCargando(false);
    }
  ), []);

  // Reutiliza la búsqueda del navbar para filtrar nombre, categoría y descripción del merch.
  const articulosFiltrados = articulos.filter((articulo) =>
    !busqueda.trim() || normalizar(
      `${articulo.nombre || ""} ${articulo.categoria || ""} ${articulo.descripcion || ""}`
    ).includes(normalizar(busqueda))
  );

  function obtenerVariante(articulo) {
    const variantes = articulo.variantes ?? [];
    // Si el usuario eligió una combinación agotada, se selecciona otra disponible;
    // si no queda ninguna, se conserva la primera para mostrar que está agotada.
    return variantes.find((variante) =>
      etiquetaVariante(variante) === variantesSeleccionadas[articulo.id] &&
      Number(variante.stock) > 0
    ) || variantes.find((variante) => Number(variante.stock) > 0) || variantes[0];
  }

  async function comprar(articulo) {
    // Solo una cuenta autenticada puede guardar una línea de merch en su carrito.
    if (cargandoSesion) return;
    if (!cuenta) {
      navigate("/Perfil");
      return;
    }
    const variante = obtenerVariante(articulo);
    if (!variante || Number(variante.stock) <= 0) return;

    try {
      const agregadas = await agregarAlCarrito({
        id: articulo.id,
        formato: etiquetaVariante(variante),
        tipo: "merch",
        cantidad: 1,
        maximo: Math.min(LIMITE_POR_PRODUCTO, Number(variante.stock)),
      });
      setAviso(agregadas ? `${articulo.nombre} agregado al carrito.` : "Ya alcanzaste el máximo permitido de ese artículo.");
    } catch (error) {
      console.error("No se pudo agregar merch al carrito:", error);
      setAviso("No se pudo guardar el artículo en tu carrito. Intentá nuevamente.");
    }
  }

  // La sección muestra estados de carga/error y una tarjeta por artículo con
  // precio, selector de variante y compra limitada por stock real.
  return (
    <section className="seccion-merch" id="merch">
      <header className="merch-encabezado">
        <span className="merch-etiqueta">Deej&apos;s store</span>
        <h2>Merch oficial</h2>
        <p>Ropa y accesorios para llevar la música con vos.</p>
      </header>

      {aviso && <p className="merch-aviso" role="status">{aviso}</p>}
      {cargando && <p className="merch-estado">Cargando merch...</p>}
      {error && <p className="merch-estado" role="alert">{error}</p>}
      {/* El texto vacío distingue catálogo aún sin artículos de una búsqueda sin coincidencias. */}
      {!cargando && !error && articulosFiltrados.length === 0 && (
        <p className="merch-estado">
          {articulos.length === 0
            ? "Próximamente vas a encontrar merch oficial en esta sección."
            : "No hay artículos de merch que coincidan con tu búsqueda."}
        </p>
      )}

      {/* Cada tarjeta deja elegir entre variantes en stock antes de agregar el artículo. */}
      {!cargando && !error && articulosFiltrados.length > 0 && (
        <div className="merch-grilla">
          {articulosFiltrados.map((articulo) => {
            const variantes = articulo.variantes ?? [];
            const variante = obtenerVariante(articulo);
            const sinStock = !variante || Number(variante.stock) <= 0;
            return (
              <article className="merch-card" key={articulo.id}>
                <Link to={`/Merch/${articulo.id}`} className="merch-enlace-detalle" aria-label={`Ver detalle de ${articulo.nombre}`}>
                  <div className="merch-imagen">
                    {articulo.imagen && <img src={articulo.imagen} alt={articulo.nombre} loading="lazy" />}
                    <span className="merch-badge">{articulo.categoria}</span>
                  </div>
                </Link>
                <div className="merch-info">
                  <h3><Link to={`/Merch/${articulo.id}`} className="merch-nombre-enlace">{articulo.nombre}</Link></h3>
                  {articulo.descripcion && <p className="merch-descripcion">{articulo.descripcion}</p>}
                  <p className="merch-precio">${formatearPrecio(articulo.precio)},00</p>

                  {variantes.length > 0 && (
                    <label className="merch-variante">
                      <span>Talle / color</span>
                      <select
                        value={variante ? etiquetaVariante(variante) : ""}
                        onChange={(e) => setVariantesSeleccionadas((actual) => ({
                          ...actual,
                          [articulo.id]: e.target.value,
                        }))}
                      >
                        {variantes.map((opcion, indice) => (
                          <option key={`${etiquetaVariante(opcion)}-${indice}`} value={etiquetaVariante(opcion)} disabled={Number(opcion.stock) <= 0}>
                            {etiquetaVariante(opcion)}{Number(opcion.stock) <= 0 ? " · Agotado" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {variantes.length === 0 && <p className="merch-stock">Sin variantes disponibles</p>}
                  <Link to={`/Merch/${articulo.id}`} className="merch-ver-detalle">Ver detalle</Link>
                  <button type="button" className="merch-comprar" disabled={sinStock || cargandoSesion} onClick={() => comprar(articulo)}>
                    {sinStock ? "Agotado" : "Agregar al carrito"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default SeccionMerch;
