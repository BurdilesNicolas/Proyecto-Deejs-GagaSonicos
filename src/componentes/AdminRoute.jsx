// Comprueba si el usuario es administrador antes de permitir el acceso a la ruta protegida. Si no es administrador, redirige al usuario a la página de perfil.
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
// Importa los servicios necesarios para la autenticación y la obtención del perfil de usuario
import { auth } from "../services/firebase";
import { obtenerPerfil } from "../services/userService";
import Cargando from "./Cargando";
import { esperarDuracionMinima } from "../utils/tiempoCarga";

// Componente de ruta protegida para administradores. Si no es administrador, redirige al usuario a la página de perfil.
function AdminRoute({ children }) {
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    const inicio = Date.now();
    const cancelar = onAuthStateChanged(auth, async (usuario) => {
      let usuarioEsAdmin = false;

      if (!usuario) {
        usuarioEsAdmin = false; // Si no hay usuario autenticado, no es administrador
      } else {
        try {
          const perfil = await obtenerPerfil(usuario.uid);
          usuarioEsAdmin = perfil?.rol === "admin";
        } catch (error) {
          console.error("Error verificando administrador:", error); //Muestra un mensaje de error en la consola si ocurre un problema al obtener el perfil del usuario
        }
      }

      setEsAdmin(usuarioEsAdmin);
      await esperarDuracionMinima(inicio); // Espera a que transcurra un tiempo mínimo antes de cambiar el estado de carga
      setCargando(false);
    });

    return () => cancelar(); //Limpia el listener de autenticación cuando el componente se desmonta
  }, []);

  if (cargando) {
    return <Cargando modo="pagina" texto="Verificando permisos..." retraso={0} />;
  }

  if (!esAdmin) {
    return <Navigate to="/Perfil" replace />;
  }

  return children;
}

export default AdminRoute;
