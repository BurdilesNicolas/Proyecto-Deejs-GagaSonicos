
import { useEffect, useState } from "react";
import { obtenerUsuarios } from "../../services/userService";

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const datos = await obtenerUsuarios();
        setUsuarios(datos);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        setError("No se pudieron cargar los usuarios.");
      } finally {
        setCargando(false);
      }
    };

    cargarUsuarios();
  }, []);

  return (
    <div className="container mt-5 mb-5">
      <h1>Gestión de usuarios</h1>
      <p>Consulta de usuarios registrados en Deej's.</p>

      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : usuarios.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <div className="table-responsive mt-4">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Correo electrónico</th>
                <th>Rol</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nombre || "-"}</td>
                  <td>{usuario.apellido || "-"}</td>
                  <td>{usuario.correo || "-"}</td>
                  <td>
                    <span
                      className={`badge ${
                        usuario.rol === "admin"
                          ? "bg-danger"
                          : "bg-primary"
                      }`}
                    >
                      {usuario.rol || "Sin rol"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsuarios;
