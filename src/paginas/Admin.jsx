
import { Link } from "react-router-dom";

function Admin() {
  return (
    <div className="container mt-5 mb-5">
      <h1>Panel de Administración</h1>
      <p>Bienvenido al panel de administración de Deej's.</p>
      <div className="row mt-4">
        <div className="col-md-4 mb-3">
          <div className="card p-3 h-100">
            <h5>Productos</h5>
            <p>Administrar productos de la tienda.</p>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card p-3 h-100">
            <h5>Usuarios</h5>
            <p>Consultar usuarios registrados y sus roles.</p>
            <Link to="/Admin/Usuarios" className="btn btn-primary mt-auto">
              Ver usuarios
            </Link>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card p-3 h-100">
            <h5>Reseñas</h5>
            <p>Consultar y administrar reseñas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
