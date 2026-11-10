import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../data/Wishlist'
import { suscribirProductos } from '../services/productosService'
import { suscribirMerch } from '../services/merchService'
import { useUsuarioActual } from '../utils/sesion'
import '../estilos/Wishlist.css'

function formatearPrecio(numero) {
  return `$${Number(numero || 0).toLocaleString('es-AR')},00`
}

function Wishlist() {
  // La cuenta conserva IDs y tipo de catálogo; los catálogos aportan la información
  // vigente para mostrar favoritos tanto de discos como de merch.
  const { favoritos: guardados, alternar, cargando: cargandoWishlist, error: errorWishlist } = useWishlist()
  const { cuenta, cargando: cargandoSesion } = useUsuarioActual()
  const [productos, setProductos] = useState([])
  const [merch, setMerch] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [cargandoMerch, setCargandoMerch] = useState(true)

  // Las suscripciones resuelven los favoritos contra ambos catálogos y se cancelan
  // al salir de la pantalla para evitar actualizaciones fuera de la vista.
  useEffect(() => {
    const cancelarProductos = suscribirProductos((datos) => {
      setProductos(datos)
      setCargandoProductos(false)
    }, (error) => {
      console.error('Error al cargar productos de la wishlist:', error)
      setCargandoProductos(false)
    })
    const cancelarMerch = suscribirMerch((datos) => {
      setMerch(datos)
      setCargandoMerch(false)
    }, (error) => {
      console.error('Error al cargar merch de la wishlist:', error)
      setCargandoMerch(false)
    })
    return () => {
      cancelarProductos()
      cancelarMerch()
    }
  }, [])

  const favoritos = guardados.map(({ id, tipo }) => {
    const catalogo = tipo === 'merch' ? merch : productos
    const articulo = catalogo.find((item) => String(item.id) === String(id))
    return articulo ? { ...articulo, tipo } : null
  }).filter(Boolean)

  // Se espera tanto la sesión como la wishlist y el catálogo antes de mostrar resultados.
  if (cargandoSesion || cargandoWishlist || cargandoProductos || cargandoMerch) return <div className="pagina-wishlist"><div className="wishlist-contenedor"><h1 className="wishlist-titulo">Tu wishlist</h1><p>Cargando...</p></div></div>

  // Sin sesión no se consulta ni se presenta una lista personal de favoritos.
  if (!cuenta) return <div className="pagina-wishlist"><div className="wishlist-contenedor"><h1 className="wishlist-titulo">Tu wishlist</h1><p>Iniciá sesión para guardar y consultar tus favoritos.</p><Link to="/Perfil" className="wishlist-btn">Iniciar sesión</Link></div></div>

  return (
    <div className="pagina-wishlist"><div className="wishlist-contenedor">
      <h1 className="wishlist-titulo">Tu wishlist</h1>
      {errorWishlist && <p role="alert">{errorWishlist}</p>}
      <p className="wishlist-sub">{favoritos.length === 1 ? '1 artículo guardado' : `${favoritos.length} artículos guardados`}</p>
      {/* Los discos y el merch enlazan a su propia ficha de detalle. */}
      {favoritos.length === 0 ? <div className="wishlist-vacio"><p>Todavía no guardaste ningún artículo.</p><Link to="/Productos" className="wishlist-btn">Ver catálogo</Link></div> :
        <ul className="wishlist-grilla">{favoritos.map((p) => {
          const ruta = p.tipo === 'merch' ? `/Merch/${p.id}` : `/Productos/${p.id}`
          return <li key={`${p.tipo}-${p.id}`} className="wishlist-card">
          <Link to={ruta} className="wishlist-img">{p.imagen && <img src={p.imagen} alt="" />}</Link>
          <Link to={ruta} className="wishlist-nombre">{p.nombre}</Link>
          {p.tipo === 'merch'
            ? <span className="wishlist-artista">Merch oficial · {p.categoria}</span>
            : p.artista && <span className="wishlist-artista">{p.artista}</span>}
          <span className="wishlist-precio">{formatearPrecio(p.precio)}</span>
          <div className="wishlist-acciones"><Link to={ruta} className="wishlist-btn">{p.tipo === 'merch' ? 'Ver artículo' : 'Ver disco'}</Link>
            <button type="button" className="wishlist-quitar" aria-label={`Quitar ${p.nombre} de la wishlist`} onClick={() => alternar(p.id, p.tipo).catch((error) => console.error('No se pudo actualizar la wishlist:', error))}>Quitar</button></div>
        </li>
        })}</ul>}
    </div></div>
  )
}
export default Wishlist
