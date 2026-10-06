import { Link, NavLink } from 'react-router-dom'
import { useState, useMemo } from 'react'
import '../estilos/productos.css'
import producto1 from'../assets/ProducutosImgs/IN RAINBOWS.jpg'

// Editá esta lista para agregar, sacar o cambiar productos.
// "categoria" se usa para el filtro de la izquierda.
const productos = [
  { id: 1, nombre: 'Producto 1', precio: 100000, categoria: 'Internacional', imagen: producto1 },
  { id: 2, nombre: 'Producto 2', precio: 235000, categoria: 'Internacional', imagen: producto1 },
  { id: 3, nombre: 'Producto 3', precio: 150000, categoria: 'Nacional', imagen: producto1 },
  { id: 4, nombre: 'Producto 4', precio: 115000, categoria: 'Nacional', imagen: producto1 },
  { id: 5, nombre: 'Producto 5', precio: 98000, categoria: 'Jazz / Blues', imagen: producto1 },
  { id: 6, nombre: 'Producto 6', precio: 142500, categoria: 'Jazz / Blues', imagen: producto1 },
  { id: 7, nombre: 'Producto 7', precio: 76000, categoria: 'Soundtrack / OST', imagen: producto1 },
  { id: 8, nombre: 'Producto 8', precio: 189000, categoria: 'Soundtrack / OST', imagen: producto1 },
]

// Lista de categorías únicas, calculada a partir del array de arriba.
// Si agregás un producto con una categoría nueva, aparece sola en el filtro.
const categorias = [...new Set(productos.map((p) => p.categoria))]

function formatearPrecio(numero) {
  return numero.toLocaleString('es-AR')
}

function Productos() {
  const [categoriaActiva, setCategoriaActiva] = useState(null) // null = "todas"
  const [precioDesde, setPrecioDesde] = useState('')
  const [precioHasta, setPrecioHasta] = useState('')
  const [orden, setOrden] = useState('relevancia')

  // Se recalcula solo cuando cambia algún filtro, no en cada render.
  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter((producto) => {
      const pasaCategoria = !categoriaActiva || producto.categoria === categoriaActiva
      const pasaDesde = precioDesde === '' || producto.precio >= Number(precioDesde)
      const pasaHasta = precioHasta === '' || producto.precio <= Number(precioHasta)
      return pasaCategoria && pasaDesde && pasaHasta
    })

    if (orden === 'menor-precio') {
      resultado = [...resultado].sort((a, b) => a.precio - b.precio)
    } else if (orden === 'mayor-precio') {
      resultado = [...resultado].sort((a, b) => b.precio - a.precio)
    }

    return resultado
  }, [categoriaActiva, precioDesde, precioHasta, orden])

  return (
    <div className="pagina-productos">

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link to="/">Inicio</Link>
        <span> &gt; </span>
        <span>Productos</span>
      </div>

      <div className="layout-productos">

        {/* SIDEBAR DE FILTROS */}
        <aside className="sidebar-filtros">
          <h2 className="sidebar-titulo">Productos</h2>

          <ul className="lista-categorias">
            <li>
              <button
                className={categoriaActiva === null ? 'cat-link activo' : 'cat-link'}
                onClick={() => setCategoriaActiva(null)}
              >
                Todas
              </button>
            </li>
            {categorias.map((categoria) => (
              <li key={categoria}>
                <button
                  className={categoriaActiva === categoria ? 'cat-link activo' : 'cat-link'}
                  onClick={() => setCategoriaActiva(categoria)}
                >
                  {categoria}
                </button>
              </li>
            ))}
          </ul>

          <h3 className="filtro-subtitulo">Filtrar por</h3>

          <div className="filtro-precio">
            <span className="filtro-label">Precio</span>
            <div className="precio-inputs">
              <div className="precio-campo">
                <label htmlFor="precio-desde">Desde</label>
                <input
                  id="precio-desde"
                  type="number"
                  placeholder="0"
                  value={precioDesde}
                  onChange={(e) => setPrecioDesde(e.target.value)}
                />
              </div>
              <div className="precio-campo">
                <label htmlFor="precio-hasta">Hasta</label>
                <input
                  id="precio-hasta"
                  type="number"
                  placeholder="690000"
                  value={precioHasta}
                  onChange={(e) => setPrecioHasta(e.target.value)}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENIDO: orden + grilla */}
        <div className="contenido-productos">
          <div className="barra-orden">
            <select
              className="select-orden"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="menor-precio">Menor precio</option>
              <option value="mayor-precio">Mayor precio</option>
            </select>
          </div>

          <div className="grilla">
            {productosFiltrados.map((producto) => (
              <article className="card" key={producto.id}>
                <button className="btn-wishlist" title="Agregar a la wishlist">♡</button>

                <div className="card-img">
                  {producto.imagen && (
                    <img src={producto.imagen} alt={producto.nombre} />
                  )}
                </div>

                <h3 className="card-titulo">{producto.nombre}</h3>
                <p className="card-precio">${formatearPrecio(producto.precio)},00</p>

                <div className="card-acciones">
                  <button className="btn-comprar">Comprar</button>
                  <button className="btn-carrito">Carrito</button>
                </div>
              </article>
            ))}

            {productosFiltrados.length === 0 && (
              <p className="sin-resultados">No hay productos con esos filtros.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Productos