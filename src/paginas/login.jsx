import React from "react";
import { Link } from "react-router-dom";

// Asegúrate de tener importado Bootstrap y Bootstrap Icons en tu index.js o App.js:
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';

function Login() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            {/* Tarjeta Contenedora */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="card-body">
                {/* Cabecera del Login */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-dark mb-1">¡Bienvenido!</h2>
                  <p className="text-muted small">
                    Ingresa tus credenciales para continuar
                  </p>
                </div>

                <form>
                  {/* Input de Email */}
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      id="form2Example1"
                      className="form-control bg-light border-0 text-secondary"
                      placeholder="Dirección de correo"
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
                      className="form-control bg-light border-0 text-secondary"
                      placeholder="Contraseña"
                    />
                    <label htmlFor="form2Example2" className="text-muted">
                      Contraseña
                    </label>
                  </div>

                  {/* Recordarme y Olvido */}
                  <div className="row my-4 align-items-center">
                    <div className="col-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="form2Example31"
                          defaultChecked
                        />
                        <label
                          className="form-check-label small text-secondary"
                          htmlFor="form2Example31"
                        >
                          Recordar datos
                        </label>
                      </div>
                    </div>

                    <div className="col-6 text-end">
                      <a
                        href="#!"
                        className="text-decoration-none small fw-semibold text-primary"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                  </div>

                  {/* Botón de Ingreso */}
                  <button
                    type="button"
                    className="btn btn-primary w-100 py-2.5 fw-bold text-uppercase shadow-sm mb-4 rounded-3"
                  >
                    Iniciar sesión
                  </button>

                  {/* Registro y Redes Sociales */}
                  <div className="text-center">
                    <p className="small text-muted mb-4">
                      ¿No tienes una cuenta?
                      <Link
                        to="/paginas/Registro"
                        className="text-decoration-none fw-semibold text-primary"
                        aria-label="Registrarse"
                      >
                        {" "}
                        Registrarse
                      </Link>
                    </p>

                    <div className="position-relative mb-4">
                      <hr className="text-muted" />
                      <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                        O ingresa con
                      </span>
                    </div>

                    {/* Botones de Redes Sociales con Íconos */}
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-light text-dark border shadow-sm px-3"
                        title="Google"
                      >
                        <i className="bi bi-google text-danger"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-light text-dark border shadow-sm px-3"
                        title="Facebook"
                      >
                        <i className="bi bi-facebook text-primary"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-light text-dark border shadow-sm px-3"
                        title="GitHub"
                      >
                        <i className="bi bi-github"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-light text-dark border shadow-sm px-3"
                        title="Twitter"
                      >
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
