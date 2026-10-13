import React, { useState } from "react";
import { Link } from "react-router-dom";
import SelectorFoto from "../componentes/SelectorFoto";
import "../estilos/Perfil.css";

// Props opcionales (usadas desde Perfil.jsx):
//  onLogin(correo, password) -> devuelve un texto de error, o null si todo salió bien
//  onIrARegistro()           -> cambia a la vista de registro sin usar el router
function Login({ onLogin, onIrARegistro }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) setError(onLogin(correo, password) || "");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            {/* Tarjeta Contenedora */}
            <div className="card rounded-4 p-4 text-white auth-card">
              <div className="card-body">
                {/* Cabecera del Login */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-white mb-1">¡Bienvenido!</h2>
                  <p className="text-white-50 small mb-0">
                    Ingresa tus credenciales para continuar
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Input de Email */}
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      id="form2Example1"
                      required
                      className="form-control auth-input bg-white border-0 text-dark"
                      placeholder="Dirección de correo"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                    />
                    <label htmlFor="form2Example1" className="text-muted">
                      Dirección de correo
                    </label>
                  </div>

                  {/* Input de Contraseña */}
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      id="form2Example2"
                      required
                      className="form-control auth-input bg-white border-0 text-dark"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <label htmlFor="form2Example2" className="text-muted">
                      Contraseña
                    </label>
                  </div>

                  {error && <div className="auth-error mb-3">{error}</div>}

                  {/* Recordarme y Olvido */}
                  <div className="row my-4 align-items-center">
                    <div className="col-6">
                      <div className="form-check">
                        <input
                          className="form-check-input auth-check"
                          type="checkbox"
                          value=""
                          id="form2Example31"
                          defaultChecked
                        />
                        <label
                          className="form-check-label small text-white"
                          htmlFor="form2Example31"
                        >
                          Recordar datos
                        </label>
                      </div>
                    </div>

                    <div className="col-6 text-end">
                      <a href="#!" className="auth-link small fw-semibold">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                  </div>

                  {/* Botón de Ingreso */}
                  <button
                    type="submit"
                    className="btn btn-light w-100 py-2 fw-bold text-uppercase shadow-sm mb-4 rounded-3 auth-btn-primary"
                  >
                    Iniciar sesión
                  </button>

                  {/* Registro y Redes Sociales */}
                  <div className="text-center">
                    <p className="small text-white-50 mb-4">
                      ¿No tienes una cuenta?
                      {onIrARegistro ? (
                        <button
                          type="button"
                          className="btn btn-link auth-link p-0 fw-semibold align-baseline ms-1"
                          onClick={onIrARegistro}
                        >
                          Registrarse
                        </button>
                      ) : (
                        <Link
                          to="/Registro"
                          className="auth-link fw-semibold"
                          aria-label="Registrarse"
                        >
                          {" "}
                          Registrarse
                        </Link>
                      )}
                    </p>

                    <div className="position-relative mb-4">
                      <hr className="text-white-50" />
                      <span className="position-absolute top-50 start-50 translate-middle px-3 text-white-50 small auth-divider-text">
                        O ingresa con
                      </span>
                    </div>

                    {/* Botones de Redes Sociales con Íconos */}
                    <div className="d-flex justify-content-center gap-2">
                      <button type="button" className="btn auth-social px-3" title="Google">
                        <i className="bi bi-google"></i>
                      </button>
                      <button type="button" className="btn auth-social px-3" title="Facebook">
                        <i className="bi bi-facebook"></i>
                      </button>
                      <button type="button" className="btn auth-social px-3" title="GitHub">
                        <i className="bi bi-github"></i>
                      </button>
                      <button type="button" className="btn auth-social px-3" title="Twitter">
                        <i className="bi bi-twitter-x"></i>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {/* Fin Tarjeta */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;