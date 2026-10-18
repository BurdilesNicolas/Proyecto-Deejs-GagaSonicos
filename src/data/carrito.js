// Carrito simple guardado en localStorage (sobrevive a recargar la página).
// Solo guarda id + formato + cantidad; el nombre, la imagen y el precio
// se leen de la lista de productos cuando se muestra el carrito.
const CLAVE = 'carrito-deejs'

export function leerCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE))
    return Array.isArray(guardado) ? guardado : []
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

export function agregarAlCarrito({ id, formato, cantidad = 1 }) {
  const items = leerCarrito()
  const existente = items.find((i) => i.id === id && i.formato === formato)
  if (existente) {
    existente.cantidad = Math.min(existente.cantidad + cantidad, 99)
  } else {
    items.push({ id, formato, cantidad })
  }
  return guardarCarrito(items)
}

export function cambiarCantidad(id, formato, cantidad) {
  const items = leerCarrito().map((i) =>
    i.id === id && i.formato === formato
      ? { ...i, cantidad: Math.max(1, Math.min(cantidad, 99)) }
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
