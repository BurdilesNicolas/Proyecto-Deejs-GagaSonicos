// Carrito simple guardado en localStorage (sobrevive a recargar la página).
// Solo guarda id + formato + cantidad; el nombre, la imagen y el precio
// se leen de la lista de productos cuando se muestra el carrito.
const CLAVE = 'carrito-deejs'

// Límite general: máximo de unidades de cada producto (por formato) en el carrito.
// Cambiá este número y se actualiza en la ficha y en el carrito.
export const LIMITE_POR_PRODUCTO = 2

export function leerCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE))
    if (!Array.isArray(guardado)) return []
    // Si había cantidades guardadas antes de que existiera el límite, se ajustan
    return guardado.map((i) => ({
      ...i,
      cantidad: Math.max(1, Math.min(Number(i.cantidad) || 1, LIMITE_POR_PRODUCTO)),
    }))
  } catch {
    return []
  }
}

function guardarCarrito(items) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(items))
  } catch {
    // Si el navegador bloquea el almacenamiento, el carrito simplemente no persiste.
  }
  return items
}

// Devuelve cuántas unidades se agregaron de verdad (0 si ya estaba en el máximo).
// "maximo" permite bajar el límite cuando el stock de ese formato es menor.
export function agregarAlCarrito({ id, formato, cantidad = 1, maximo = LIMITE_POR_PRODUCTO }) {
  const items = leerCarrito()
  const existente = items.find((i) => i.id === id && i.formato === formato)
  const actual = existente ? existente.cantidad : 0
  const agregadas = Math.max(0, Math.min(cantidad, maximo - actual))

  if (agregadas === 0) return 0

  if (existente) {
    existente.cantidad = actual + agregadas
  } else {
    items.push({ id, formato, cantidad: agregadas })
  }
  guardarCarrito(items)
  return agregadas
}

export function cambiarCantidad(id, formato, cantidad, maximo = LIMITE_POR_PRODUCTO) {
  const items = leerCarrito().map((i) =>
    i.id === id && i.formato === formato
      ? { ...i, cantidad: Math.max(1, Math.min(cantidad, maximo)) }
      : i
  )
  return guardarCarrito(items)
}

export function quitarDelCarrito(id, formato) {
  return guardarCarrito(
    leerCarrito().filter((i) => !(i.id === id && i.formato === formato))
  )
}

export function vaciarCarrito() {
  return guardarCarrito([])
}