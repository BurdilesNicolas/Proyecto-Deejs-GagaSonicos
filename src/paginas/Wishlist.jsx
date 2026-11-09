import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../data/Wishlist'
import { suscribirProductos } from '../services/productosService'
import { useUsuarioActual } from '../utils/sesion'
import '../estilos/Wishlist.css'

function formatearPrecio(numero) {
  return `$${Number(numero || 0).toLocaleString('es-AR')},00`
}

function Wishlist() {
  const { ids, alternar, cargando: cargandoWishlist, error: errorWishlist } = useWishlist()
  const { cuenta, cargando: cargandoSesion } = useUsuarioActual()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => suscribirProductos((datos) => { setProductos(datos); setCargando(false) }, (error) => {
    console.error('Error al cargar wishlist:', error)
    setCargando(false)
  }), [])

  const favoritos = ids.map((id) => productos.find((p) => String(p.id) === String(id))).filter(Boolean)

  if (cargandoSesion || cargandoWishlist || cargando) return <div className="pagina-wishlist"><div className="wishlist-contenedor"><h1 className="wishlist-titulo">Tu wishlist</h1><p>Cargando...</p></div></div>

  if (!cuenta) return <div className="pagina-wishlist"><div className="wishlist-contenedor"><h1 className="wishlist-titulo">Tu wishlist</h1><p>Iniciá sesión para guardar y consultar tus favoritos.</p><Link to="/Perfil" className="wishlist-btn">Iniciar sesión</Link></div></div>

  return (
    <div className="pagina-wishlist"><div className="wishlist-contenedor">
      <h1 className="wishlist-titulo">Tu wishlist</h1>
      {errorWishlist && <p role="alert">{errorWishlist}</p>}
      <p className="wishlist-sub">{favoritos.length === 1 ? '1 disco guardado' : `${favoritos.length} discos guardados`}</p>
      {favoritos.length === 0 ? <div className="wishlist-vacio"><p>Todavía no guardaste ningún disco.</p><Link to="/Productos" className="wishlist-btn">Ver productos</Link></div> :
        <ul className="wishlist-grilla">{favoritos.map((p) => <li key={p.id} className="wishlist-card">
          <Link to={`/Productos/${p.id}`} className="wishlist-img">{p.imagen && <img src={p.imagen} alt="" />}</Link>
          <Link to={`/Productos/${p.id}`} className="wishlist-nombre">{p.nombre}</Link>
          {p.artista && <span className="wishlist-artista">{p.artista}</span>}
          <span className="wishlist-precio">{formatearPrecio(p.precio)}</span>
          <div className="wishlist-acciones"><Link to={`/Productos/${p.id}`} className="wishlist-btn">Ver disco</Link>
            <button type="button" className="wishlist-quitar" aria-label={`Quitar ${p.nombre} de la wishlist`} onClick={() => alternar(p.id).catch((error) => console.error('No se pudo actualizar la wishlist:', error))}>Quitar</button></div>
        </li>)}</ul>}
    </div></div>
  )
}
export default Wishlist
