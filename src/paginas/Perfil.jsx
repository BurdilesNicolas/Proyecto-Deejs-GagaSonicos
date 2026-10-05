import React, { useState } from "react";

function Perfil() {
  //Estado de autenticación
  const [estaLogueado, setEstaLogueado] = useState(
    !!localStorage.getItem("userToken"),
  );
  //Estado de vista interna
  const [vistaActual, setVistaActual] = useState("login");
  //Funciones de acción
  //Inicio de sesión
  const handleLoginSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue por completo
    localStorage.setItem("userToken", "token-valido-123"); // Guarda la sesión
    setEstaLogueado(true); // Cambia el estado para mostrar el Perfil
  };
  //Registrarse
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("userToken", "token-valido-123"); // Guarda la sesión
    setEstaLogueado(true); // Cambia el estado para mostrar el Perfil
  };
  //Cerrar sesión
  const handleCerrarSesion = () => {
    localStorage.removeItem("userToken"); // Borra la sesión de la memoria
    setEstaLogueado(false); // Quita el Perfil
    setVistaActual("login"); // Deja el Login listo para volver a entrar
  };
  //VISTAS DE PERFIL
  //Perfil de usuario
  if (estaLogueado) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
              {/* Tarjeta de bienvenida */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center">
                <div className="card-body">
                  <h2 className="fw-bold text-dark mb-2">Mi Perfil</h2>
                  <p className="text-muted">
                    ¡Bienvenido de vuelta a tu cuenta!
                  </p>

                  {/* Caja de información interna */}
                  <div className="my-4">
                    <div className="p-3 bg-light rounded-3 text-start small text-secondary">
                      <strong>Estado del Perfil:</strong> Sesión Conectada
                      Exitosamente
                    </div>
                  </div>

                  {/* Botón para desconectarse */}
                  <button
                    type="button"
                    className="btn btn-danger w-100 py-2.5 fw-bold text-uppercase shadow-sm rounded-3"
                    onClick={handleCerrarSesion}
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  //Formulario de inicio de sesión
  if (vistaActual === "login") {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
              {/* Tarjeta Contenedora del Login */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <div className="card-body">
                  {/* Cabecera */}
                  <div className="text-center mb-4">
                    <h2 className="fw-bold text-dark mb-1">¡Bienvenido!</h2>
                    <p className="text-muted small">
                      Ingresa tus credenciales para continuar
                    </p>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleLoginSubmit}>
                    {/* Input de Email */}
                    <div className="form-floating mb-3">
                      <input
                        type="email"
                        className="form-control bg-light border-0 text-secondary"
                        placeholder="Dirección de correo"
                        required
                      />
                      <label className="text-muted">Dirección de correo</label>
                    </div>

                    {/* Input de Contraseña */}
                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        className="form-control bg-light border-0 text-secondary"
                        placeholder="Contraseña"
                        required
                      />
                      <label className="text-muted">Contraseña</label>
                    </div>

                    {/* Recordarme y Olvido */}
                    <div className="row my-4 align-items-center">
                      <div className="col-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="rememberCheck"
                            defaultChecked
                          />
                          <label
                            className="form-check-label small text-secondary"
                            htmlFor="rememberCheck"
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
                      type="submit"
                      className="btn btn-primary w-100 py-2.5 fw-bold text-uppercase shadow-sm mb-4 rounded-3"
                    >
                      Iniciar sesión
                    </button>

                    {/* Registro y Redes Sociales */}
                    <div className="text-center">
                      <p className="small text-muted mb-4">
                        ¿No tienes una cuenta?
                        {/* BOTÓN DE CAMBIO: Al hacer clic, cambia el estado a "registro" */}
                        <button
                          type="button"
                          className="btn btn-link p-0 fw-semibold text-decoration-none align-baseline ms-1"
                          onClick={() => setVistaActual("registro")}
                        >
                          Registrarse
                        </button>
                      </p>

                      <div className="position-relative mb-4">
                        <hr className="text-muted" />
                        <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                          O ingresa con
                        </span>
                      </div>

                      {/* Botones de Redes Sociales con tus Bootstrap Icons */}
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Perfil;
