import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
            <Link className="navbar-brand" to="/">GagaSonicos</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                <Link className="nav-link" to="/">Inicio</Link>
                </li>
                <Link className="nav-link" to="/paginas/Productos">Productos</Link>
                <li className="nav-item">
                <Link className="nav-link" to="/paginas/Login">Login</Link>
                </li>
            </ul>
            </div>
        </div>
        </nav>
    );
}

export default Navbar;
