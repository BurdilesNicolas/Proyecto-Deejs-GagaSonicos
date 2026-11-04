//Login.jsx Sección de inicio de sesión
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../estilos/Perfil.css";

// Props (las pasa Perfil.jsx):
//  onLogin(correo, password)
//  onIrARegistro()
//  onRecuperarPassword(correo)
function Login({ onLogin, onIrARegistro, onRecuperarPassword }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Traducir errores de Firebase al iniciar sesión
  const obtenerMensajeError = (codigo) => {
    switch (codigo) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Correo o contraseña incorrectos.";

      case "auth/invalid-email":
        return "El correo electrónico no es válido.";

      case "auth/too-many-requests":
        return "Demasiados intentos. Inténtalo más tarde.";

      case "auth/network-request-failed":
        return "Error de conexión. Revisá tu internet.";

      default:
        return "No se pudo iniciar sesión. Intentá nuevamente.";
    }
  };

  // Traducir errores de Firebase al recuperar la contraseña
  const obtenerMensajeRecuperacion = (codigo) => {
    switch (codigo) {
      case "auth/invalid-email":
      case "auth/missing-email":
        return "El correo electrónico no es válido.";

      case "auth/user-not-found":
        return "No encontramos una cuenta con ese correo.";

      case "auth/too-many-requests":
        return "Demasiados intentos. Inténtalo más tarde.";

      case "auth/network-request-failed":
        return "Error de conexión. Revisá tu internet.";

      default:
        return "No se pudo enviar el correo. Intentá nuevamente.";
    }
  };

  // Iniciar sesión con Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAviso("");
    setCargando(true);

    try {
      if (onLogin) {
        await onLogin(correo, password);
      }
    } catch (error) {
      setError(obtenerMensajeError(error.code));
    } finally {
      setCargando(false);
    }
  };

  // Enviar el correo para restablecer la contraseña
  const handleRecuperar = async () => {
    setError("");
    setAviso("");

    if (!correo.trim()) {
      setError(
        "Escribe tu correo en el campo de arriba y vuelve a presionar «¿Olvidaste tu contraseña?»."
      );
      return;
    }

    setEnviando(true);

    try {
      if (onRecuperarPassword) {
        await onRecuperarPassword(correo);
      }
      setAviso(
        "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña. Revisa también la carpeta de spam."
      );
    } catch (error) {
      setError(obtenerMensajeRecuperacion(error.code));
    } finally {
      setEnviando(false);
    }
  };

  return ( //Retorna el JSX del componente dinámico Login
    <div className="auth-page">
      <div className="auth-contenedor">
        <div className="card rounded-4 p-4 text-white auth-card">
          <div className="card-body">

            {/* Cabecera del Login */}
            <div className="text-center mb-4">
              <h2 className="fw-bold text-white mb-1">¡Bienvenido!</h2>
              <p className="auth-suave small mb-0">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit}> {/*Retorna el JSX del formulario de inicio de sesión que contiene campos para correo y contraseña, botones para iniciar sesión, registrarse y recuperar la contraseña, y mensajes de error o aviso según corresponda*/}

              {/* Email */}
              <div className="form-floating mb-3">
                <input
                  type="email"
                  id="form2Example1"
                  required
                  className="form-control auth-input bg-white border-0 text-dark"
                  placeholder="Dirección de correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)} //Se actualiza el estado correo con el valor ingresado en el campo correo
                />
                <label htmlFor="form2Example1" className="text-muted">
                  Dirección de correo
                </label>
              </div>

              {/* Contraseña con ojito */}
              <div className="form-floating mb-3">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  id="form2Example2"
                  required
                  className="form-control auth-input bg-white border-0 text-dark pe-5"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} //Se actualiza el estado password con el valor ingresado en el campo contraseña
                />
                <label htmlFor="form2Example2" className="text-muted">
                  Contraseña
                </label>

                <button
                  type="button"
                  className="auth-ojo"
                  onClick={() => setMostrarPassword(!mostrarPassword)} //Se cambia el estado mostrarPassword para mostrar u ocultar la contraseña cuando el usuario hace click en el botón
                  aria-label={
                    mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={mostrarPassword}
                  title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <i
                    className={`bi ${mostrarPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>

              {/* Mensajes */}
              {error && <div className="auth-error mb-3">{error}</div>}
              {aviso && <div className="auth-ok mb-3">{aviso}</div>}

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
                  <button
                    type="button"
                    className="btn btn-link auth-link small fw-semibold p-0"
                    onClick={handleRecuperar}
                    disabled={enviando}
                  >
                    {enviando ? "Enviando..." : "¿Olvidaste tu contraseña?"}
                  </button>
                </div>
              </div>

              {/* Botón de ingreso */}
              <button
                type="submit"
                disabled={cargando}
                className="btn w-100 py-2 fw-bold text-uppercase mb-4 rounded-3 auth-btn-primary"
              >
                {cargando ? "Ingresando..." : "Iniciar sesión"}
              </button>

              {/* Registro y redes sociales */}
              <div className="text-center">
                <p className="small auth-suave mb-4">
                  ¿No tienes una cuenta?

                  {onIrARegistro ? ( //onIrARegistro es una función que se pasa como prop desde Perfil.jsx y se ejecuta cuando el usuario hace click en el botón de registrarse
                    <button
                      type="button"
                      className="btn btn-link auth-link p-0 fw-semibold align-baseline ms-1"
                      onClick={onIrARegistro} //Se llama a la función onIrARegistro cuando el usuario hace click en el botón
                    >
                      Registrarse
                    </button>
                    ) : (
                    <Link
                      to="/Registro"
                      className="auth-link fw-semibold"
                      aria-label="Registrarse"
                    >
                      {" "}Registrarse
                    </Link>
                  )}
                </p>

                <div className="auth-divisor mb-4">
                  <span>O ingresa con</span>
                </div>

                {/* Redes sociales */}
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
      </div>
    </div>
  );
}

export default Login;