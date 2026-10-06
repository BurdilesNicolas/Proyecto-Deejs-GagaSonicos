import React from "react";
import { Link } from "react-router-dom";
import "../estilos/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section branding">
          <h3 className="footer-logo">DEEJ'S</h3>
          <p>Elevando tu experiencia sonora al siguiente nivel.</p>
        </div>

        <div className="footer-section navigation">
          <h4>Navegación</h4>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/paginas/Productos">Productos</Link></li>
            <li><Link to="/paginas/Login">Login</Link></li>
          </ul>
        </div>

        <div className="footer-section contact-social">
          <h4>Conecta con nosotros</h4>
          <div className="contact-info">
            <a href="mailto:info@deejs.com">info@deejs.com</a>
          </div>
          <div className="social-icons">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073C24 5.442 18.618 0 12 0 5.382 0 0 5.442 0 12.073V24H7.073V18.042H10.042V12.073H7.073V9.34C6.75 9.34 6.345 9.388 6.03 9.465C5.33 9.992 5.152 10.853 5.152 11.755C5.152 12.67 5.485 13.575 6.152 13.575C6.818 13.575 7.64 13.142 7.64 12.433V11.14C8.2 11.273 8.78 11.4 9.375 11.4C11.16 11.4 12.6 10.2 12.6 8.3V7.1C12.6 6.2 12.3 5.4 11.7 4.6C11.1 3.8 10.3 3.3 9.4 3.1V3.1C8.5 3.1 7.7 3.5 7.1 4.1C6.5 4.7 6.1 5.6 6.1 6.6V7.1H4.1V12.073H6.1V24H10.1V18.042H12.1V12.073H10.1V11.14C10.1 11.14 10.1 11.14 10.1 11.14V12.073H12.1V24H16.1V12.073H14.1V11.14C14.1 11.14 14.1 11.14 14.1 11.14V12.073H16.1V24H20.1V12.073H18.1V11.14C18.1 11.14 18.1 11.14 18.1 11.14V12.073H20.1V24H24V12.073Z"/></svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.645.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.691-4.919-4.919-.058-1.265-.07-1.645-.07-4.849 0-3.204.012-3.584.07-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.358-2.618-6.78-6.98-6.98-1.281-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4.017-1.808-4.017-4.017s1.808-4.017 4.017-4.017 4.017 1.808 4.017 4.017-1.808 4.017-4.017 4.017z"/></svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 00-8.684-3.12c-2.365 0-4.545 1.105-5.92 2.82C4.41 6.05 3 8.1 3 10.4c0 2.22.8 4.2 2.1 5.75a4.94 4.94 0 00-1.1 2.3C3.2 16.35 3 17.15 3 18c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2 0-1.1-.9-2-2-2a4.95 4.95 0 01-1.1-2.3 4.94 4.94 0 004.6-3.12c.5-.3.9-.6 1.3-1.1z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 DEEJ'S. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
