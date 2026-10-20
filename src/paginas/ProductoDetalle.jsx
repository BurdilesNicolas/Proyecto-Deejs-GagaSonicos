import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { productos } from '../data/Productos'
import { agregarAlCarrito, LIMITE_POR_PRODUCTO } from '../data/carrito'
import '../estilos/ProductoDetalle.css'
import '../estilos/FormatosAnimados.css'

function formatearPrecio(numero) {
  return `$${numero.toLocaleString('es-AR')},00`
}

// Acepta el ID solo ("3mH6qw...") o el link completo que se copia desde Spotify
function extraerSpotifyId(valor) {
  if (!valor) return null
  const coincidencia = valor.match(/album\/([A-Za-z0-9]+)/)
  return coincidencia ? coincidencia[1] : valor.trim()
}

// Los tres formatos que se pueden elegir, en este orden
const NOMBRES_FORMATO = ['Vinilo', 'CD', 'Cassette']

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Decide qué dibujo/animación usar según el nombre ("Vinilo", "CD", "Cassette" o "Casete")
function tipoDeFormato(nombre) {
  const n = normalizar(nombre)
  if (n.startsWith('cd')) return 'cd'
  if (n.startsWith('cas')) return 'cassette'
  return 'vinilo'
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

  // Si el producto define "formatos", siempre se muestran los tres (Vinilo, CD, Cassette):
  // los que no estén cargados o tengan stock 0 aparecen deshabilitados como "Agotado".
  // Si no define "formatos", se usa una sola edición con el precio base.
  const tieneFormatos = Array.isArray(producto.formatos) && producto.formatos.length > 0

  const formatos = tieneFormatos
    ? NOMBRES_FORMATO.map((nombre) => {
        const tipo = tipoDeFormato(nombre)
        const dato = producto.formatos.find((f) => tipoDeFormato(f.nombre) === tipo)
        return {
          nombre: dato ? dato.nombre : nombre,
          tipo,
          precio: dato?.precio ?? producto.precio,
          stock: dato ? dato.stock : 0,
          disponible: Boolean(dato) && (dato.stock === undefined || dato.stock > 0),
        }
      })
    : [
        {
          nombre: producto.formato || 'Edición estándar',
          tipo: tipoDeFormato(producto.formato || ''),
          precio: producto.precio,
          stock: undefined,
          disponible: true,
        },
      ]

  // Arranca en el primer formato disponible
  const primerDisponible = Math.max(0, formatos.findIndex((f) => f.disponible))

  const [formatoActivo, setFormatoActivo] = useState(primerDisponible)
  const [cantidadElegida, setCantidadElegida] = useState(1)
  const [favorito, setFavorito] = useState(false)
  const [aviso, setAviso] = useState(null) // { tipo: 'ok' | 'parcial' | 'limite', hora }

  const formato = formatos[formatoActivo]

  // Límite de unidades: el general (2) o el stock de ese formato, lo que sea menor
  const limite = formato.disponible
    ? Math.min(
        LIMITE_POR_PRODUCTO,
        typeof formato.stock === 'number' ? formato.stock : LIMITE_POR_PRODUCTO
      )
    : 0
  const cantidad = Math.max(1, Math.min(cantidadElegida, limite || 1))

  let nota = null
  if (formato.disponible) {
    if (typeof formato.stock === 'number' && formato.stock < LIMITE_POR_PRODUCTO) {
      nota = formato.stock === 1 ? 'Queda solo 1 unidad' : `Quedan solo ${formato.stock}`
    } else {
      nota = `Máximo ${LIMITE_POR_PRODUCTO} unidades por producto`
    }
  }

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
    [
      'Formatos',
      formatos
        .filter((f) => f.disponible)
        .map((f) => f.nombre)
        .join(' · '),
    ],
  ].filter(([, valor]) => valor)

  // Primero los de la misma categoría, después el resto. Máximo 4.
  const relacionados = [
    ...productos.filter((p) => p.id !== producto.id && p.categoria === producto.categoria),
    ...productos.filter((p) => p.id !== producto.id && p.categoria !== producto.categoria),
  ].slice(0, 4)

  // El aviso se esconde solo a los 3,5 segundos
  useEffect(() => {
    if (aviso === null) return
    const timer = setTimeout(() => setAviso(null), 3500)
    return () => clearTimeout(timer)
  }, [aviso])

  function sumarAlCarrito() {
    const agregadas = agregarAlCarrito({
      id: producto.id,
      formato: formato.nombre,
      cantidad,
      maximo: limite,
    })
    let tipo = 'ok'
    if (agregadas === 0) tipo = 'limite'
    else if (agregadas < cantidad) tipo = 'parcial'
    setAviso({ tipo, hora: Date.now() })
  }

  function comprarYa() {
    agregarAlCarrito({
      id: producto.id,
      formato: formato.nombre,
      cantidad,
      maximo: limite,
    })
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

          {/* IZQUIERDA: formato + portada con el vinilo / CD / cassette asomando */}
          <div className="detalle-visual">
            {tieneFormatos ? (
              <div className="detalle-formato" role="group" aria-label="Elegir formato">
                <span className="detalle-formato-titulo">Elegir formato →</span>
                <div className="detalle-formato-opciones">
                  {formatos.map((f, i) => (
                    <button
                      key={f.tipo}
                      type="button"
                      disabled={!f.disponible}
                      aria-pressed={i === formatoActivo}
                      className={
                        i === formatoActivo
                          ? 'detalle-formato-opcion activa'
                          : 'detalle-formato-opcion'
                      }
                      onClick={() => setFormatoActivo(i)}
                    >
                      {f.nombre}
                      {!f.disponible && <small>Agotado</small>}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <span className="detalle-formato-unico">{formato.nombre}</span>
            )}

            {/* El tipo elegido cambia la clase y el objeto que asoma detrás de la portada.
                Al elegir otro formato, el nuevo objeto se monta y su animación arranca. */}
            <div className={`detalle-portada-wrap detalle-tipo-${formato.tipo}`}>
              {formato.tipo === 'vinilo' && (
                <div className="detalle-disco" aria-hidden="true" />
              )}

              {formato.tipo === 'cd' && (
                <div className="detalle-cd" aria-hidden="true" />
              )}

              {/* Si el producto tiene "imagenCassette" se usa esa imagen;
                  si no, se muestra una cinta dibujada con CSS */}
              {formato.tipo === 'cassette' && (
                <div
                  className={producto.imagenCassette ? 'detalle-casete con-imagen' : 'detalle-casete'}
                  aria-hidden="true"
                >
                  {producto.imagenCassette ? (
                    <img src={producto.imagenCassette} alt="" />
                  ) : (
                    <>
                      <div className="detalle-casete-etiqueta" />
                      <div className="detalle-casete-ventana">
                        <span className="detalle-rueda" />
                        <span className="detalle-rueda" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {formato.tipo === 'vinilo' && (
                <div className="detalle-funda" aria-hidden="true" />
              )}

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

              <p className="detalle-precio">
                {formato.disponible ? formatearPrecio(formato.precio) : 'No disponible'}
              </p>

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
                    onClick={() => setCantidadElegida((c) => Math.max(1, c - 1))}
                  >
                    −
                  </button>
                  <span aria-live="polite">{cantidad}</span>
                  <button
                    type="button"
                    aria-label="Sumar una unidad"
                    disabled={cantidad >= limite}
                    onClick={() => setCantidadElegida((c) => Math.min(limite, c + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              {nota && <p className="detalle-nota">{nota}</p>}

              {!formato.disponible && (
                <p className="detalle-agotado">Este formato está agotado por ahora.</p>
              )}

              {cantidad > 1 && formato.disponible && (
                <p className="detalle-total">
                  Total: {formatearPrecio(formato.precio * cantidad)}
                </p>
              )}

              <div className="detalle-botones">
                <button
                  type="button"
                  className="detalle-btn detalle-btn-principal"
                  disabled={!formato.disponible}
                  onClick={sumarAlCarrito}
                >
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  className="detalle-btn detalle-btn-secundario"
                  disabled={!formato.disponible}
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
                {aviso?.tipo === 'ok' && (
                  <>
                    Agregado al carrito ✓ <Link to="/carrito">Ver carrito</Link>
                  </>
                )}
                {aviso?.tipo === 'parcial' && (
                  <>
                    Agregamos las que entraban: el máximo es {limite} por producto.{' '}
                    <Link to="/carrito">Ver carrito</Link>
                  </>
                )}
                {aviso?.tipo === 'limite' && (
                  <>
                    Ya tenés el máximo ({limite}) de este formato en tu carrito.{' '}
                    <Link to="/carrito">Ver carrito</Link>
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