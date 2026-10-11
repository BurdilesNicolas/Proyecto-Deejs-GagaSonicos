import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productos, normalizar } from '../data/Productos'
import '../estilos/Buscador.css'

function Buscador() {
  const [abierto, setAbierto] = useState(false)
  const [consulta, setConsulta] = useState('')
  const contenedorRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const texto = consulta.trim()

  // Máximo 5 sugerencias, buscando en nombre y artista
  const resultados =
    texto === ''
      ? []
      : productos
          .filter((p) =>
            normalizar(`${p.nombre} ${p.artista || ''}`).includes(normalizar(texto))
          )
          .slice(0, 5)

  // Cerrar al hacer click afuera o apretar Escape
  useEffect(() => {
    function cerrarAfuera(e) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    function cerrarConEscape(e) {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', cerrarAfuera)
    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      document.removeEventListener('mousedown', cerrarAfuera)
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [])

  // Poner el cursor en el input apenas se abre
  useEffect(() => {
    if (abierto) inputRef.current?.focus()
  }, [abierto])

  function irAResultados(busqueda) {
    navigate(`/Productos?buscar=${encodeURIComponent(busqueda)}`)
    setAbierto(false)
  }

  function manejarSubmit(e) {
    e.preventDefault()
    if (texto) irAResultados(texto)
  }

  return (
    <div className="buscador" ref={contenedorRef}>
      <button
        className="icon-btn"
        aria-label="Buscar"
        onClick={() => setAbierto(!abierto)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      {abierto && (
        <div className="buscador-panel">
          <form onSubmit={manejarSubmit}>
            <input
              ref={inputRef}
              className="buscador-input"
              type="text"
              placeholder="Buscar discos o artistas"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
            />
          </form>

          {texto !== '' && resultados.length > 0 && (
            <>
              <ul className="buscador-resultados">
                {resultados.map((p) => (
                  <li key={p.id}>
                    <button className="buscador-item" onClick={() => irAResultados(p.nombre)}>
                      <div className="buscador-thumb">
                        {p.imagen && <img src={p.imagen} alt="" />}
                      </div>
                      <div className="buscador-info">
                        <span className="buscador-nombre">{p.nombre}</span>
                        <span className="buscador-artista">de {p.artista}</span>
                        <span className="buscador-tipo">{p.categoria}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <button className="buscador-ver-todos" onClick={() => irAResultados(texto)}>
                <span>Ver todos los resultados</span>
                <span aria-hidden="true">›</span>
              </button>
            </>
          )}

          {texto !== '' && resultados.length === 0 && (
            <p className="buscador-vacio">Sin resultados para “{texto}”</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Buscador