import { crearCuentaStore } from './cuentaStore'

const CLAVE = 'wishlist-deejs'
const wishlistStore = crearCuentaStore({
  claveLocal: CLAVE,
  documento: 'wishlist',
  normalizar: (ids) => Array.isArray(ids) ? [...new Set(ids)] : [],
})

// Si el producto está en la wishlist lo saca; si no está, lo agrega
export async function alternarWishlist(id) {
  await wishlistStore.modificar((ids) =>
    ids.some((valor) => String(valor) === String(id))
      ? ids.filter((valor) => String(valor) !== String(id))
      : [...ids, id]
  )
}

// Hook para usar en cualquier componente: se vuelve a dibujar solo cuando cambia la wishlist
export function useWishlist() {
  const estado = wishlistStore.useStore()
  const ids = estado.items

  return {
    ids,
    cargando: estado.cargando,
    error: estado.error,
    estaEnWishlist: (id) => ids.some((x) => String(x) === String(id)),
    alternar: alternarWishlist,
  }
}