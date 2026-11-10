import { crearCuentaStore } from './cuentaStore'

const CLAVE = 'carrito-deejs'
// Límite general: máximo de unidades de cada producto (por formato) en el carrito.
// Cambiá este número y se actualiza en la ficha y en el carrito.
export const LIMITE_POR_PRODUCTO = 2

const carritoStore = crearCuentaStore({
  claveLocal: CLAVE,
  documento: 'carrito',
  normalizar: (items) => {
    if (!Array.isArray(items)) return []
    return items.map((item) => ({
      ...item,
      cantidad: Math.max(1, Math.min(Number(item.cantidad) || 1, LIMITE_POR_PRODUCTO)),
    }))
  },
})

export function leerCarrito() {
  return carritoStore.getItems()
}

// Devuelve cuántas unidades se agregaron de verdad (0 si ya estaba en el máximo).
// "maximo" permite bajar el límite cuando el stock de ese formato es menor.
export async function agregarAlCarrito({ id, formato, tipo = 'producto', cantidad = 1, maximo = LIMITE_POR_PRODUCTO }) {
  let agregadas = 0
  await carritoStore.modificar((actuales) => {
    const items = [...actuales]
    const existente = items.find((item) =>
      item.id === id && item.formato === formato && (item.tipo || 'producto') === tipo
    )
    const actual = existente ? existente.cantidad : 0
    agregadas = Math.max(0, Math.min(cantidad, maximo - actual))
    if (agregadas === 0) return items

    if (existente) {
      existente.cantidad = actual + agregadas
    } else {
      items.push({ id, formato, cantidad: agregadas, ...(tipo !== 'producto' && { tipo }) })
    }
    return items
  })
  return agregadas
}

export function cambiarCantidad(id, formato, cantidad, maximo = LIMITE_POR_PRODUCTO, tipo = 'producto') {
  return carritoStore.modificar((items) => items.map((item) =>
    item.id === id && item.formato === formato && (item.tipo || 'producto') === tipo
      ? { ...item, cantidad: Math.max(1, Math.min(cantidad, maximo)) }
      : item
  ))
}

export function quitarDelCarrito(id, formato, tipo = 'producto') {
  return carritoStore.modificar((items) => items.filter((item) =>
    !(item.id === id && item.formato === formato && (item.tipo || 'producto') === tipo)
  ))
}

export function vaciarCarrito() {
  return carritoStore.modificar(() => [])
}

export function useCarrito() {
  const estado = carritoStore.useStore()
  return { items: estado.items, cargando: estado.cargando, error: estado.error }
}