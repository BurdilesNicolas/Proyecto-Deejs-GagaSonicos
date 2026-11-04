//Perfil.jsx Sección de perfil de usuario, permite iniciar sesión, registrarse, ver y editar información personal, cambiar contraseña y cerrar sesión.
import React, { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./Login";
import Registro from "./Registro";
import SelectorFoto from "../componentes/SelectorFoto"; //Importa el componente SelectorFoto que permite al usuario elegir una foto de perfil, cambiarla o quitarla.
import { auth } from "../services/firebase";
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword
} from "../services/auth";
import {
  guardarPerfil,
  obtenerPerfil
} from "../services/userService"; //Importa las funciones guardarPerfil y obtenerPerfil del servicio userService para guardar y obtener los datos del perfil de usuario en Firestore
import "../estilos/Perfil.css";

const normalizarCorreo = (correo) => correo.trim().toLowerCase(); //Función que normaliza el correo electrónico elimina espacios en blanco y lo convirte a minúsculas.

// Traducir errores de Firebase al enviar el correo de cambio de contraseña
const mensajeErrorPassword = (codigo) => { 
  switch (codigo) {
    case "auth/too-many-requests":
      return "Demasiados intentos. Inténtalo más tarde.";
    case "auth/network-request-failed":
      return "Error de conexión. Revisá tu internet.";
    default:
      return "No se pudo enviar el correo. Intentá nuevamente.";
  }
};

// Fila de información reutilizable
function Fila({ icono, etiqueta, valor, accion }) {
  return (
    <div className="perfil-fila">
      <div className="perfil-icono">
        <i className={`bi ${icono} fs-5`}></i>
      </div>

      <div className="flex-grow-1 overflow-hidden">
        <small className="perfil-etiqueta">{etiqueta}</small>
        <span className="perfil-valor">{valor}</span>
      </div>

      {accion}
    </div>
  );
}
//Componente principal Perfil que maneja la lógica de autenticación, visualización y edición del perfil de usuario.
function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [vistaActual, setVistaActual] = useState("login");
  const [mostrarCorreo, setMostrarCorreo] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [errorEdicion, setErrorEdicion] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  // Cambio de contraseña: { tipo: "ok" | "error", texto }
  const [avisoPassword, setAvisoPassword] = useState(null);
  const [enviandoPassword, setEnviandoPassword] = useState(false);

  const [edicion, setEdicion] = useState({
    nombre: "",
    apellido: "",
    foto: ""
  });

  // Mientras se registra un usuario, el observador de sesión no carga el perfil
  // (todavía no se guardó); lo carga handleRegistro cuando termina.
  const registrandoRef = useRef(false);

  // Detectar automáticamente si hay una sesión iniciada
  useEffect(() => {
    const cancelarObservador = onAuthStateChanged(auth, async (user) => {
      if (registrandoRef.current) return;

      setCargando(true); //Mientras se carga la sesión, se muestra un spinner de carga

      if (user) {
        try {
          const datosPerfil = await obtenerPerfil(user.uid); //Obtiene los datos del perfil del usuario desde Firestore utilizando la función obtenerPerfil y el uid del usuario autenticado

          setUsuario({
            uid: user.uid,
            correo: user.email,
            nombre: datosPerfil?.nombre || "",
            apellido: datosPerfil?.apellido || "",
            foto: datosPerfil?.foto || ""
          });
        } catch (error) {
          console.error("Error al obtener el perfil:", error);
          setUsuario({
            uid: user.uid,
            correo: user.email,
            nombre: "",
            apellido: "",
            foto: ""
          });
        }
      } else {
        setUsuario(null);
      }

      setCargando(false);
    });

    return () => cancelarObservador(); //Cuando el componente Perfil se desmonta, se cancela el observador de sesión para evitar fugas de memoria y actualizaciones innecesarias del estado.
  }, []);

  // Iniciar sesión
  const handleLogin = async (correo, password) => { //Función asincrona que se ejecuta cuando el usuario inicia sesión. Normaliza el correo electrónico y llama a loginUser con el correo y la contraseña proporcionados
    const email = normalizarCorreo(correo);
    await loginUser(email, password);
  };

  // Recuperar contraseña desde el login
  const handleRecuperarPassword = async (correo) => { //Función asincrona que se ejecuta cuando el usuario solicita recuperar su contraseña. Normaliza el correo electrónico y llama a resetPassword con el correo proporcionado
    await resetPassword(normalizarCorreo(correo));
  };

  // Registrar usuario
  const handleRegistro = async (nombre, apellido, correo, password, foto) => { //Función asincrona que se ejecuta cuando el usuario se registra. Normaliza el correo electrónico, llama a registerUser con el correo y la contraseña proporcionados, guarda los datos del perfil en Firestore y actualiza el estado del usuario
    registrandoRef.current = true;

    try {
      const email = normalizarCorreo(correo);
      const credencial = await registerUser(email, password);
      const uid = credencial.user.uid;

      const datos = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: email,
        rol: "usuario",
        foto: foto || ""
      };

      try {
        await guardarPerfil(uid, datos);
      } catch (error) {
        console.error("No se pudo guardar el perfil:", error);
        setErrorGeneral(
          "Tu cuenta se creó, pero no se pudieron guardar todos tus datos. Revísalos desde «Editar perfil»."
        );
      }

      setUsuario({
        uid,
        correo: email,
        nombre: datos.nombre,
        apellido: datos.apellido,
        foto: datos.foto
      });
    } finally {
      registrandoRef.current = false;
    }
  };

  // Cerrar sesión
  const handleCerrarSesion = async () => { //Función asincrona que se ejecuta cuando el usuario cierra sesión. Llama a logoutUser para cerrar la sesión en Firebase Authentication y actualiza el estado del componente para reflejar que no hay un usuario autenticado
    try {
      await logoutUser();
      setModoEdicion(false);
      setMostrarCorreo(false);
      setAvisoPassword(null);
      setVistaActual("login");
      setErrorGeneral("");
    } catch (error) {
      setErrorGeneral("No se pudo cerrar la sesión.");
    }
  };

  // Preparar edición
  const handleEditar = () => { //Función que se ejecuta cuando el usuario hace click en el botón de editar perfil. Actualiza el estado del componente para reflejar que se está en modo edición y carga los datos actuales del usuario en el formulario de edición
    setEdicion({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      foto: usuario.foto || ""
    });

    setErrorEdicion("");
    setAvisoPassword(null);
    setModoEdicion(true);
  };

  // Cambiar datos del formulario
  const handleCambioEdicion = (e) => { //Función que se ejecuta cuando el usuario cambia algún dato en el formulario de edición. 
    setEdicion({
      ...edicion,
      [e.target.name]: e.target.value //Actualiza el estado del componente con el valor ingresado en el campo correspondiente (nombre o apellido) utilizando la propiedad name del input para identificar qué campo se está modificando
    });
  };

  // Guardar cambios en Firestore
  const handleUpdateSubmit = async (e) => { //Función asincrona que se ejecuta cuando el usuario envía el formulario de edición. Valida los datos ingresados, llama a guardarPerfil para actualizar los datos del perfil en Firestore y actualiza el estado del componente con los nuevos datos del usuario
    e.preventDefault();
    setErrorEdicion("");
    setGuardando(true);

    try {
      const actualizado = {
        ...usuario,
        nombre: edicion.nombre.trim(),
        apellido: edicion.apellido.trim(),
        foto: edicion.foto
      };

      await guardarPerfil(usuario.uid, {
        nombre: actualizado.nombre,
        apellido: actualizado.apellido,
        correo: usuario.correo,
        foto: actualizado.foto
      });

      setUsuario(actualizado);
      setModoEdicion(false);
      alert("¡Cambios guardados con éxito!");
    } catch (error) {
      console.error(error);
      setErrorEdicion("No se pudieron guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  // Cambiar contraseña: Firebase envía un correo con un enlace seguro
  const handleCambiarPassword = async () => { //Función asincrona que se ejecuta cuando el usuario solicita cambiar su contraseña. Llama a resetPassword con el correo del usuario autenticado
    setAvisoPassword(null);
    setEnviandoPassword(true);

    try {
      await resetPassword(usuario.correo);
      setAvisoPassword({
        tipo: "ok",
        texto: `Te enviamos un correo a ${usuario.correo} con el enlace para cambiar tu contraseña. Revisa también la carpeta de spam.`
      }); //Muestra un mensaje de éxito indicando que se envió un correo con el enlace para cambiar la contraseña
    } catch (error) {
      console.error(error);
      setAvisoPassword({
        tipo: "error",
        texto: mensajeErrorPassword(error.code)
      }); //Muestra un mensaje de error indicando que no se pudo enviar el correo y proporciona una descripción del error según el código de error devuelto por Firebase
    } finally {
      setEnviandoPassword(false);
    }
  };

  // Esperar a que Firebase compruebe la sesión
  if (cargando) {
    return (
      <div className="auth-page">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Perfil del usuario
  if (usuario) { //Si hay un usuario autenticado, se muestra la información del perfil y las opciones para editarlo, cambiar la contraseña o cerrar sesión
    const { nombre, apellido, correo, foto } = usuario;
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    const iniciales =
      `${nombre.trim()[0] || ""}${apellido.trim()[0] || ""}`.toUpperCase();

    return ( //Retorna el JSX del componente Perfil que muestra la información del usuario, un botón para editar el perfil, un botón para cerrar sesión y un formulario de edición con campos
      <div className="auth-page">
        <div className="perfil-tarjeta">

          {/* Columna lateral: foto, nombre y acciones */}
          <aside className="perfil-lateral">
            <div className="perfil-avatar">
              {foto ? (
                <img src={foto} alt="Foto de perfil" />
              ) : (
                iniciales || <i className="bi bi-person-fill"></i>
              )}
            </div>

            <h2 className="perfil-nombre">{nombreCompleto || "Mi perfil"}</h2>

            <span className="perfil-insignia">
              <i className="bi bi-star-fill"></i>
              Cliente de Deej&apos;s
            </span>

            <div className="perfil-acciones">
              {!modoEdicion && (
                <button
                  type="button"
                  className="btn auth-btn-primary py-2 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleEditar} //Ejecuta la función handleEditar para cambiar al modo edición y cargar los datos actuales del usuario en el formulario de edición
                >
                  <i className="bi bi-pencil-square"></i>
                  Editar perfil
                </button>
              )}

              <button
                type="button"
                className="btn btn-salir py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2"
                onClick={handleCerrarSesion} //Ejecuta la función handleCerrarSesion para cerrar la sesión del usuario y actualizar el estado del componente para reflejar que no hay un usuario autenticado
              >
                <i className="bi bi-box-arrow-left"></i>
                Cerrar sesión
              </button>
            </div>

            {errorGeneral && (
              <div className="auth-error w-100 mt-1">{errorGeneral}</div>
            )}
          </aside>

          {/* Columna principal: información o formulario de edición */}
          <section className="perfil-principal">
            {!modoEdicion ? (
              <>
                <h3 className="perfil-seccion-titulo">Información personal</h3>

                <div className="perfil-grupo">
                  <Fila
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
                        onClick={() => setMostrarCorreo(!mostrarCorreo)} //Cambia el estado mostrarCorreo para alternar entre mostrar y ocultar el correo electrónico del usuario
                        title={mostrarCorreo ? "Ocultar correo" : "Mostrar correo"}
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
              </>
            ) : (
              <>
                <h3 className="perfil-seccion-titulo">Editar perfil</h3>

                <form onSubmit={handleUpdateSubmit}> {/* Ejecuta la función handleUpdateSubmit cuando el usuario envía el formulario de edición para guardar los cambios en Firestore */}

                  {/* Foto de perfil con vista previa */}
                  <div className="mb-4">
                    <SelectorFoto
                      value={edicion.foto}
                      onChange={(f) => setEdicion({ ...edicion, foto: f })} //Actualiza el estado del componente con la nueva foto de perfil seleccionada por el usuario utilizando la función onChange del componente SelectorFoto
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-12 col-sm-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          id="editName"
                          name="nombre"
                          className="form-control perfil-input bg-white border-0 text-dark"
                          placeholder="Nombre"
                          value={edicion.nombre}
                          onChange={handleCambioEdicion} //ejecuta la función handleCambioEdicion cuando el usuario cambia el valor del campo nombre para actualizar el estado del componente con el nuevo valor ingresado
                          required //Establece que el campo nombre es obligatorio para enviar el formulario
                        />
                        <label htmlFor="editName" className="text-muted">
                          Nombre
                        </label>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          id="editLastName"
                          name="apellido"
                          className="form-control perfil-input bg-white border-0 text-dark"
                          placeholder="Apellido"
                          value={edicion.apellido}
                          onChange={handleCambioEdicion} //ejecuta la función handleCambioEdicion cuando el usuario cambia el valor del campo apellido para actualizar el estado del componente con el nuevo valor ingresado
                          required //Establece que el campo apellido es obligatorio para enviar el formulario
                        />
                        <label htmlFor="editLastName" className="text-muted">
                          Apellido
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Cambiar contraseña (por correo, con Firebase) */}
                  <div className="perfil-bloque-password mb-3">
                    <div className="perfil-icono">
                      <i className="bi bi-lock fs-5"></i>
                    </div>

                    <div className="flex-grow-1">
                      <strong className="d-block">Contraseña</strong>
                      <small className="auth-suave">
                        Te enviaremos un correo a {correo} con un enlace seguro
                        para crear una nueva.
                      </small>
                    </div>

                    <button
                      type="button"
                      className="btn auth-social btn-sm px-3"
                      onClick={handleCambiarPassword} //Ejecuta la función handleCambiarPassword cuando el usuario hace click en el botón para enviar un correo con un enlace seguro para cambiar la contraseña
                      disabled={enviandoPassword}
                    >
                      {enviandoPassword ? "Enviando..." : "Cambiar contraseña"}
                    </button>
                  </div>

                  {avisoPassword && (
                    <div
                      className={`${avisoPassword.tipo === "ok" ? "auth-ok" : "auth-error"} mb-3`}
                    >
                      {avisoPassword.texto}
                    </div>
                  )}

                  {errorEdicion && (
                    <div className="auth-error mb-3">{errorEdicion}</div>
                  )}

                  <div className="perfil-botones-form">
                    <button
                      type="button"
                      className="btn btn-cancelar py-2 rounded-3 fw-semibold"
                      onClick={() => setModoEdicion(false)} //Ejecuta la función setModoEdicion con el valor false cuando el usuario hace click en el botón de cancelar para salir del modo edición y volver a la vista de información del perfil
                      disabled={guardando}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="btn auth-btn-primary py-2 rounded-3 fw-bold"
                      disabled={guardando}
                    >
                      {guardando ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    );
  }

  // Formulario de inicio de sesión
  if (vistaActual === "login") {
    return (
      <Login
        onLogin={handleLogin} //Se llama a la función handleLogin cuando el usuario envía el formulario de inicio de sesión
        onRecuperarPassword={handleRecuperarPassword} //Se llama a la función handleRecuperarPassword cuando el usuario solicita recuperar su contraseña
        onIrARegistro={() => setVistaActual("registro")} //Se cambia la vista actual a "registro" cuando el usuario hace click en el enlace para registrarse
      />
    );
  }

  // Formulario de registro
  return (
    <Registro
      onRegistro={handleRegistro} //Se llama a la función handleRegistro cuando el usuario envía el formulario de registro
      onIrALogin={() => setVistaActual("login")} //Se cambia la vista actual a "login" cuando el usuario hace click en el enlace para iniciar sesión
    />
  );
}

export default Perfil;