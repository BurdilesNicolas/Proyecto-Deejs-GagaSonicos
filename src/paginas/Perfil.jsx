import React, { useState } from "react";
import Login from "./Login";
import Registro from "./Registro";
import SelectorFoto from "../componentes/SelectorFoto";
import "../estilos/Perfil.css";

//=======================Almacenamiento (localStorage)========================
//es solo para prototipo. Ya que en una app real los usuarios y contraseña deben vivir en un backend (con la contraseña cifrada), no en el navegador.
const CLAVE_USUARIOS = "usuarios"; // lista de todos los usuarios registrados
const CLAVE_SESION = "sesionCorreo"; // correo del usuario con sesión abierta
const CLAVE_TOKEN = "userToken";

const leerUsuarios = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIOS)) || [];
  } catch {
    return [];
  }
};
const guardarUsuarios = (lista) =>
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));

const normalizarCorreo = (correo) => correo.trim().toLowerCase();

// Recupera al usuario de la sesión guardada (o null si no hay sesión)
const recuperarSesion = () => {
  if (!localStorage.getItem(CLAVE_TOKEN)) return null;
  const correo = localStorage.getItem(CLAVE_SESION);
  return leerUsuarios().find((u) => u.correo === correo) || null;
};

function Perfil() {
  //=======================Estado========================
  // usuario = datos del usuario con sesión abierta, o null si no hay sesión
  const [usuario, setUsuario] = useState(recuperarSesion);
  const estaLogueado = usuario !== null;

  //Estado de vista interna (login / registro)
  const [vistaActual, setVistaActual] = useState("login");

  const [mostrarCorreo, setMostrarCorreo] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState("");
  // Copia temporal de los datos mientras se edita (así "Cancelar" no pierde nada)
  const [edicion, setEdicion] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    foto: "",
  });

  //=======================Acciones========================
  const iniciarSesion = (u) => {
    localStorage.setItem(CLAVE_TOKEN, "token-valido-123");
    localStorage.setItem(CLAVE_SESION, u.correo);
    setUsuario(u);
  };

  //Inicio de sesión: devuelve un texto de error o null
  const handleLogin = (correo, password) => {
    const email = normalizarCorreo(correo);
    const encontrado = leerUsuarios().find((u) => u.correo === email);
    if (!encontrado || encontrado.password !== password) {
      return "Correo o contraseña incorrectos.";
    }
    iniciarSesion(encontrado);
    return null;
  };

  //Registrarse: devuelve un texto de error o null
  const handleRegistro = (nombre, apellido, correo, password, foto) => {
    const email = normalizarCorreo(correo);
    const lista = leerUsuarios();
    if (lista.some((u) => u.correo === email)) {
      return "Ya existe una cuenta con ese correo.";
    }
    const nuevo = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: email,
      password,
      foto,
    };
    guardarUsuarios([...lista, nuevo]);
    iniciarSesion(nuevo);
    return null;
  };

  //Cerrar sesión (los datos del usuario se conservan para su próximo ingreso)
  const handleCerrarSesion = () => {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_SESION);
    setUsuario(null);
    setModoEdicion(false);
    setMostrarCorreo(false);
    setVistaActual("login");
  };

  //Editar datos
  const handleEditar = () => {
    setEdicion({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      password: "",
      foto: usuario.foto || "",
    });
    setErrorEdicion("");
    setModoEdicion(true);
  };
  const handleCambioEdicion = (e) => {
    setEdicion({ ...edicion, [e.target.name]: e.target.value });
  };
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const email = normalizarCorreo(edicion.correo);
    const lista = leerUsuarios();

    // El nuevo correo no puede pertenecer a otro usuario
    if (lista.some((u) => u.correo === email && u.correo !== usuario.correo)) {
      setErrorEdicion("Ese correo ya está en uso por otra cuenta.");
      return;
    }

    const actualizado = {
      nombre: edicion.nombre.trim(),
      apellido: edicion.apellido.trim(),
      correo: email,
      // La contraseña solo cambia si escribió una nueva
      password: edicion.password || usuario.password,
      foto: edicion.foto,
    };

    guardarUsuarios(
      lista.map((u) => (u.correo === usuario.correo ? actualizado : u)),
    );
    localStorage.setItem(CLAVE_SESION, actualizado.correo);
    setUsuario(actualizado);
    setModoEdicion(false);
    alert("¡Cambios guardados con éxito!");
  };

  //=======================VISTAS=========================
  //Perfil de usuario
  if (estaLogueado) {
    const { nombre, apellido, correo, password, foto } = usuario;
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    // Iniciales para el avatar cuando no hay foto
    const iniciales =
      `${nombre.trim()[0] || ""}${apellido.trim()[0] || ""}`.toUpperCase();

    // Fila de información reutilizable
    const Fila = ({ icono, etiqueta, valor, primera, accion }) => (
      <div
        className={`perfil-fila d-flex align-items-center gap-3 p-3 ${primera ? "" : "border-top"}`}
      >
        <div className="perfil-icono d-flex align-items-center justify-content-center rounded-3 flex-shrink-0">
          <i className={`bi ${icono} fs-5`}></i>
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <small className="perfil-etiqueta text-white-50 d-block text-uppercase fw-bold">
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
                  {/* Avatar: foto, o iniciales si no hay foto */}
                  <div className="perfil-avatar d-flex align-items-center justify-content-center rounded-circle mx-auto fw-bold text-white">
                    {foto ? (
                      <img src={foto} alt="Foto de perfil" />
                    ) : (
                      iniciales || <i className="bi bi-person-fill fs-1"></i>
                    )}
                  </div>

                  {/* Título */}
                  <h2 className="fw-bold text-white fs-4 mt-3 mb-1">
                    {nombreCompleto || "Mi perfil"}
                  </h2>
                  <p className="text-white-50 small mb-0">Bienvenido a Deejs</p>

                  {/* SECCIÓN DINÁMICA: VISTA O EDICIÓN */}
                  {!modoEdicion ? (
                    <div className="mt-4 text-start">
                      <div className="perfil-grupo rounded-4 overflow-hidden">
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
                      {/* Foto de perfil */}
                      <div className="mb-4">
                        <SelectorFoto
                          value={edicion.foto}
                          onChange={(f) => setEdicion({ ...edicion, foto: f })}
                        />
                      </div>

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

                      {errorEdicion && (
                        <div className="auth-error mb-3">{errorEdicion}</div>
                      )}

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
        onLogin={handleLogin}
        onIrARegistro={() => setVistaActual("registro")}
      />
    );
  }

  //Formulario de registro (usa Registro.jsx)
  return (
    <Registro
      onRegistro={handleRegistro}
      onIrALogin={() => setVistaActual("login")}
    />
  );
}
export default Perfil;