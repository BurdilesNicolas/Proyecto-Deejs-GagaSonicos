import producto1 from '../assets/ProducutosImgs/IN RAINBOWS.jpg'
// Fuente única de datos: la usan la página Productos y el Buscador del navbar.
// Pegá acá tu array real (con tus imágenes importadas si ya las tenés).
export const productos = [
  { id: 1, nombre: 'IN RAINBOWS', artista: 'Radiohead', precio: 100000, categoria: 'Internacional', imagen: producto1 },
  { id: 2, nombre: 'Producto 2', artista: 'Artista 2', precio: 235000, categoria: 'Internacional', imagen: producto1 },
  { id: 3, nombre: 'Producto 3', artista: 'Artista 3', precio: 150000, categoria: 'Nacional', imagen: producto1 },
  { id: 4, nombre: 'Producto 4', artista: 'Artista 4', precio: 115000, categoria: 'Nacional', imagen: producto1 },
  { id: 5, nombre: 'Producto 5', artista: 'Artista 5', precio: 98000, categoria: 'Jazz / Blues', imagen: producto1 },
  { id: 6, nombre: 'Producto 6', artista: 'Artista 6', precio: 142500, categoria: 'Jazz / Blues', imagen: producto1 },
  { id: 7, nombre: 'Producto 7', artista: 'Artista 7', precio: 76000, categoria: 'Soundtrack / OST', imagen: producto1 },
  { id: 8, nombre: 'Producto 8', artista: 'Artista 8', precio: 189000, categoria: 'Soundtrack / OST', imagen: producto1 },
]
 
// Quita tildes y pasa a minúsculas: así "cafe" encuentra "Café".
export function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}