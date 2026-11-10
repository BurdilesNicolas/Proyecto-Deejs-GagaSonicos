import { crearCuentaStore } from './cuentaStore'

const CLAVE = 'wishlist-deejs'
const wishlistStore = crearCuentaStore({
  claveLocal: CLAVE,
  documento: 'wishlist',
  normalizar: (favoritos) => {
    if (!Array.isArray(favoritos)) return []
    const normalizados = favoritos
      .filter((favorito) => favorito !== null && favorito !== undefined)
      .map((favorito) => typeof favorito === 'object'
        ? { id: favorito.id, tipo: favorito.tipo === 'merch' ? 'merch' : 'producto' }
        : { id: favorito, tipo: 'producto' })
      .filter((favorito) => favorito.id !== null && favorito.id !== undefined)
    return normalizados.filter((favorito, indice) =>
      normalizados.findIndex((otro) =>
        otro.tipo === favorito.tipo && String(otro.id) === String(favorito.id)
      ) === indice
    )
  },
})

// Si el producto está en la wishlist lo saca; si no está, lo agrega
export async function alternarWishlist(id, tipo = 'producto') {
  await wishlistStore.modificar((favoritos) =>
    favoritos.some((favorito) => favorito.tipo === tipo && String(favorito.id) === String(id))
      ? favoritos.filter((favorito) => !(favorito.tipo === tipo && String(favorito.id) === String(id)))
      : [...favoritos, { id, tipo }]
  )
}

// Hook para usar en cualquier componente: se vuelve a dibujar solo cuando cambia la wishlist
export function useWishlist() {
  const estado = wishlistStore.useStore()
  const favoritos = estado.items

  return {
    favoritos,
    cargando: estado.cargando,
    error: estado.error,
    estaEnWishlist: (id, tipo = 'producto') => favoritos.some(
      (favorito) => favorito.tipo === tipo && String(favorito.id) === String(id)
    ),
    alternar: alternarWishlist,
  }
}