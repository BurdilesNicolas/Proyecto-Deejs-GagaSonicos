import React, { useState } from "react";
import Login from "./login";
import Registro from "./Registro";
import "../estilos/Perfil.css";



function Perfil() {
  //Estado de autenticación
  const [estaLogueado, setEstaLogueado] = useState(
    !!localStorage.getItem("userToken"),
  );
  //Estado de vista interna
  const [vistaActual, setVistaActual] = useState("login");

  //=======================Datos del usuario========================
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  //=======================Estado de la interfaz====================
  const [mostrarCorreo, setMostrarCorreo] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  // Copia temporal de los datos mientras se edita (así "Cancelar" no pierde nada)
  const [edicion, setEdicion] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
  });

  //Funciones de acción
  //Inicio de sesión
  const handleLoginSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue por completo
    localStorage.setItem("userToken", "token-valido-123"); // Guarda la sesión
    setEstaLogueado(true); // Cambia el estado para mostrar el Perfil
  };
  //Registrarse
  const handleRegisterSubmit = (
    nombreIngresado,
    apellidoIngresado,
    correoIngresado,
    passwordIngresado,
  ) => {
    setNombre(nombreIngresado);
    setApellido(apellidoIngresado);
    setCorreo(correoIngresado);
    setPassword(passwordIngresado);
    localStorage.setItem("userToken", "token-valido-123");
    setEstaLogueado(true);
  };
  //Cerrar sesión
  const handleCerrarSesion = () => {
    localStorage.removeItem("userToken"); // Borra la sesión de la memoria
    setEstaLogueado(false); // Quita el Perfil
    setVistaActual("login"); // Deja el Login listo para volver a entrar
  };
  //Editar datos
  const handleEditar = () => {
    setEdicion({ nombre, apellido, correo, password: "" });
    setModoEdicion(true);
  };
  const handleCambioEdicion = (e) => {
    setEdicion({ ...edicion, [e.target.name]: e.target.value });
  };
  const handleUpdateSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue por completo
    setNombre(edicion.nombre);
    setApellido(edicion.apellido);
    setCorreo(edicion.correo);
    // La contraseña solo cambia si escribió una nueva
    if (edicion.password) setPassword(edicion.password);
    setModoEdicion(false);
    alert("¡Cambios guardados con éxito!");
  };

  //=======================VISTAS DE PERFIL=========================
  //Perfil de usuario
  if (estaLogueado) {
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    // Iniciales para el avatar (nombre + apellido)
    const iniciales = `${nombre.trim()[0] || ""}${apellido.trim()[0] || ""}`.toUpperCase();

    // Fila de información reutilizable
    const Fila = ({ icono, etiqueta, valor, primera, accion }) => (
      <div
        className={`perfil-fila d-flex align-items-center gap-3 p-3 ${primera ? "" : "border-top"}`}
      >
        <div
          className="perfil-icono d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
        >
          <i className={`bi ${icono} fs-5`}></i>
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <small
            className="perfil-etiqueta text-white-50 d-block text-uppercase fw-bold"
          >
            {etiqueta}
          </small>
          <span className="text-white fw-semibold text-truncate d-block">
            {valor}
          </span>
        </div>
        {accion}
      </div>
    );

    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 auth-page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
              <div className="card rounded-4 p-4 text-white auth-card">
                <div className="card-body text-center">
                  {/* Avatar */}
                  <div
                    className="perfil-avatar d-flex align-items-center justify-content-center rounded-circle mx-auto fw-bold text-white"
                  >
                    {iniciales || <i className="bi bi-person-fill fs-1"></i>}
                  </div>

                  {/* Título */}
                  <h2 className="fw-bold text-white fs-4 mt-3 mb-1">
                    {nombreCompleto || "Mi perfil"}
                  </h2>
                  <p className="text-white-50 small mb-0">Bienvenido a Deejs</p>

                  {/* SECCIÓN DINÁMICA: VISTA O EDICIÓN */}
                  {!modoEdicion ? (
                    <div className="mt-4 text-start">
                      <div
                        className="perfil-grupo rounded-4 overflow-hidden"
                      >
                        <Fila
                          primera
                          icono="bi-person"
                          etiqueta="Nombre"
                          valor={nombre || "Sin definir"}
                        />
                        <Fila
                          icono="bi-person-vcard"
                          etiqueta="Apellido"
                          valor={apellido || "Sin definir"}
                        />
                        <Fila
                          icono="bi-envelope"
                          etiqueta="Correo electrónico"
                          valor={
                            correo
                              ? mostrarCorreo
                                ? correo
                                : correo.replace(/./g, "•")
                              : "Sin definir"
                          }
                          accion={
                            <button
                              type="button"
                              className="btn btn-link perfil-link p-0 border-0 lh-1 flex-shrink-0"
                              onClick={() => setMostrarCorreo(!mostrarCorreo)}
                              title={
                                mostrarCorreo
                                  ? "Ocultar correo"
                                  : "Mostrar correo"
                              }
                            >
                              <i
                                className={`bi ${mostrarCorreo ? "bi-eye-slash" : "bi-eye"} fs-5`}
                              ></i>
                            </button>
                          }
                        />
                        <Fila
                          icono="bi-lock"
                          etiqueta="Contraseña"
                          valor={password ? "••••••••" : "Sin definir"}
                        />
                      </div>

                      {/* Acciones */}
                      <div className="d-grid gap-2 mt-4">
                        <button
                          type="button"
                          className="btn btn-light py-2 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2 auth-btn-primary"
                          onClick={handleEditar}
                        >
                          <i className="bi bi-pencil-square"></i>
                          Editar datos
                        </button>
                        <button
                          type="button"
                          className="btn btn-salir py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2"
                          onClick={handleCerrarSesion}
                        >
                          <i className="bi bi-box-arrow-left"></i>
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* === MODO EDICIÓN === */
                    <form
                      onSubmit={handleUpdateSubmit}
                      className="mt-4 text-start"
                    >
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <div className="form-floating">
                            <input
                              type="text"
                              id="editName"
                              name="nombre"
                              className="form-control perfil-input bg-white border-0 text-dark"
                              placeholder="Nombre"
                              value={edicion.nombre}
                              onChange={handleCambioEdicion}
                              required
                            />
                            <label htmlFor="editName" className="text-muted">
                              Nombre
                            </label>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="form-floating">
                            <input
                              type="text"
                              id="editLastName"
                              name="apellido"
                              className="form-control perfil-input bg-white border-0 text-dark"
                              placeholder="Apellido"
                              value={edicion.apellido}
                              onChange={handleCambioEdicion}
                              required
                            />
                            <label htmlFor="editLastName" className="text-muted">
                              Apellido
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="form-floating mb-3">
                        <input
                          type="email"
                          id="editEmail"
                          name="correo"
                          className="form-control perfil-input bg-white border-0 text-dark"
                          placeholder="Dirección de correo"
                          value={edicion.correo}
                          onChange={handleCambioEdicion}
                          required
                        />
                        <label htmlFor="editEmail" className="text-muted">
                          Dirección de correo
                        </label>
                      </div>

                      <div className="form-floating mb-1">
                        <input
                          type="password"
                          id="editPassword"
                          name="password"
                          className="form-control perfil-input bg-white border-0 text-dark"
                          placeholder="Nueva contraseña"
                          value={edicion.password}
                          onChange={handleCambioEdicion}
                          autoComplete="new-password"
                        />
                        <label htmlFor="editPassword" className="text-muted">
                          Nueva contraseña
                        </label>
                      </div>
                      <small className="text-white-50 d-block mb-3">
                        Déjala vacía si no quieres cambiarla.
                      </small>

                      <div className="d-flex gap-2 mt-4">
                        <button
                          type="button"
                          className="btn btn-cancelar w-50 py-2 rounded-3 fw-semibold"
                          onClick={() => setModoEdicion(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="btn btn-light w-50 py-2 rounded-3 fw-bold auth-btn-primary"
                        >
                          Guardar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  //Formulario de inicio de sesión (usa login.jsx)
  if (vistaActual === "login") {
    return (
      <Login
        onLogin={handleLoginSubmit}
        onIrARegistro={() => setVistaActual("registro")}
      />
    );
  }

  //Formulario de registro (usa Registro.jsx)
  return (
    <Registro
      onRegistro={handleRegisterSubmit}
      onIrALogin={() => setVistaActual("login")}
    />
  );
}
export default Perfil;
