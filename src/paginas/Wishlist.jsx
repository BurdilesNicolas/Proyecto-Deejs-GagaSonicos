import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../data/Wishlist'
import { suscribirProductos } from '../services/productosService'
import { suscribirMerch } from '../services/merchService'
import { useUsuarioActual } from '../utils/sesion'
import '../estilos/Wishlist.css'

function formatearPrecio(numero) {
  // Centraliza el formato monetario para que todos los artículos se presenten
  // de la misma manera, incluso cuando el precio todavía no está cargado.
  return `$${Number(numero || 0).toLocaleString('es-AR')},00`
}

function Wishlist() {
  // La lista personal conserva solo referencias (ID y catálogo de origen).
  // Se consulta por separado la sesión, porque la wishlist del usuario
  // autenticado se sincroniza con su cuenta y no se comparte con otros usuarios.
  const { favoritos: guardados, alternar, cargando: cargandoWishlist, error: errorWishlist } = useWishlist()
  const { cuenta, cargando: cargandoSesion } = useUsuarioActual()

  // Los detalles comerciales no se duplican en la wishlist: estos estados
  // reciben los catálogos actuales para mostrar nombre, imagen y precio vigentes.
  const [productos, setProductos] = useState([])
  const [merch, setMerch] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [cargandoMerch, setCargandoMerch] = useState(true)

  // Se escuchan ambos catálogos en tiempo real para resolver tanto discos como
  // merch. Cada suscripción devuelve una función de cancelación, que se ejecuta
  // al abandonar la pantalla para no dejar listeners activos innecesariamente.
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

  // Convierte las referencias guardadas en los artículos que puede renderizar
  // la pantalla. El tipo decide qué catálogo consultar; String permite comparar
  // IDs aunque uno llegue como número y el otro como texto.
  // Si el artículo ya no está publicado, se omite de la vista sin alterar la
  // lista guardada del usuario.
  const favoritos = guardados.map(({ id, tipo }) => {
    const catalogo = tipo === 'merch' ? merch : productos
    const articulo = catalogo.find((item) => String(item.id) === String(id))
    return articulo ? { ...articulo, tipo } : null
  }).filter(Boolean)

  // Se espera a que terminen las cuatro cargas: sesión, wishlist, discos y merch.
  // De este modo, el contador no muestra un resultado parcial mientras uno de
  // los catálogos todavía se está descargando.
  if (cargandoSesion || cargandoWishlist || cargandoProductos || cargandoMerch) return <div className="pagina-wishlist"><div className="wishlist-contenedor"><h1 className="wishlist-titulo">Tu wishlist</h1><p>Cargando...</p></div></div>

  // La lista es personal. Si no hay sesión, se invita a iniciar sesión antes
  // de mostrar o modificar los favoritos asociados a una cuenta.
  if (!cuenta) return <div className="pagina-wishlist"><div className="wishlist-contenedor"><h1 className="wishlist-titulo">Tu wishlist</h1><p>Iniciá sesión para guardar y consultar tus favoritos.</p><Link to="/Perfil" className="wishlist-btn">Iniciar sesión</Link></div></div>

  return (
    <div className="pagina-wishlist"><div className="wishlist-contenedor">
      <h1 className="wishlist-titulo">Tu wishlist</h1>
      {/* El store conserva y expone el error para que un fallo de Firestore
          no parezca una lista vacía ni quede oculto al usuario. */}
      {errorWishlist && <p role="alert">{errorWishlist}</p>}
      <p className="wishlist-sub">{favoritos.length === 1 ? '1 artículo guardado' : `${favoritos.length} artículos guardados`}</p>
      {/* En el estado vacío hay un acceso al catálogo. Si existen favoritos,
          cada tarjeta enlaza al detalle correspondiente según su tipo. */}
      {favoritos.length === 0 ? <div className="wishlist-vacio"><p>Todavía no guardaste ningún artículo.</p><Link to="/Productos" className="wishlist-btn">Ver catálogo</Link></div> :
        <ul className="wishlist-grilla">{favoritos.map((p) => {
          // Los discos y el merch tienen rutas de detalle distintas.
          const ruta = p.tipo === 'merch' ? `/Merch/${p.id}` : `/Productos/${p.id}`
          return <li key={`${p.tipo}-${p.id}`} className="wishlist-card">
          {/* La combinación de tipo e ID evita claves duplicadas si dos
              catálogos contienen un artículo con el mismo identificador. */}
          <Link to={ruta} className="wishlist-img">{p.imagen && <img src={p.imagen} alt="" />}</Link>
          <Link to={ruta} className="wishlist-nombre">{p.nombre}</Link>
          {/* Los metadatos dependen del catálogo: los discos tienen artista,
              mientras que el merch se identifica por su categoría. */}
          {p.tipo === 'merch'
            ? <span className="wishlist-artista">Merch oficial · {p.categoria}</span>
            : p.artista && <span className="wishlist-artista">{p.artista}</span>}
          <span className="wishlist-precio">{formatearPrecio(p.precio)}</span>
          {/* Se puede abrir el artículo o quitarlo de favoritos. El error de
              escritura se registra para facilitar el diagnóstico. */}
          <div className="wishlist-acciones"><Link to={ruta} className="wishlist-btn">{p.tipo === 'merch' ? 'Ver artículo' : 'Ver disco'}</Link>
            <button type="button" className="wishlist-quitar" aria-label={`Quitar ${p.nombre} de la wishlist`} onClick={() => alternar(p.id, p.tipo).catch((error) => console.error('No se pudo actualizar la wishlist:', error))}>Quitar</button></div>
        </li>
        })}</ul>}
    </div></div>
  )
}
export default Wishlist
