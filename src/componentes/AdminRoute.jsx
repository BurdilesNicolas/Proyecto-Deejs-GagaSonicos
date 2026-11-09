// Comprueba si el usuario es administrador antes de permitir el acceso a la ruta protegida. Si no es administrador, redirige al usuario a la página de perfil.
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../services/firebase";
import { obtenerPerfil } from "../services/userService";
import Cargando from "./Cargando";
import { esperarDuracionMinima } from "../utils/tiempoCarga";

function AdminRoute({ children }) {
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    const inicio = Date.now();
    const cancelar = onAuthStateChanged(auth, async (usuario) => {
      let usuarioEsAdmin = false;

      if (!usuario) {
        usuarioEsAdmin = false;
      } else {
        try {
          const perfil = await obtenerPerfil(usuario.uid);
          usuarioEsAdmin = perfil?.rol === "admin";
        } catch (error) {
          console.error("Error verificando administrador:", error);
        }
      }

      setEsAdmin(usuarioEsAdmin);
      await esperarDuracionMinima(inicio);
      setCargando(false);
    });

    return () => cancelar();
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
