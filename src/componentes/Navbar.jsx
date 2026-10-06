import { NavLink, Link } from 'react-router-dom'
import logo from '../assets/LOGO DEEJS 2.svg'
import '../estilos/Navbar.css'

function Navbar() {
  return (
    <nav className="floating-navbar">
      <div className="navbar-pill">

        {/* MARCA */}
        <Link className="brand" to="/">
          <img src={logo} alt="GagaSonicos" className="logo-navbar" />
          <div className="brand-text">
            <span className="brand-sub">Música física</span>
          </div>
        </Link>

        {/* LINKS */}
        <ul className="nav-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-pill active' : 'nav-pill'}>
              <span className="nav-icon" aria-hidden="true"></span>
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/Productos" className={({ isActive }) => isActive ? 'nav-pill active' : 'nav-pill'}>
              <span className="nav-icon" aria-hidden="true"></span>
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink to="/Comunidad" className={({ isActive }) => isActive ? 'nav-pill active' : 'nav-pill'}>
              <span className="nav-icon" aria-hidden="true"></span>
              Comunidad
            </NavLink>
          </li>
          <li>
            <NavLink to="/Nosotros" className={({ isActive }) => isActive ? 'nav-pill active' : 'nav-pill'}>
              <span className="nav-icon" aria-hidden="true"></span>
              Nosotros
            </NavLink>
          </li>
          <li>
            <NavLink to="/Locales" className={({ isActive }) => isActive ? 'nav-pill active' : 'nav-pill'}>
              <span className="nav-icon" aria-hidden="true"></span>
              Locales
            </NavLink>
          </li>
        </ul>

        {/* ACCIONES */}
        <div className="navbar-actions">
          <Link to="/carrito" className="icon-btn" aria-label="Carrito">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </Link>
          <NavLink to="/Perfil" className="icon-btn" aria-label="Login">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
          </NavLink>
        </div>

      </div>
    </nav>
  )
}
export default Navbar;
