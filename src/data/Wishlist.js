// Wishlist guardada en localStorage: sobrevive a recargar la página y se comparte
// entre todas las pantallas (cards, ficha de producto y página de wishlist).
// Solo se guardan los IDs de los productos; el resto se lee de Productos.js.
import { useMemo, useSyncExternalStore } from 'react'

const CLAVE = 'wishlist-deejs'
const EVENTO = 'wishlist-cambio'

function leerTexto() {
  try {
    return localStorage.getItem(CLAVE) || '[]'
  } catch {
    return '[]'
  }
}

function leerIds(texto) {
  try {
    const ids = JSON.parse(texto)
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}

// React llama a esta función para enterarse cuando la wishlist cambia:
// en esta pestaña (nuestro evento) o en otra pestaña (el evento "storage")
function suscribirse(avisar) {
  window.addEventListener(EVENTO, avisar)
  window.addEventListener('storage', avisar)
  return () => {
    window.removeEventListener(EVENTO, avisar)
    window.removeEventListener('storage', avisar)
  }
}

// Si el producto está en la wishlist lo saca; si no está, lo agrega
export function alternarWishlist(id) {
  const ids = leerIds(leerTexto())
  const nuevos = ids.some((x) => String(x) === String(id)) ? ids.filter((x) => String(x) !== String(id)) : [...ids, id]
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevos))
  } catch {
    // Si el navegador bloquea el almacenamiento, la wishlist no persiste.
  }
  window.dispatchEvent(new Event(EVENTO))
}

// Hook para usar en cualquier componente: se vuelve a dibujar solo cuando cambia la wishlist
export function useWishlist() {
  const texto = useSyncExternalStore(suscribirse, leerTexto, () => '[]')
  const ids = useMemo(() => leerIds(texto), [texto])

  return {
    ids,
    estaEnWishlist: (id) => ids.some((x) => String(x) === String(id)),
    alternar: alternarWishlist,
  }
}