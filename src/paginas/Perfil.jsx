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
  //Editar datos
  const handleUpdateSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue por completo
    setModoEdicion(false); // Apaga el modo edición y vuelve a mostrar tus datos limpios
    alert("¡Cambios guardados con éxito!"); // Alerta visual de confirmación
  };
  
//=======================Variables========================
  const [nombre, setNombre] = useState("juan");
  const [correo, setCorreo] = useState("juan@email.com");
  const [mostrarCorreo, setMostrarCorreo] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  //=======================VISTAS DE PERFIL=========================
  //Perfil de usuario
  if (estaLogueado) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
              {/* Tarjeta Contenedora Estilo Tu Captura */}
              <div className="card border-0 shadow-sm rounded-5 p-4 p-sm-5 bg-white text-center">
                <div
                  className="card-body d-flex flex-column align-items-center justify-content-between"
                  style={{ minHeight: "380px" }}
                >
                  {/* Contenedor Superior: Icono y Saludo */}
                  <div className="w-100 mt-2">
                    {/* Ícono de Perfil dentro de un círculo */}
                    <div
                      className="d-inline-flex align-items-center justify-content-center border border-2 border-dark rounded-circle mb-4"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i className="bi bi-person-fill text-dark fs-1"></i>
                    </div>

                    {/* Título de Bienvenida */}
                    <h2 className="fw-bold text-dark mb-1 fs-3">
                      ¡Bienvenido a Deejs!
                    </h2>

                    {/* SECCIÓN DINÁMICA: VISTA O EDICIÓN */}
                    {!modoEdicion ? (
                      /* === MODO VISTA CON OJITO === */
                      <div className="mt-4 w-100">
                        {/* Bloque de Información Suave */}
                        <div className="bg-light p-3 rounded-4 border border-0 text-start mb-3">
                          <div className="mb-2.5">
                            <small
                              className="text-muted d-block text-uppercase fw-bold"
                              style={{
                                fontSize: "0.65rem",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Nombre
                            </small>
                            <span className="text-dark fw-semibold">
                              {nombre || "Cargando..."}
                            </span>
                          </div>

                          <div className="pt-2 border-top border-secondary-subtle">
                            <small
                              className="text-muted d-block text-uppercase fw-bold"
                              style={{
                                fontSize: "0.65rem",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Correo Electrónico
                            </small>
                            <div className="d-flex justify-content-between align-items-center">
                              {/* 👁️ Lógica del ojito: oculta el correo reemplazando caracteres si mostrarCorreo es false */}
                              <span className="text-dark fw-semibold text-truncate me-2">
                                {mostrarCorreo
                                  ? correo
                                  : correo.replace(/./g, "•")}
                              </span>

                              {/* Botón Ojito Interactivo */}
                              <button
                                type="button"
                                className="btn btn-link p-0 text-secondary border-0 lh-1"
                                onClick={() => setMostrarCorreo(!mostrarCorreo)}
                                title={
                                  mostrarCorreo
                                    ? "Ocultar correo"
                                    : "Mostrar correo"
                                }
                              >
                                <i
                                  className={`bi ${mostrarCorreo ? "bi-eye-slash-fill" : "bi-eye-fill"} fs-5`}
                                ></i>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/*Boton de Editar Perfil */}
                        <button
                          type="button"
                          className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1.5 fw-semibold small transition-all"
                          onClick={() => setModoEdicion(true)}
                        >
                          <i className="bi bi-pencil-square me-1.5"></i>Editar
                          datos
                        </button>
                      </div>
                    ) : (
                      /* === MODO EDICIÓN === */
                      <form
                        onSubmit={handleUpdateSubmit}
                        className="mt-4 text-start w-100"
                      >
                        <div className="mb-3">
                          <label
                            htmlFor="editName"
                            className="form-label text-muted small fw-bold mb-1"
                          >
                            Nombre Completo
                          </label>
                          <input
                            type="text"
                            className="form-control border bg-light py-2 text-dark rounded-3"
                            id="editName"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label
                            htmlFor="editEmail"
                            className="form-label text-muted small fw-bold mb-1"
                          >
                            Correo Electrónico
                          </label>
                          <input
                            type="email"
                            className="form-control border bg-light py-2 text-dark rounded-3"
                            id="editEmail"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                          />
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <button
                            type="button"
                            className="btn btn-light border w-50 py-2 rounded-3 small"
                            onClick={() => setModoEdicion(false)}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="btn btn-dark w-50 py-2 rounded-3 small fw-semibold"
                          >
                            Guardar
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/*Botón Inferior de Cerrar Sesión*/}
                  {!modoEdicion && (
                    <div className="w-100 mt-4">
                      <button
                        type="button"
                        className="btn btn-danger w-100 py-2.5 fw-semibold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                        style={{
                          backgroundColor: "#ff3b30",
                          borderColor: "#ff3b30",
                        }}
                        onClick={handleCerrarSesion}
                      >
                        <i className="bi bi-box-arrow-left fs-5"></i>{" "}
                        {/*Icono bonito agregado*/}
                        Cerrar sesión
                      </button>
                    </div>
                  )}
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
  //Formulario de registro
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            {/* Tarjeta Contenedora del Registro */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="card-body">
                {/* Cabecera del Registro */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-dark mb-1">Crea tu cuenta</h2>
                  <p className="text-muted small">
                    Regístrate para empezar a disfrutar del servicio
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit}>
                  {/* Input de Nombre Completo */}
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      id="registerName"
                      className="form-control bg-light border-0 text-secondary"
                      placeholder="Nombre completo"
                      required
                    />
                    <label htmlFor="registerName" className="text-muted">
                      Nombre completo
                    </label>
                  </div>

                  {/* Input de Email */}
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      id="registerEmail"
                      className="form-control bg-light border-0 text-secondary"
                      placeholder="Dirección de correo"
                      required
                    />
                    <label htmlFor="registerEmail" className="text-muted">
                      Dirección de correo
                    </label>
                  </div>

                  {/* Input de Contraseña */}
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      id="registerPassword"
                      className="form-control bg-light border-0 text-secondary"
                      placeholder="Contraseña"
                      required
                    />
                    <label htmlFor="registerPassword" className="text-muted">
                      Contraseña
                    </label>
                  </div>

                  {/* Términos y Condiciones */}
                  <div className="row my-4 align-items-center">
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="registerTerms"
                          required
                        />
                        <label
                          className="form-check-label small text-secondary"
                          htmlFor="registerTerms"
                        >
                          Acepto los{" "}
                          <a
                            href="#!"
                            className="text-decoration-none fw-semibold text-primary"
                          >
                            Términos de servicio
                          </a>{" "}
                          y la{" "}
                          <a
                            href="#!"
                            className="text-decoration-none fw-semibold text-primary"
                          >
                            Política de privacidad
                          </a>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Registro */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2.5 fw-bold text-uppercase shadow-sm mb-4 rounded-3"
                  >
                    Registrarse
                  </button>

                  {/* Volver al Login y Redes Sociales */}
                  <div className="text-center">
                    <p className="small text-muted mb-4">
                      ¿Ya tienes una cuenta?
                      {/*BOTÓN DE CAMBIO: Al hacer clic, vuelve a poner el estado en "login" */}
                      <button
                        type="button"
                        className="btn btn-link p-0 fw-semibold text-decoration-none align-baseline ms-1"
                        onClick={() => setVistaActual("login")}
                      >
                        Iniciar sesión
                      </button>
                    </p>

                    <div className="position-relative mb-4">
                      <hr className="text-muted" />
                      <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                        O regístrate con
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
export default Perfil;
