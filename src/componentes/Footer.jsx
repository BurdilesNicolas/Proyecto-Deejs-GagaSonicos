import React from "react";
import { Link } from "react-router-dom";
import "../estilos/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section about">
          <h3 className="footer-logo">DEEJ'S</h3>
          <p>
            Tu destino favorito para la mejor música y productos exclusivos.
          </p>
        </div>

        <div className="footer-section links">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li>
              <Link to="/Inicio">Inicio</Link>
            </li>
            <li>
              <Link to="/Productos">Productos</Link>
            </li>
            <li>
              <Link to="/Comunidad">Comunidad</Link>
            </li>
            <li>
              <Link to="/Nosotros">Nosotros</Link>
            </li>
            <li>
              <Link to="/Locales">Locales</Link>
            </li>
            <li>
              <Link to="/Carrito">Carrito</Link>
            </li>
            <li>
              <Link to="/Wishlist">Wishlist</Link>
            </li>
            <li>
              <Link to="/Perfil">Mi cuenta</Link>
            </li>
            <li>
              <Link to="/Login">Login</Link>
            </li>
            <li>
              <Link to="/Politicas">Políticas</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section social">
          <h4>Síguenos</h4>
          <div className="social-icons">
            <a href="#" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>2026 DEEJ'S. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
