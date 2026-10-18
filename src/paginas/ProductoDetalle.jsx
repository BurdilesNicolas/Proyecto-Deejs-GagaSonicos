import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { productos } from '../data/Productos'
import { agregarAlCarrito } from '../data/carrito'
import '../estilos/ProductoDetalle.css'

function formatearPrecio(numero) {
  return `$${numero.toLocaleString('es-AR')},00`
}

// Acepta el ID solo ("3mH6qw...") o el link completo que se copia desde Spotify
function extraerSpotifyId(valor) {
  if (!valor) return null
  const coincidencia = valor.match(/album\/([A-Za-z0-9]+)/)
  return coincidencia ? coincidencia[1] : valor.trim()
}

/* ---------- Página: busca el producto según la URL (/Productos/3) ---------- */
function ProductoDetalle() {
  const { id } = useParams()
  const producto = productos.find((p) => String(p.id) === id)

  // Al cambiar de producto (por ejemplo desde "También te puede gustar") se vuelve arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!producto) {
    return (
      <div className="pagina-detalle">
        <div className="detalle-contenedor detalle-vacio">
          <h1>No encontramos ese producto</h1>
          <p>Puede que ya no esté disponible.</p>
          <Link to="/Productos" className="detalle-btn detalle-btn-principal">
            Volver a productos
          </Link>
        </div>
      </div>
    )
  }

  // key: al cambiar de producto, el formato y la cantidad elegidos arrancan de cero
  return <DetalleProducto key={producto.id} producto={producto} />
}

/* ---------- Contenido de la ficha ---------- */
function DetalleProducto({ producto }) {
  const navigate = useNavigate()

  // Si el producto no define "formatos", se usa uno solo con su precio base
  const formatos = producto.formatos?.length
    ? producto.formatos
    : [{ nombre: producto.formato || 'Edición estándar', precio: producto.precio }]

  const [formatoActivo, setFormatoActivo] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [favorito, setFavorito] = useState(false)
  const [agregado, setAgregado] = useState(null) // hora del último "agregado": reinicia el aviso

  const formato = formatos[formatoActivo]
  const spotifyId = extraerSpotifyId(producto.spotify)
  const tieneRating = typeof producto.rating === 'number'
  const estrellasLlenas = tieneRating ? Math.round(producto.rating) : 0
  const descripcion =
    producto.descripcion || 'Pronto vamos a sumar la descripción de este disco.'

  // Datos de la ficha técnica: lo que no esté cargado, no se muestra
  const ficha = [
    ['Artista', producto.artista],
    ['Año', producto.anio],
    ['Sello', producto.sello],
    ['Categoría', producto.categoria],
    ['Formatos', formatos.map((f) => f.nombre).join(' · ')],
  ].filter(([, valor]) => valor)

  // Primero los de la misma categoría, después el resto. Máximo 4.
  const relacionados = [
    ...productos.filter((p) => p.id !== producto.id && p.categoria === producto.categoria),
    ...productos.filter((p) => p.id !== producto.id && p.categoria !== producto.categoria),
  ].slice(0, 4)

  // El aviso "Agregado al carrito" se esconde solo a los 3 segundos
  useEffect(() => {
    if (agregado === null) return
    const timer = setTimeout(() => setAgregado(null), 3000)
    return () => clearTimeout(timer)
  }, [agregado])

  function sumarAlCarrito() {
    agregarAlCarrito({ id: producto.id, formato: formato.nombre, cantidad })
    setAgregado(Date.now())
  }

  function comprarYa() {
    agregarAlCarrito({ id: producto.id, formato: formato.nombre, cantidad })
    navigate('/carrito')
  }

  return (
    <div className="pagina-detalle">
      <div className="detalle-contenedor">

        {/* BREADCRUMB */}
        <nav className="detalle-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link>
          <span aria-hidden="true"> › </span>
          <Link to="/Productos">Productos</Link>
          <span aria-hidden="true"> › </span>
          <span>{producto.nombre}</span>
        </nav>

        <section className="detalle-hero">

          {/* IZQUIERDA: formato + portada con el vinilo asomando */}
          <div className="detalle-visual">
            {formatos.length > 1 ? (
              <div className="detalle-formato" role="group" aria-label="Elegir formato">
                <span className="detalle-formato-titulo">Elegir formato →</span>
                <div className="detalle-formato-opciones">
                  {formatos.map((f, i) => (
                    <button
                      key={f.nombre}
                      type="button"
                      aria-pressed={i === formatoActivo}
                      className={
                        i === formatoActivo
                          ? 'detalle-formato-opcion activa'
                          : 'detalle-formato-opcion'
                      }
                      onClick={() => setFormatoActivo(i)}
                    >
                      {f.nombre}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <span className="detalle-formato-unico">{formato.nombre}</span>
            )}

            <div className="detalle-portada-wrap">
              <div className="detalle-disco" aria-hidden="true" />
              <div className="detalle-funda" aria-hidden="true" />
              <div className="detalle-portada">
                {producto.imagen ? (
                  <img src={producto.imagen} alt={`Portada de ${producto.nombre}`} />
                ) : (
                  <span className="detalle-portada-vacia" aria-hidden="true">♪</span>
                )}
              </div>
            </div>
          </div>

          {/* DERECHA: datos de compra + reproductor de Spotify */}
          <div className="detalle-panel">
            <div className="detalle-info">
              <h1 className="detalle-titulo">“{producto.nombre}”</h1>

              {producto.artista && (
                <p className="detalle-artista">
                  {producto.artista}
                  {producto.anio ? ` · ${producto.anio}` : ''}
                </p>
              )}

              {tieneRating && (
                <div
                  className="detalle-estrellas"
                  role="img"
                  aria-label={`Valoración: ${producto.rating} de 5`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={n <= estrellasLlenas ? 'detalle-estrella llena' : 'detalle-estrella'}
                    >
                      ★
                    </span>
                  ))}
                  <span className="detalle-rating">{producto.rating.toFixed(1)}</span>
                </div>
              )}

              <p className="detalle-precio">{formatearPrecio(formato.precio)}</p>

              <div className="detalle-cantidad">
                <span id="etiqueta-cantidad" className="detalle-cantidad-etiqueta">
                  Cantidad
                </span>
                <div
                  className="detalle-cantidad-control"
                  role="group"
                  aria-labelledby="etiqueta-cantidad"
                >
                  <button
                    type="button"
                    aria-label="Restar una unidad"
                    disabled={cantidad <= 1}
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  >
                    −
                  </button>
                  <span aria-live="polite">{cantidad}</span>
                  <button
                    type="button"
                    aria-label="Sumar una unidad"
                    disabled={cantidad >= 10}
                    onClick={() => setCantidad((c) => Math.min(10, c + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              {cantidad > 1 && (
                <p className="detalle-total">
                  Total: {formatearPrecio(formato.precio * cantidad)}
                </p>
              )}

              <div className="detalle-botones">
                <button
                  type="button"
                  className="detalle-btn detalle-btn-principal"
                  onClick={sumarAlCarrito}
                >
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  className="detalle-btn detalle-btn-secundario"
                  onClick={comprarYa}
                >
                  Comprar ya
                </button>
              </div>

              <button
                type="button"
                className={favorito ? 'detalle-favorito activo' : 'detalle-favorito'}
                aria-pressed={favorito}
                onClick={() => setFavorito(!favorito)}
              >
                {favorito ? '♥ En tu wishlist' : '♡ Agregar a la wishlist'}
              </button>

              <p className="detalle-aviso" role="status">
                {agregado !== null && (
                  <>
                    Agregado al carrito ✓ <Link to="/carrito">Ver carrito</Link>
                  </>
                )}
              </p>
            </div>

            {spotifyId && (
              <div className="detalle-spotify">
                <iframe
                  title={`Escuchar ${producto.nombre} en Spotify`}
                  src={`https://open.spotify.com/embed/album/${spotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </section>

        {/* DESCRIPCIÓN (sacá "open" si querés que arranque cerrada) */}
        <details className="detalle-acordeon" open>
          <summary>Descripción</summary>
          <div className="detalle-acordeon-contenido">
            <p>{descripcion}</p>
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

        {/* TAMBIÉN TE PUEDE GUSTAR */}
        {relacionados.length > 0 && (
          <details className="detalle-acordeon" open>
            <summary>También te puede gustar</summary>
            <div className="detalle-acordeon-contenido">
              <div className="detalle-relacionados">
                {relacionados.map((p) => (
                  <Link key={p.id} to={`/Productos/${p.id}`} className="detalle-rel">
                    <div className="detalle-rel-img">
                      {p.imagen && <img src={p.imagen} alt="" loading="lazy" />}
                    </div>
                    <span className="detalle-rel-nombre">{p.nombre}</span>
                    {p.artista && <span className="detalle-rel-artista">{p.artista}</span>}
                    <span className="detalle-rel-precio">{formatearPrecio(p.precio)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </details>
        )}

      </div>
    </div>
  )
}

export default ProductoDetalle
