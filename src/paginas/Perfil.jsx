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
    return ( //Temporal
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
              
              {/* Tarjeta de bienvenida */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center">
                <div className="card-body">
                  <h2 className="fw-bold text-dark mb-2">Mi Perfil</h2>
                  <p className="text-muted">¡Bienvenido de vuelta a tu cuenta!</p>
                  
                  {/* Caja de información interna */}
                  <div className="my-4">
                    <div className="p-3 bg-light rounded-3 text-start small text-secondary">
                      <strong>Estado del Perfil:</strong> Sesión Conectada Exitosamente
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

}
export default Perfil;