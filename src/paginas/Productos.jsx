import { Link, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import '../estilos/Productos.css'
import { useSearchParams } from 'react-router-dom'
import { normalizar } from '../data/Productos.js'
import { useWishlist } from '../data/Wishlist'
import { suscribirProductos } from '../services/productosService'
import { agregarAlCarrito, LIMITE_POR_PRODUCTO } from '../data/Carrito'
import { useUsuarioActual } from '../utils/sesion'
import SeccionMerch from '../componentes/SeccionMerch'
import ArtistasCatalogo from '../componentes/ArtistasCatalogo'

function formatearPrecio(numero) {
  return Number(numero || 0).toLocaleString('es-AR')
}

const PRODUCTOS_INICIALES = 8

function Productos() {
  // Los favoritos se reflejan desde el store de la cuenta; sesión se usa para
  // dirigir al acceso de Perfil cuando alguien intenta guardar o comprar sin entrar.
  const { estaEnWishlist, alternar, error: errorWishlist } = useWishlist()
  const { cuenta, cargando: cargandoSesion } = useUsuarioActual()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const busqueda = searchParams.get('buscar') || ''

  // Guarda el catálogo recibido, el estado de carga y el error de conexión con Firestore.
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [precioDesde, setPrecioDesde] = useState('')
  const [precioHasta, setPrecioHasta] = useState('')
  const [orden, setOrden] = useState('relevancia')
  const [mostrarMasPara, setMostrarMasPara] = useState('')

  // Se suscribe al catálogo al montar la página; la limpieza detiene las actualizaciones
  // al navegar a otra ruta y los cambios de Administración aparecen en vivo.
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

  // Las categorías salen del propio catálogo, así el filtro coincide con los datos publicados.
  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoria).filter(Boolean))].sort(),
    [productos]
  )

  // Comprueba la sesión antes de cualquier acción personal y deriva a Perfil si falta.
  function exigirSesion() {
    if (cargandoSesion) return false
    if (!cuenta) {
      navigate('/Perfil')
      return false
    }
    return true
  }

  async function agregarFavorito(id) {
    if (!exigirSesion()) return
    try {
      await alternar(id)
    } catch (error) {
      console.error('No se pudo actualizar la wishlist:', error)
    }
  }

  async function agregarCarrito(producto) {
    if (!exigirSesion()) return
    const formato = Array.isArray(producto.formatos)
      ? producto.formatos.find((f) => Number(f.stock) > 0)
      : null
    if (Array.isArray(producto.formatos) && !formato) return
    try {
      await agregarAlCarrito({
        id: producto.id,
        formato: formato?.nombre || producto.formato || 'Edición estándar',
        cantidad: 1,
        maximo: Math.min(LIMITE_POR_PRODUCTO, Number(formato?.stock) || LIMITE_POR_PRODUCTO),
      })
      navigate('/Carrito')
    } catch (error) {
      console.error('No se pudo agregar el producto al carrito:', error)
    }
  }

  // Primero aplica categoría, rango de precios y búsqueda; después ordena el resultado
  // por precio cuando el usuario elige menor o mayor precio.
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
  const claveFiltros = JSON.stringify([categoriaActiva, precioDesde, precioHasta, orden, busqueda])
  const mostrarTodos = mostrarMasPara === claveFiltros
  const productosVisibles = mostrarTodos
    ? productosFiltrados
    : productosFiltrados.slice(0, PRODUCTOS_INICIALES)

  // La página combina filtros, ordenamiento, tarjetas de discos y un acceso directo
  // a merch para evitar que el visitante tenga que recorrer todo el catálogo.
  return (
    <div className="pagina-productos">
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link to="/">Inicio</Link>
        <span> &gt; </span>
        <span>Productos</span>
      </div>

      {/* Este ancla salta directamente a la sección de merch al final del catálogo. */}
      <div className="acceso-merch">
        <a className="boton-acceso-merch" href="#merch">
          <i className="bi bi-bag" aria-hidden="true"></i>
          Ver merch oficial
          <i className="bi bi-arrow-down" aria-hidden="true"></i>
        </a>
      </div>
      {errorWishlist && <p className="sin-resultados" role="alert">{errorWishlist}</p>}

      <div className="layout-productos">
        {/* El panel lateral cambia categoría y rango de precios del catálogo musical. */}
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
          <ArtistasCatalogo
            productos={productos}
            cargandoCatalogo={cargando}
            errorCatalogo={Boolean(error)}
          />
        </aside>

        {/* El contenido principal muestra el orden elegido y las tarjetas coincidentes. */}
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
              {productosVisibles.map((producto) => (
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
          {!cargando && !error && productosFiltrados.length > PRODUCTOS_INICIALES && (
            <button
              type="button"
              className="productos-ver-mas"
              aria-expanded={mostrarTodos}
              onClick={() => setMostrarMasPara(mostrarTodos ? '' : claveFiltros)}
            >
              {mostrarTodos ? 'Ver menos' : `Ver más (${productosFiltrados.length - PRODUCTOS_INICIALES})`}
              <i className={`bi ${mostrarTodos ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true"></i>
            </button>
          )}
        </div>
      </div>
      {/* Merch es un catálogo independiente, pero comparte la consulta del buscador global. */}
      <SeccionMerch busqueda={busqueda} />
    </div>
  )
}

export default Productos
