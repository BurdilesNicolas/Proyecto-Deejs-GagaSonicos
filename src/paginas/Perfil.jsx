import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./Login";
import Registro from "./Registro";
import { auth } from "../services/firebase";
import {
  registerUser,
  loginUser,
  logoutUser
} from "../services/auth";
import {
  guardarPerfil,
  obtenerPerfil
} from "../services/userService";
import "../estilos/Perfil.css";

const normalizarCorreo = (correo) => correo.trim().toLowerCase();

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [vistaActual, setVistaActual] = useState("login");
  const [mostrarCorreo, setMostrarCorreo] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [errorEdicion, setErrorEdicion] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  const [edicion, setEdicion] = useState({
    nombre: "",
    apellido: ""
  });

  // Detectar automáticamente si hay una sesión iniciada
  useEffect(() => {
    const cancelarObservador = onAuthStateChanged(auth, async (user) => {
      setCargando(true);

      if (user) {
        try {
          const datosPerfil = await obtenerPerfil(user.uid);

          setUsuario({
            uid: user.uid,
            correo: user.email,
            nombre: datosPerfil?.nombre || "",
            apellido: datosPerfil?.apellido || ""
          });
        } catch (error) {
          console.error("Error al obtener el perfil:", error);
          setUsuario({
            uid: user.uid,
            correo: user.email,
            nombre: "",
            apellido: ""
          });
        }
      } else {
        setUsuario(null);
      }

      setCargando(false);
    });

    return () => cancelarObservador();
  }, []);

  // Iniciar sesión
  const handleLogin = async (correo, password) => {
    const email = normalizarCorreo(correo);
    await loginUser(email, password);
  };

  // Registrar usuario
  const handleRegistro = async (nombre, apellido, correo, password) => {
    const email = normalizarCorreo(correo);

    const credencial = await registerUser(email, password);

    await guardarPerfil(credencial.user.uid, {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: email,
      rol: "usuario"
    });
  };

  // Cerrar sesión
  const handleCerrarSesion = async () => {
    try {
      await logoutUser();
      setModoEdicion(false);
      setMostrarCorreo(false);
      setVistaActual("login");
      setErrorGeneral("");
    } catch (error) {
      setErrorGeneral("No se pudo cerrar la sesión.");
    }
  };

  // Preparar edición
  const handleEditar = () => {
    setEdicion({
      nombre: usuario.nombre,
      apellido: usuario.apellido
    });

    setErrorEdicion("");
    setModoEdicion(true);
  };

  // Cambiar datos del formulario
  const handleCambioEdicion = (e) => {
    setEdicion({
      ...edicion,
      [e.target.name]: e.target.value
    });
  };

  // Guardar cambios en Firestore
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setErrorEdicion("");

    try {
      const actualizado = {
        ...usuario,
        nombre: edicion.nombre.trim(),
        apellido: edicion.apellido.trim()
      };

      await guardarPerfil(usuario.uid, {
        nombre: actualizado.nombre,
        apellido: actualizado.apellido,
        correo: usuario.correo
      });

      setUsuario(actualizado);
      setModoEdicion(false);
      alert("¡Cambios guardados con éxito!");
    } catch (error) {
      console.error(error);
      setErrorEdicion("No se pudieron guardar los cambios.");
    }
  };

  // Esperar a que Firebase compruebe la sesión
  if (cargando) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center auth-page">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Perfil del usuario
  if (usuario) {
    const { nombre, apellido, correo } = usuario;
    const nombreCompleto = `${nombre} ${apellido}`.trim();

    const iniciales =
      `${nombre.trim()[0] || ""}${apellido.trim()[0] || ""}`.toUpperCase();

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

                  {/* Avatar */}
                  <div className="perfil-avatar d-flex align-items-center justify-content-center rounded-circle mx-auto fw-bold text-white">
                    {iniciales || (
                      <i className="bi bi-person-fill fs-1"></i>
                    )}
                  </div>

                  <h2 className="fw-bold text-white fs-4 mt-3 mb-1">
                    {nombreCompleto || "Mi perfil"}
                  </h2>

                  <p className="text-white-50 small mb-0">
                    Bienvenido a Deejs
                  </p>

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
                          valor="Protegida por Firebase"
                        />
                      </div>

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

                      {errorGeneral && (
                        <div className="auth-error mt-3">
                          {errorGeneral}
                        </div>
                      )}
                    </div>
                  ) : (
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

                      {errorEdicion && (
                        <div className="auth-error mb-3">
                          {errorEdicion}
                        </div>
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

  // Formulario de inicio de sesión
  if (vistaActual === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onIrARegistro={() => setVistaActual("registro")}
      />
    );
  }

  // Formulario de registro
  return (
    <Registro
      onRegistro={handleRegistro}
      onIrALogin={() => setVistaActual("login")}
    />
  );
}

export default Perfil;