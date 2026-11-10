import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { agregarAlCarrito, LIMITE_POR_PRODUCTO } from "../data/Carrito";
import { useWishlist } from "../data/Wishlist";
import { suscribirMerch } from "../services/merchService";
import { useUsuarioActual } from "../utils/sesion";
import "../estilos/ProductoDetalle.css";
import "../estilos/MerchDetalle.css";

function formatearPrecio(numero) {
  return `$${Number(numero || 0).toLocaleString("es-AR")},00`;
}

function etiquetaVariante(variante) {
  return [variante.talle, variante.color].filter(Boolean).join(" / ");
}

function MerchDetalle() {
  const { id } = useParams();
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);

  // La ficha se mantiene sincronizada con el catálogo administrado en Firestore.
  useEffect(() => suscribirMerch(
    (datos) => {
      setArticulos(datos);
      setCargando(false);
      setErrorCarga(false);
    },
    (error) => {
      console.error("Error al cargar el detalle del merch:", error);
      setCargando(false);
      setErrorCarga(true);
    }
  ), []);

  const articulo = articulos.find((item) => String(item.id) === String(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (cargando) {
    return (
      <main className="pagina-detalle pagina-merch-detalle">
        <div className="detalle-contenedor detalle-vacio">
          <h1>Cargando artículo...</h1>
        </div>
      </main>
    );
  }

  if (errorCarga || !articulo) {
    return (
      <main className="pagina-detalle pagina-merch-detalle">
        <div className="detalle-contenedor detalle-vacio">
          <h1>{errorCarga ? "No se pudo cargar el artículo" : "No encontramos ese artículo"}</h1>
          <p>{errorCarga ? "Revisá tu conexión e intentá nuevamente." : "Puede que ya no esté disponible."}</p>
          <Link to="/Productos#merch" className="detalle-btn detalle-btn-principal">
            Volver a la merch
          </Link>
        </div>
      </main>
    );
  }

  return <FichaMerch key={articulo.id} articulo={articulo} articulos={articulos} />;
}

function FichaMerch({ articulo, articulos }) {
  const navigate = useNavigate();
  const { cuenta, cargando: cargandoSesion } = useUsuarioActual();
  const variantes = Array.isArray(articulo.variantes) ? articulo.variantes : [];
  const varianteInicial = variantes.find((opcion) => Number(opcion.stock) > 0) || variantes[0];
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(
    () => varianteInicial ? etiquetaVariante(varianteInicial) : ""
  );
  const [cantidadElegida, setCantidadElegida] = useState(1);
  const [aviso, setAviso] = useState(null);
  const {
    estaEnWishlist,
    alternar: alternarWishlist,
    error: errorWishlist,
  } = useWishlist();
  const favorito = estaEnWishlist(articulo.id, "merch");

  // Mantiene la variante seleccionada mientras exista; al actualizarse el inventario,
  // vuelve a una opción disponible si la variante anterior dejó de estar en catálogo.
  const variante = variantes.find(
    (opcion) => etiquetaVariante(opcion) === varianteSeleccionada
  ) || variantes.find((opcion) => Number(opcion.stock) > 0) || variantes[0];
  const stock = Number(variante?.stock) || 0;
  const maximo = Math.min(LIMITE_POR_PRODUCTO, stock);
  const cantidad = Math.max(1, Math.min(cantidadElegida, maximo || 1));
  const disponible = Boolean(variante) && stock > 0;
  const relacionados = articulos
    .filter((item) => item.id !== articulo.id && item.categoria === articulo.categoria)
    .concat(articulos.filter((item) => item.id !== articulo.id && item.categoria !== articulo.categoria))
    .slice(0, 4);

  useEffect(() => {
    if (aviso === null) return undefined;
    const temporizador = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  function exigirSesion() {
    if (cargandoSesion) return false;
    if (!cuenta) {
      navigate("/Perfil");
      return false;
    }
    return true;
  }

  async function sumarAlCarrito(irAlCarrito = false) {
    if (!exigirSesion()) return;
    if (!disponible) return;

    try {
      const agregadas = await agregarAlCarrito({
        id: articulo.id,
        formato: etiquetaVariante(variante),
        tipo: "merch",
        cantidad,
        maximo,
      });

      if (irAlCarrito && agregadas > 0) {
        navigate("/Carrito");
        return;
      }

      setAviso(agregadas === 0
        ? { tipo: "limite" }
        : agregadas < cantidad
          ? { tipo: "parcial" }
          : { tipo: "ok" });
    } catch (error) {
      console.error("No se pudo agregar merch al carrito:", error);
      setAviso({ tipo: "error" });
    }
  }

  async function cambiarWishlist() {
    if (!exigirSesion()) return;
    try {
      await alternarWishlist(articulo.id, "merch");
    } catch (error) {
      console.error("No se pudo actualizar la wishlist:", error);
    }
  }

  const ficha = [
    ["Categoría", articulo.categoria],
    ["Talle", variante?.talle],
    ["Color", variante?.color],
    ["Stock disponible", disponible ? stock : "Agotado"],
  ].filter(([, valor]) => valor);

  return (
    <main className="pagina-detalle pagina-merch-detalle">
      <div className="detalle-contenedor">
        <nav className="detalle-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link>
          <span aria-hidden="true"> › </span>
          <Link to="/Productos#merch">Merch oficial</Link>
          <span aria-hidden="true"> › </span>
          <span>{articulo.nombre}</span>
        </nav>

        <section className="detalle-hero merch-detalle-hero">
          <div className="merch-detalle-visual">
            <span className="merch-detalle-categoria">{articulo.categoria || "Merch oficial"}</span>
            <div className="merch-detalle-imagen">
              {articulo.imagen
                ? <img src={articulo.imagen} alt={articulo.nombre} />
                : <span aria-hidden="true">DEEJ&apos;S</span>}
            </div>
          </div>

          <div className="detalle-panel merch-detalle-panel">
            <div className="detalle-info">
              <span className="merch-detalle-etiqueta">Deej&apos;s store · Merch oficial</span>
              <h1 className="detalle-titulo">{articulo.nombre}</h1>
              <p className="detalle-precio">{formatearPrecio(articulo.precio)}</p>

              {variantes.length > 0 ? (
                <fieldset className="merch-detalle-variantes">
                  <legend>Talle y color</legend>
                  <div className="merch-detalle-opciones">
                    {variantes.map((opcion, indice) => {
                      const etiqueta = etiquetaVariante(opcion);
                      const agotada = Number(opcion.stock) <= 0;
                      return (
                        <button
                          key={`${etiqueta}-${indice}`}
                          type="button"
                          className={etiqueta === etiquetaVariante(variante || {}) ? "activa" : ""}
                          aria-pressed={etiqueta === etiquetaVariante(variante || {})}
                          disabled={agotada}
                          onClick={() => {
                            setVarianteSeleccionada(etiqueta);
                            setCantidadElegida(1);
                          }}
                        >
                          {etiqueta}{agotada ? " · Agotado" : ""}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ) : (
                <p className="merch-detalle-agotado">Este artículo no tiene variantes cargadas.</p>
              )}

              {disponible && (
                <div className="detalle-cantidad">
                  <span id="merch-etiqueta-cantidad" className="detalle-cantidad-etiqueta">Cantidad</span>
                  <div className="detalle-cantidad-control" role="group" aria-labelledby="merch-etiqueta-cantidad">
                    <button
                      type="button"
                      aria-label="Restar una unidad"
                      disabled={cantidad <= 1}
                      onClick={() => setCantidadElegida((actual) => Math.max(1, actual - 1))}
                    >
                      −
                    </button>
                    <span aria-live="polite">{cantidad}</span>
                    <button
                      type="button"
                      aria-label="Sumar una unidad"
                      disabled={cantidad >= maximo}
                      onClick={() => setCantidadElegida((actual) => Math.min(maximo, actual + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {disponible
                ? <p className="merch-detalle-nota">{stock === 1 ? "Queda solo 1 unidad" : `Stock disponible: ${stock}`}</p>
                : <p className="merch-detalle-agotado">Este artículo está agotado por ahora.</p>}

              {cantidad > 1 && <p className="detalle-total">Total: {formatearPrecio(Number(articulo.precio) * cantidad)}</p>}

              <div className="detalle-botones">
                <button
                  type="button"
                  className="detalle-btn detalle-btn-principal"
                  disabled={!disponible || cargandoSesion}
                  onClick={() => sumarAlCarrito()}
                >
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  className="detalle-btn detalle-btn-secundario"
                  disabled={!disponible || cargandoSesion}
                  onClick={() => sumarAlCarrito(true)}
                >
                  Comprar ya
                </button>
              </div>

              <button
                type="button"
                className={favorito ? "detalle-favorito activo" : "detalle-favorito"}
                aria-pressed={favorito}
                onClick={cambiarWishlist}
              >
                {favorito ? "♥ En tu wishlist" : "♡ Agregar a la wishlist"}
              </button>

              <p className="detalle-aviso" role="status">
                {aviso?.tipo === "ok" && <>Agregado al carrito ✓ <Link to="/Carrito">Ver carrito</Link></>}
                {aviso?.tipo === "parcial" && <>Agregamos las unidades disponibles hasta el máximo permitido. <Link to="/Carrito">Ver carrito</Link></>}
                {aviso?.tipo === "limite" && <>Ya alcanzaste el máximo permitido de esta variante. <Link to="/Carrito">Ver carrito</Link></>}
                {aviso?.tipo === "error" && "No se pudo guardar el artículo. Revisá tu conexión e intentá nuevamente."}
                {errorWishlist && <span role="alert">{errorWishlist}</span>}
              </p>
            </div>
          </div>
        </section>

        <details className="detalle-acordeon" open>
          <summary>Descripción y detalles</summary>
          <div className="detalle-acordeon-contenido">
            <p>{articulo.descripcion || "Merch oficial de Deej's, pensado para acompañarte dentro y fuera de la música."}</p>
            <dl className="detalle-ficha">
              {ficha.map(([clave, valor]) => (
                <div key={clave}>
                  <dt>{clave}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </details>

        {relacionados.length > 0 && (
          <details className="detalle-acordeon" open>
            <summary>También te puede gustar</summary>
            <div className="detalle-acordeon-contenido">
              <div className="detalle-relacionados">
                {relacionados.map((item) => (
                  <Link key={item.id} to={`/Merch/${item.id}`} className="detalle-rel">
                    <div className="detalle-rel-img">
                      {item.imagen && <img src={item.imagen} alt="" loading="lazy" />}
                    </div>
                    <span className="detalle-rel-nombre">{item.nombre}</span>
                    <span className="detalle-rel-artista">{item.categoria}</span>
                    <span className="detalle-rel-precio">{formatearPrecio(item.precio)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </details>
        )}
      </div>
    </main>
  );
}

export default MerchDetalle;
