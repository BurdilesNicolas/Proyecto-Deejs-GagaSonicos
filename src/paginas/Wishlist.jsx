import { Link } from 'react-router-dom'
import { productos } from '../data/Productos'
import { useWishlist } from '../data/Wishlist'
import '../estilos/Wishlist.css'

function formatearPrecio(numero) {
  return `$${numero.toLocaleString('es-AR')},00`
}

function Wishlist() {
  const { ids, alternar } = useWishlist()

  // En el orden en que se fueron guardando; ignora IDs que ya no existan en el catálogo
  const favoritos = ids
    .map((id) => productos.find((p) => p.id === id))
    .filter(Boolean)

  return (
    <div className="pagina-wishlist">
      <div className="wishlist-contenedor">
        <h1 className="wishlist-titulo">Tu wishlist</h1>
        <p className="wishlist-sub">
          {favoritos.length === 1 ? '1 disco guardado' : `${favoritos.length} discos guardados`}
        </p>

        {favoritos.length === 0 ? (
          <div className="wishlist-vacio">
            <p>Todavía no guardaste ningún disco.</p>
            <Link to="/Productos" className="wishlist-btn">
              Ver productos
            </Link>
          </div>
        ) : (
          <ul className="wishlist-grilla">
            {favoritos.map((p) => (
              <li key={p.id} className="wishlist-card">
                <Link to={`/Productos/${p.id}`} className="wishlist-img">
                  {p.imagen && <img src={p.imagen} alt="" />}
                </Link>

                <Link to={`/Productos/${p.id}`} className="wishlist-nombre">
                  {p.nombre}
                </Link>
                {p.artista && <span className="wishlist-artista">{p.artista}</span>}
                <span className="wishlist-precio">{formatearPrecio(p.precio)}</span>

                <div className="wishlist-acciones">
                  <Link to={`/Productos/${p.id}`} className="wishlist-btn">
                    Ver disco
                  </Link>
                  <button
                    type="button"
                    className="wishlist-quitar"
                    aria-label={`Quitar ${p.nombre} de la wishlist`}
                    onClick={() => alternar(p.id)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Wishlist