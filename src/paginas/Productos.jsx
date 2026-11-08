import { Link, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import '../estilos/Productos.css'
import { useSearchParams } from 'react-router-dom'
import { normalizar } from '../data/Productos.js'
import { useWishlist } from '../data/Wishlist'
import { suscribirProductos } from '../services/productosService'
import { agregarAlCarrito, LIMITE_POR_PRODUCTO } from '../data/Carrito'
import { useUsuarioActual } from '../utils/sesion'

function formatearPrecio(numero) {
  return Number(numero || 0).toLocaleString('es-AR')
}

function Productos() {
  const { estaEnWishlist, alternar } = useWishlist()
  const { cuenta, cargando: cargandoSesion } = useUsuarioActual()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const busqueda = searchParams.get('buscar') || ''

  // Los productos ahora se obtienen de Firestore y se actualizan en tiempo real.
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [precioDesde, setPrecioDesde] = useState('')
  const [precioHasta, setPrecioHasta] = useState('')
  const [orden, setOrden] = useState('relevancia')

  useEffect(() => {
    const cancelar = suscribirProductos(
      (datos) => {
        setProductos(datos)
        setCargando(false)
        setError('')
      },
      (err) => {
        console.error('Error al cargar el catálogo:', err)
        setError('No se pudieron cargar los productos. Revisá la conexión con Firestore.')
        setCargando(false)
      }
    )

    return cancelar
  }, [])

  // Las categorías se generan a partir de los productos que llegan de Firestore.
  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoria).filter(Boolean))].sort(),
    [productos]
  )

  function exigirSesion() {
    if (cargandoSesion) return false
    if (!cuenta) {
      navigate('/Perfil')
      return false
    }
    return true
  }

  function agregarFavorito(id) {
    if (exigirSesion()) alternar(id)
  }

  function agregarCarrito(producto) {
    if (!exigirSesion()) return
    const formato = Array.isArray(producto.formatos)
      ? producto.formatos.find((f) => Number(f.stock) > 0)
      : null
    if (Array.isArray(producto.formatos) && !formato) return
    agregarAlCarrito({
      id: producto.id,
      formato: formato?.nombre || producto.formato || 'Edición estándar',
      cantidad: 1,
      maximo: Math.min(LIMITE_POR_PRODUCTO, Number(formato?.stock) || LIMITE_POR_PRODUCTO),
    })
    navigate('/Carrito')
  }

  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter((producto) => {
      const pasaCategoria = !categoriaActiva || producto.categoria === categoriaActiva
      const pasaDesde = precioDesde === '' || Number(producto.precio) >= Number(precioDesde)
      const pasaHasta = precioHasta === '' || Number(producto.precio) <= Number(precioHasta)
      const pasaBusqueda =
        busqueda === '' ||
        normalizar(`${producto.nombre || ''} ${producto.artista || ''}`).includes(normalizar(busqueda))

      return pasaCategoria && pasaDesde && pasaHasta && pasaBusqueda
    })

    if (orden === 'menor-precio') {
      resultado = [...resultado].sort((a, b) => Number(a.precio) - Number(b.precio))
    } else if (orden === 'mayor-precio') {
      resultado = [...resultado].sort((a, b) => Number(b.precio) - Number(a.precio))
    }

    return resultado
  }, [productos, categoriaActiva, precioDesde, precioHasta, orden, busqueda])

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
                  step={1000}
                  min={0}
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
                  step={1000}
                  min={0}
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
              <option value="relevancia">Relevancia</option>
              <option value="menor-precio">Menor precio</option>
              <option value="mayor-precio">Mayor precio</option>
            </select>
          </div>

          {cargando && <p className="sin-resultados">Cargando productos...</p>}
          {error && <p className="sin-resultados">{error}</p>}

          {!cargando && !error && (
            <div className="grilla">
              {productosFiltrados.map((producto) => (
                <article className="card" key={producto.id}>
                  <button
                    className={estaEnWishlist(producto.id) ? 'btn-wishlist activo' : 'btn-wishlist'}
                    aria-pressed={estaEnWishlist(producto.id)}
                    aria-label={estaEnWishlist(producto.id) ? 'Quitar de la wishlist' : 'Agregar a la wishlist'}
                    onClick={() => agregarFavorito(producto.id)}
                  >
                    {estaEnWishlist(producto.id) ? '♥' : '♡'}
                  </button>
                  <Link to={`/Productos/${producto.id}`} className="card-link">
                    <div className="card-img">
                      {producto.imagen && <img src={producto.imagen} alt={producto.nombre} />}
                    </div>
                    <h3 className="card-titulo">{producto.nombre}</h3>
                    <h3 className="card-artista">{producto.artista}</h3>
                    <p className="card-precio">${formatearPrecio(producto.precio)},00</p>
                  </Link>
                  <div className="card-acciones">
                    <button className="btn-comprar" onClick={() => { if (exigirSesion()) navigate(`/Productos/${producto.id}`) }}>Comprar</button>
                    <button className="btn-carrito" onClick={() => agregarCarrito(producto)}>Carrito</button>
                  </div>
                </article>
              ))}

              {productosFiltrados.length === 0 && (
                <p className="sin-resultados">No hay productos con esos filtros.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Productos
