import '../estilos/Inicio.css'
function Inicio() {
  return (
      <div>
        <div className="hero">
        <h1>DEEJ`S</h1>
        <p></p>
        <div className="botones_inicio">
          <button><a href="..\paginas\Productos">Explorar</a></button>
          <button><a href=""></a>Conocernos</button>
        </div>
        <p></p>
        </div>
        <div className="secundario">
          <h2>Novedades</h2>
          <div className="cards">
              <div className="card" style={{ width: '18rem' }}>
                <p>Tema 1</p>
              <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
                </div>
              </div>
              <div className="card" style={{ width: '18rem' }}>
                <p>Tema 2</p>
              <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
                </div>
              </div>
              <div className="card" style={{ width: '18rem' }}>
                <p>Tema 3</p>
              <img src="" className="card-img-top" alt="" />
                <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
                </div>
              </div>
          </div>
        </div>
    </div>

  )
}
export default Inicio