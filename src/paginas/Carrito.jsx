import { useState } from 'react'
import { Link } from 'react-router-dom'
import { productos } from '../data/Productos'
import {
  leerCarrito,
  cambiarCantidad,
  quitarDelCarrito,
  vaciarCarrito,
} from '../data/carrito'
import '../estilos/Carrito.css'

function formatearPrecio(numero) {
  return `$${numero.toLocaleString('es-AR')},00`
}

function Carrito() {
  // Se lee de localStorage al abrir; después el estado se actualiza con cada cambio
  const [items, setItems] = useState(leerCarrito)
  const [mensaje, setMensaje] = useState('')

  // Une cada ítem guardado (id + formato + cantidad) con los datos del producto
  const lineas = items
    .map((item) => {
      const producto = productos.find((p) => p.id === item.id)
      if (!producto) return null
      const infoFormato = producto.formatos?.find((f) => f.nombre === item.formato)
      const precio = infoFormato ? infoFormato.precio : producto.precio
      return { ...item, producto, precio }
    })
    .filter(Boolean)

  const unidades = lineas.reduce((acc, l) => acc + l.cantidad, 0)
  const total = lineas.reduce((acc, l) => acc + l.precio * l.cantidad, 0)

  function cambiar(id, formato, nuevaCantidad) {
    setItems(cambiarCantidad(id, formato, nuevaCantidad))
  }

  function quitar(id, formato) {
    setItems(quitarDelCarrito(id, formato))
  }

  function vaciar() {
    setItems(vaciarCarrito())
    setMensaje('')
  }

  function finalizar() {
    setMensaje(
      'Esta versión todavía no procesa pagos: el próximo paso es conectar un medio de pago.'
    )
  }

  return (
    <div className="pagina-carrito">
      <div className="carrito-contenedor">
        <h1 className="carrito-titulo">Tu carrito</h1>

        {lineas.length === 0 ? (
          <div className="carrito-vacio">
            <p>Tu carrito está vacío.</p>
            <Link to="/Productos" className="carrito-btn">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="carrito-layout">

            <ul className="carrito-lista">
              {lineas.map(({ producto, formato, cantidad, precio }) => (
                <li key={`${producto.id}-${formato}`} className="carrito-item">
                  <Link to={`/Productos/${producto.id}`} className="carrito-img">
                    {producto.imagen && <img src={producto.imagen} alt="" />}
                  </Link>

                  <div className="carrito-datos">
                    <Link to={`/Productos/${producto.id}`} className="carrito-nombre">
                      {producto.nombre}
                    </Link>
                    {producto.artista && (
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
                        onClick={() => cambiar(producto.id, formato, cantidad - 1)}
                      >
                        −
                      </button>
                      <span>{cantidad}</span>
                      <button
                        type="button"
                        aria-label="Sumar una unidad"
                        disabled={cantidad >= 99}
                        onClick={() => cambiar(producto.id, formato, cantidad + 1)}
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
                      onClick={() => quitar(producto.id, formato)}
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

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
