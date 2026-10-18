import producto1 from '../assets/ProducutosImgs/IN RAINBOWS.jpg'
import producto2 from '../assets/ProducutosImgs/CowboyBebopSoundtrack.webp'
import producto3 from '../assets/ProducutosImgs/BLONDE.webp'
import producto4 from '../assets/ProducutosImgs/CHARM.webp'
import producto5 from '../assets/ProducutosImgs/GULP!.webp'
import producto6 from '../assets/ProducutosImgs/OKTUBRE.webp'
import producto7 from '../assets/ProducutosImgs/MECAE.webp'
import producto8 from '../assets/ProducutosImgs/YO PRAY.webp'

// Fuente única de datos: la usan la página Productos, el Buscador del navbar,
// la ficha de producto y el carrito.
//
// "precio" es el precio base (el del vinilo): lo muestra el listado.
// "formatos" define qué se puede comprar en la ficha:
//   - Un formato con stock: 0 se muestra como "Agotado".
//   - Un formato que no esté en la lista también se muestra como agotado.
//   - Si omitís "stock", el formato cuenta como disponible sin límite.
//   - Los nombres válidos son 'Vinilo', 'CD' y 'Cassette'.
// Los precios y el stock de CD y cassette son de ejemplo: ajustalos a los reales.
export const productos = [
  {
    id: 1,
    nombre: 'IN RAINBOWS',
    artista: 'Radiohead',
    precio: 100000,
    categoria: 'Internacional',
    imagen: producto1,
    spotify: '6dGnYIeXmHdcikdzNNDMm2',
    formatos: [
      { nombre: 'Vinilo', precio: 100000, stock: 4 },
      { nombre: 'CD', precio: 30000, stock: 6 },
      { nombre: 'Cassette', precio: 25000, stock: 0 },
    ],
  },
  {
    id: 2,
    nombre: 'COWBOY BEBOP',
    artista: 'Seatbelts',
    precio: 235000,
    categoria: 'Jazz / Blues',
    imagen: producto2,
    formatos: [
      { nombre: 'Vinilo', precio: 235000, stock: 2 },
      { nombre: 'CD', precio: 45000, stock: 3 },
    ],
  },
  {
    id: 3,
    nombre: 'BLONDE',
    artista: 'Frank Ocean',
    precio: 150000,
    categoria: 'Indie',
    imagen: producto3,
    formatos: [
      { nombre: 'Vinilo', precio: 150000, stock: 1 },
      { nombre: 'CD', precio: 38000, stock: 0 },
      { nombre: 'Cassette', precio: 28000, stock: 3 },
    ],
  },
  {
    id: 4,
    nombre: 'CHARM',
    artista: 'Clairo',
    precio: 120000,
    categoria: 'Indie',
    imagen: producto4,
    formatos: [
      { nombre: 'Vinilo', precio: 120000, stock: 5 },
      { nombre: 'CD', precio: 32000, stock: 4 },
      { nombre: 'Cassette', precio: 26000, stock: 2 },
    ],
  },
  {
    id: 5,
    nombre: 'GULP!',
    artista: 'Patricio rey y sus redonditos de ricota',
    precio: 98000,
    categoria: 'Rock',
    imagen: producto5,
    formatos: [
      { nombre: 'Vinilo', precio: 98000, stock: 3 },
      { nombre: 'CD', precio: 28000, stock: 5 },
    ],
  },
  {
    id: 6,
    nombre: 'OKTUBRE',
    artista: 'Patricio rey y sus redonditos de ricota',
    precio: 142500,
    categoria: 'Rock',
    imagen: producto6,
    formatos: [
      { nombre: 'Vinilo', precio: 142500, stock: 2 },
      { nombre: 'CD', precio: 30000, stock: 0 },
      { nombre: 'Cassette', precio: 27000, stock: 4 },
    ],
  },
  {
    id: 7,
    nombre: 'MECAE',
    artista: 'cero',
    precio: 76000,
    categoria: 'Under',
    imagen: producto7,
    formatos: [
      { nombre: 'Vinilo', precio: 76000, stock: 3 },
      { nombre: 'CD', precio: 22000, stock: 6 },
      { nombre: 'Cassette', precio: 18000, stock: 5 },
    ],
  },
  {
    id: 8,
    nombre: 'YO PRAY',
    artista: 'cero',
    precio: 189000,
    categoria: 'Under',
    imagen: producto8,
    spotify: '1oewbFslWDSzh9Rl7Y483n',
    formatos: [
      { nombre: 'Vinilo', precio: 189000, stock: 2 },
      { nombre: 'CD', precio: 35000, stock: 4 },
      { nombre: 'Cassette', precio: 29000, stock: 1 },
    ],
  },
]

// Quita tildes y pasa a minúsculas: así "cafe" encuentra "Café".
export function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}