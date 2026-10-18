import producto1 from '../assets/ProducutosImgs/IN RAINBOWS.jpg'
import producto2 from '../assets/ProducutosImgs/CowboyBebopSoundtrack.webp'
import producto3 from '../assets/ProducutosImgs/BLONDE.webp'
import producto4 from '../assets/ProducutosImgs/CHARM.webp'
import producto5 from '../assets/ProducutosImgs/GULP!.webp'
import producto6 from '../assets/ProducutosImgs/OKTUBRE.webp'
import producto7 from '../assets/ProducutosImgs/MECAE.webp'
import producto8 from '../assets/ProducutosImgs/YO PRAY.webp'
// Fuente única de datos: la usan la página Productos y el Buscador del navbar.
// Pegá acá tu array real (con tus imágenes importadas si ya las tenés).
export const productos = [
  { id: 1, nombre: 'IN RAINBOWS', artista: 'Radiohead', precio: 100000, categoria: 'Internacional', imagen: producto1, spotify: '6dGnYIeXmHdcikdzNNDMm2' },
  { id: 2, nombre: 'COWBOY BEBOP', artista: 'Seatbelts', precio: 235000, categoria: 'Jazz / Blues', imagen: producto2 },
  { id: 3, nombre: 'BLONDE', artista: 'Frank Ocean', precio: 150000, categoria: 'Indie', imagen: producto3 },
  { id: 4, nombre: 'CHARM', artista: 'Clairo', precio: 120000, categoria: 'Indie', imagen: producto4 },
  { id: 5, nombre: 'GULP!', artista: 'Patricio rey y sus redonditos de ricota', precio: 98000, categoria: 'Rock', imagen: producto5 },
  { id: 6, nombre: 'OKTUBRE', artista: 'Patricio rey y sus redonditos de ricota', precio: 142500, categoria: 'Rock', imagen: producto6 },
  { id: 7, nombre: 'MECAE', artista: 'cero', precio: 76000, categoria: 'Under', imagen: producto7 },
  { id: 8, nombre: 'YO PRAY', artista: 'cero', precio: 189000, categoria: 'Under', imagen: producto8, spotify: '1oewbFslWDSzh9Rl7Y483n' },
]
 
// Quita tildes y pasa a minúsculas: así "cafe" encuentra "Café".
export function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}