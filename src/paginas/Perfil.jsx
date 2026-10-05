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


}
export default Perfil;