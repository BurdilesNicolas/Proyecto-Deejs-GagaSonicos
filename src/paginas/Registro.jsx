//Registro.jsx Sección de registro de usuario
import React, { useState } from "react";
import { Link } from "react-router-dom";
import SelectorFoto from "../componentes/SelectorFoto";
import "../estilos/Perfil.css";

// Props (las pasa Perfil.jsx):
//  onRegistro(nombre, apellido, correo, password, foto)
//  onIrALogin()
function Registro({ onRegistro, onIrALogin }) {
  const [inputNombre, setInputNombre] = useState("");
  const [inputApellido, setInputApellido] = useState("");
  const [inputCorreo, setInputCorreo] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [inputFoto, setInputFoto] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Traducir errores de Firebase
  const obtenerMensajeError = (codigo) => {
    switch (codigo) {
      case "auth/email-already-in-use":
        return "Ya existe una cuenta con ese correo.";

      case "auth/invalid-email":
        return "El correo electrónico no es válido.";

      case "auth/weak-password":
        return "La contraseña debe tener al menos 6 caracteres.";

      case "auth/network-request-failed":
        return "Error de conexión. Revisá tu internet.";

      case "auth/too-many-requests":
        return "Demasiados intentos. Intentá más tarde.";

      default:
        return "No se pudo crear la cuenta. Intentá nuevamente.";
    }
  };

  // Registrar usuario con Firebase
  const handleSubmit = async (e) => { //Función asincrona que se ejecuta cuando el usuario hace click en el botón de registro.
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      if (onRegistro) { //Llama a la función onRegistro con los datos del formulario si está definida. Esta función se encarga de registrar al usuario en Firebase y manejar la foto de perfil si se proporciona
        await onRegistro(
          inputNombre,
          inputApellido,
          inputCorreo,
          inputPassword,
          inputFoto
        );
      }
    } catch (error) {
      setError(obtenerMensajeError(error.code)); //Muestra un mensaje de error traducido según el código de error de Firebase
    } finally {
      setCargando(false); //Indica que la operación de registro ha terminado, ya sea con éxito o con error
    }
  };

  return ( //Retorna el JSX del componente Registro que muestra un formulario de registro con campos para nombre, apellido, correo, contraseña y foto de perfil, así como botones para registrarse, iniciar sesión y redes sociales
    <div className="auth-page">
      <div className="auth-contenedor">
        <div className="card rounded-4 p-4 text-white auth-card">
          <div className="card-body">

            {/* Cabecera del Registro */}
            <div className="text-center mb-4">
              <h2 className="fw-bold text-white mb-1">Crea tu cuenta</h2>
              <p className="auth-suave small mb-0">
                Regístrate para empezar a disfrutar del servicio
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Foto de perfil (opcional) */}
              <div className="mb-4">
                <SelectorFoto value={inputFoto} onChange={setInputFoto} /> {/* Muestra el componente SelectorFoto que permite al usuario elegir una foto de perfil y actualiza el estado inputFoto con la imagen procesada o vacía si se quita la foto */}
              </div>

              {/* Nombre y Apellido */}
              <div className="row g-2 mb-3">
                <div className="col-12 col-sm-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      id="registerName"
                      className="form-control auth-input bg-white border-0 text-dark"
                      placeholder="Nombre"
                      value={inputNombre}
                      onChange={(e) => setInputNombre(e.target.value)} //Se actualiza el estado inputNombre con el valor ingresado en el campo nombre
                      required
                    />
                    <label htmlFor="registerName" className="text-muted">
                      Nombre
                    </label>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      id="registerLastName"
                      className="form-control auth-input bg-white border-0 text-dark"
                      placeholder="Apellido"
                      value={inputApellido}
                      onChange={(e) => setInputApellido(e.target.value)} //Se actualiza el estado inputApellido con el valor ingresado en el campo apellido
                      required
                    />
                    <label htmlFor="registerLastName" className="text-muted">
                      Apellido
                    </label>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="form-floating mb-3">
                <input
                  type="email"
                  id="registerEmail"
                  className="form-control auth-input bg-white border-0 text-dark"
                  placeholder="Dirección de correo"
                  value={inputCorreo}
                  onChange={(e) => setInputCorreo(e.target.value)} //Se actualiza el estado inputCorreo con el valor ingresado en el campo correo
                  required
                />
                <label htmlFor="registerEmail" className="text-muted">
                  Dirección de correo
                </label>
              </div>

              {/* Contraseña */}
              <div className="form-floating mb-3">
                <input
                  type="password"
                  id="registerPassword"
                  className="form-control auth-input bg-white border-0 text-dark"
                  placeholder="Contraseña"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)} //Se actualiza el estado inputPassword con el valor ingresado en el campo contraseña
                  minLength={6} //Se establece una longitud mínima de 6 caracteres para la contraseña
                  required //Establece que el campo contraseña es obligatorio para enviar el formulario
                />
                <label htmlFor="registerPassword" className="text-muted">
                  Contraseña
                </label>
              </div>

              {/* Mensaje de error */}
              {error && <div className="auth-error mb-3">{error}</div>}

              {/* Términos y Condiciones */}
              <div className="row my-4 align-items-center">
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input auth-check"
                      type="checkbox"
                      id="registerTerms"
                      required
                    />
                    <label
                      className="form-check-label small text-white"
                      htmlFor="registerTerms"
                    >
                      Acepto los{" "}
                      <a href="#!" className="auth-link fw-semibold">
                        Términos de servicio
                      </a>{" "}
                      y la{" "}
                      <a href="#!" className="auth-link fw-semibold">
                        Política de privacidad
                      </a>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botón de Registro */}
              <button
                type="submit"
                disabled={cargando}
                className="btn w-100 py-2 fw-bold text-uppercase mb-4 rounded-3 auth-btn-primary"
              >
                {cargando ? "Creando cuenta..." : "Registrarse"}
              </button>

              {/* Volver al Login y Redes Sociales */}
              <div className="text-center">
                <p className="small auth-suave mb-4">
                  ¿Ya tienes una cuenta?

                  {onIrALogin ? ( //onIrALogin es una función que se pasa como prop desde Perfil.jsx y se ejecuta cuando el usuario hace click en el botón de iniciar sesión
                    <button
                      type="button"
                      className="btn btn-link auth-link p-0 fw-semibold align-baseline ms-1"
                      onClick={onIrALogin} //Se llama a la función onIrALogin cuando el usuario hace click en el botón
                    >
                      Iniciar sesión
                    </button>
                    ) : (
                    <Link to="/Login" className="auth-link fw-semibold">
                      {" "}Iniciar sesión
                    </Link>
                  )}
                </p>

                <div className="auth-divisor mb-4">
                  <span>O regístrate con</span>
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

export default Registro;