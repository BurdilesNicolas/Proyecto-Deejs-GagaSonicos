import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { agregarAlCarrito, LIMITE_POR_PRODUCTO } from "../data/Carrito";
import { normalizar } from "../data/Productos";
import { suscribirMerch } from "../services/merchService";
import { useUsuarioActual } from "../utils/sesion";
import "../estilos/Merch.css";

function etiquetaVariante(variante) {
  return [variante.talle, variante.color].filter(Boolean).join(" / ");
}

function formatearPrecio(numero) {
  return Number(numero || 0).toLocaleString("es-AR");
}

function SeccionMerch({ busqueda = "" }) {
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [variantesSeleccionadas, setVariantesSeleccionadas] = useState({});
  const [aviso, setAviso] = useState("");
  const { cuenta, cargando: cargandoSesion } = useUsuarioActual();
  const navigate = useNavigate();

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

  const articulosFiltrados = articulos.filter((articulo) =>
    !busqueda.trim() || normalizar(
      `${articulo.nombre || ""} ${articulo.categoria || ""} ${articulo.descripcion || ""}`
    ).includes(normalizar(busqueda))
  );

  function obtenerVariante(articulo) {
    const variantes = articulo.variantes ?? [];
    return variantes.find((variante) =>
      etiquetaVariante(variante) === variantesSeleccionadas[articulo.id] &&
      Number(variante.stock) > 0
    ) || variantes.find((variante) => Number(variante.stock) > 0) || variantes[0];
  }

  async function comprar(articulo) {
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
      {!cargando && !error && articulosFiltrados.length === 0 && (
        <p className="merch-estado">
          {articulos.length === 0
            ? "Próximamente vas a encontrar merch oficial en esta sección."
            : "No hay artículos de merch que coincidan con tu búsqueda."}
        </p>
      )}

      {!cargando && !error && articulosFiltrados.length > 0 && (
        <div className="merch-grilla">
          {articulosFiltrados.map((articulo) => {
            const variantes = articulo.variantes ?? [];
            const variante = obtenerVariante(articulo);
            const sinStock = !variante || Number(variante.stock) <= 0;
            return (
              <article className="merch-card" key={articulo.id}>
                <div className="merch-imagen">
                  {articulo.imagen && <img src={articulo.imagen} alt={articulo.nombre} loading="lazy" />}
                  <span className="merch-badge">{articulo.categoria}</span>
                </div>
                <div className="merch-info">
                  <h3>{articulo.nombre}</h3>
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
