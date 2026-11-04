// Comprueba si el usuario es administrador antes de permitir el acceso a la ruta protegida. Si no es administrador, redirige al usuario a la página de perfil.
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../services/firebase";
import { obtenerPerfil } from "../services/userService";

function AdminRoute({ children }) {
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setEsAdmin(false);
        setCargando(false);
        return;
      }

      try {
        const perfil = await obtenerPerfil(usuario.uid);
        setEsAdmin(perfil?.rol === "admin");
      } catch (error) {
        console.error("Error verificando administrador:", error);
        setEsAdmin(false);
      }

      setCargando(false);
    });

    return () => cancelar();
  }, []);

if (cargando) {
  return ( //Luego añadir una pantalla de carga.
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Verificando permisos...</p>
      </div>
    </div>
  );
}

  if (!esAdmin) {
    return <Navigate to="/Perfil" replace />;
  }

  return children;
}

export default AdminRoute;
