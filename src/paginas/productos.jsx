
import '../estilos/productos.css'

// Editá esta lista para agregar, sacar o cambiar productos.
// Cuando tengas las imágenes, poné la ruta en "imagen".
const productos = [
  { id: 1, nombre: 'Producto 1', precio: '$100.000,00', imagen: '' },
  { id: 2, nombre: 'Producto 2', precio: '$235.000,00', imagen: '' },
  { id: 3, nombre: 'Producto 3', precio: '$150.000,00', imagen: '' },
  { id: 4, nombre: 'Producto 4', precio: '$115.000,00', imagen: '' },
  { id: 5, nombre: 'Producto 5', precio: '$98.000,00', imagen: '' },
  { id: 6, nombre: 'Producto 6', precio: '$142.500,00', imagen: '' },
  { id: 7, nombre: 'Producto 7', precio: '$76.000,00', imagen: '' },
  { id: 8, nombre: 'Producto 8', precio: '$189.000,00', imagen: '' },
]

function Productos() {
  return (
    <div>
      {/* NAVBAR */}
      <header className="navbar">
        <h1 className="logo">Em vez de voce ficar pensando nele</h1>
        <nav className="nav-botones">
          <a href="#" className="btn-nav">Vinilos</a>
          <a href="#" className="btn-nav">CDs</a>
        </nav>
      </header>

</div>
  )
}
export default Productos