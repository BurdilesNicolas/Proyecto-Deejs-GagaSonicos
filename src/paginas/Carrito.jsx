import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { suscribirProductos } from '../services/productosService'
import { suscribirMerch } from '../services/merchService'
import { useUsuarioActual } from '../utils/sesion'
import {
  cambiarCantidad,
  quitarDelCarrito,
  vaciarCarrito,
  LIMITE_POR_PRODUCTO,
  useCarrito,
} from '../data/Carrito'
import '../estilos/Carrito.css'

function formatearPrecio(numero) {
  return `$${numero.toLocaleString('es-AR')},00`
}

function Carrito() {
  // useCarrito entrega los ítems de la cuenta actual y mantiene esta pantalla
  // sincronizada cuando el usuario cambia el carrito desde otra parte.
  const { items, cargando: cargandoCarrito, error: errorCarrito } = useCarrito()
  const { cuenta, cargando: cargandoSesion } = useUsuarioActual()
  const [productos, setProductos] = useState([])
  const [merch, setMerch] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [cargandoMerch, setCargandoMerch] = useState(true)
  const [mensaje, setMensaje] = useState('')

  // Las líneas del carrito solo almacenan IDs; se escuchan ambos catálogos
  // para resolver los datos actuales de discos y merch.
  useEffect(() => {
    const cancelarProductos = suscribirProductos((datos) => {
      setProductos(datos)
      setCargandoProductos(false)
    }, (error) => {
      console.error('Error al cargar productos del carrito:', error)
      setCargandoProductos(false)
    })
    const cancelarMerch = suscribirMerch((datos) => {
      setMerch(datos)
      setCargandoMerch(false)
    }, (error) => {
      console.error('Error al cargar merch del carrito:', error)
      setCargandoMerch(false)
    })
    return () => {
      cancelarProductos()
      cancelarMerch()
    }
  }, [])

  // Completa cada línea con su producto, variante, precio y stock actual.
  // El campo tipo permite consultar la colección correcta y evitar confundir un
  // artículo de merch con un disco que tenga el mismo ID.
  const lineas = items
    .map((item) => {
      const tipo = item.tipo || 'producto'
      const catalogo = tipo === 'merch' ? merch : productos
      const producto = catalogo.find((p) => String(p.id) === String(item.id))
      if (!producto) return null
      const infoFormato = producto.formatos?.find((f) => f.nombre === item.formato)
      const varianteMerch = tipo === 'merch'
        ? producto.variantes?.find((variante) => [variante.talle, variante.color].filter(Boolean).join(' / ') === item.formato)
        : null
      const precio = infoFormato ? infoFormato.precio : producto.precio
      const stock = tipo === 'merch' ? varianteMerch?.stock : infoFormato?.stock
      // La cantidad disponible para esta línea nunca puede superar ni el límite
      // general de compra ni el stock vigente de la variante seleccionada.
      const maximo = Math.max(
        1,
        Math.min(LIMITE_POR_PRODUCTO, typeof stock === 'number' ? stock : LIMITE_POR_PRODUCTO)
      )
      return { ...item, tipo, producto, precio, maximo }
    })
    .filter(Boolean)

  const unidades = lineas.reduce((acc, l) => acc + l.cantidad, 0)
  const total = lineas.reduce((acc, l) => acc + l.precio * l.cantidad, 0)

  // Cada acción guarda el nuevo estado en el carrito de la cuenta. Si Firestore
  // rechaza el cambio, se conserva el error en pantalla y se registra en consola.
  async function cambiar(id, formato, nuevaCantidad, maximo, tipo) {
    try {
      await cambiarCantidad(id, formato, nuevaCantidad, maximo, tipo)
    } catch (error) {
      console.error('No se pudo actualizar el carrito:', error)
      setMensaje('No se pudo actualizar el carrito. Revisá tu conexión e intentá otra vez.')
    }
  }

  async function quitar(id, formato, tipo) {
    try {
      await quitarDelCarrito(id, formato, tipo)
    } catch (error) {
      console.error('No se pudo quitar el artículo del carrito:', error)
      setMensaje('No se pudo quitar el artículo. Intentá nuevamente.')
    }
  }

  async function vaciar() {
    setMensaje('')
    try {
      await vaciarCarrito()
    } catch (error) {
      console.error('No se pudo vaciar el carrito:', error)
      setMensaje('No se pudo vaciar el carrito. Intentá nuevamente.')
    }
  }

  function finalizar() {
    // El sitio todavía no procesa pagos; se informa el estado en vez de simular una compra.
    setMensaje(
      'Esta versión todavía no procesa pagos: el próximo paso es conectar un medio de pago.'
    )
  }

  // Se espera a que estén listos sesión, carrito y catálogos para poder calcular
  // correctamente nombre, precio, variante y stock de cada línea.
  if (cargandoSesion || cargandoCarrito || cargandoProductos || cargandoMerch) return <div className="pagina-carrito"><div className="carrito-contenedor"><h1 className="carrito-titulo">Tu carrito</h1><p>Cargando...</p></div></div>

  // Las compras y el carrito son personales, por eso se requiere iniciar sesión.
  if (!cuenta) return <div className="pagina-carrito"><div className="carrito-contenedor"><h1 className="carrito-titulo">Tu carrito</h1><p>Iniciá sesión para agregar productos y consultar tu carrito.</p><Link to="/Perfil" className="carrito-btn">Iniciar sesión</Link></div></div>

  return (
    <div className="pagina-carrito">
      <div className="carrito-contenedor">
        <h1 className="carrito-titulo">Tu carrito</h1>
        {errorCarrito && <p className="carrito-mensaje" role="alert">{errorCarrito}</p>}

        {lineas.length === 0 ? (
          <div className="carrito-vacio">
            <p>Tu carrito está vacío.</p>
            <Link to="/Productos" className="carrito-btn">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="carrito-layout">

            {/* Cada fila ofrece controles de cantidad, subtotal y eliminación individual. */}
            <ul className="carrito-lista">
              {lineas.map(({ producto, formato, cantidad, precio, maximo, tipo }) => (
                <li key={`${tipo}-${producto.id}-${formato}`} className="carrito-item">
                  <Link to={tipo === 'merch' ? '/Productos#merch' : `/Productos/${producto.id}`} className="carrito-img">
                    {producto.imagen && <img src={producto.imagen} alt="" />}
                  </Link>

                  <div className="carrito-datos">
                    <Link to={tipo === 'merch' ? '/Productos#merch' : `/Productos/${producto.id}`} className="carrito-nombre">
                      {producto.nombre}
                    </Link>
                    {producto.artista && tipo !== 'merch' && (
                      <span className="carrito-artista">{producto.artista}</span>
                    )}
                    <span className="carrito-formato">{formato}</span>
                    <span className="carrito-unitario">{formatearPrecio(precio)} c/u</span>
                  </div>

                  <div className="carrito-controles">
                    <div className="carrito-cantidad" role="group" aria-label="Cantidad">
                      <button
                        type="button"
                        aria-label="Restar una unidad"
                        disabled={cantidad <= 1}
                        onClick={() => cambiar(producto.id, formato, cantidad - 1, maximo, tipo)}
                      >
                        −
                      </button>
                      <span>{cantidad}</span>
                      <button
                        type="button"
                        aria-label="Sumar una unidad"
                        title={cantidad >= maximo ? `Máximo ${maximo} por producto` : undefined}
                        disabled={cantidad >= maximo}
                        onClick={() => cambiar(producto.id, formato, cantidad + 1, maximo, tipo)}
                      >
                        +
                      </button>
                    </div>

                    <span className="carrito-subtotal">
                      {formatearPrecio(precio * cantidad)}
                    </span>

                    <button
                      type="button"
                      className="carrito-quitar"
                      aria-label={`Quitar ${producto.nombre} del carrito`}
                      onClick={() => quitar(producto.id, formato, tipo)}
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* El resumen calcula el total desde las líneas ya unidas con sus precios actuales. */}
            <aside className="carrito-resumen">
              <h2>Resumen</h2>
              <dl>
                <div className="carrito-fila">
                  <dt>Productos ({unidades})</dt>
                  <dd>{formatearPrecio(total)}</dd>
                </div>
                <div className="carrito-fila">
                  <dt>Envío</dt>
                  <dd>A calcular</dd>
                </div>
                <div className="carrito-fila carrito-fila-total">
                  <dt>Total</dt>
                  <dd>{formatearPrecio(total)}</dd>
                </div>
              </dl>

              <button type="button" className="carrito-btn" onClick={finalizar}>
                Finalizar compra
              </button>
              <button type="button" className="carrito-btn-texto" onClick={vaciar}>
                Vaciar carrito
              </button>

              <p className="carrito-mensaje" role="status">{mensaje}</p>

              <Link to="/Productos" className="carrito-seguir">
                ← Seguir comprando
              </Link>
            </aside>

          </div>
        )}
      </div>
    </div>
  )
}

export default Carrito