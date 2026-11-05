//Panel de admin dedicado a la gestión de usuarios. Muestra una tabla con todos los usuarios registrados, con filtros y ordenamiento. Se accede desde Admin.jsx.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerUsuarios } from "../../services/userService";
import "../../estilos/Admin.css";
import "../../estilos/AdminUsuarios.css";

//Quita tildes y pasa a minúsculas para que coincidan
const normalizar = (texto) =>
  (texto || "")
    .normalize("NFD") //Elimina diacríticos
    .replace(/[\u0300-\u036f]/g, "") //Deja solo la letra base descomponiendo los acentos y diacríticos
    .toLowerCase(); //Quita tildes y pasa a minúsculas para que coincidan

const CAMPOS_ORDEN = [
  { valor: "nombre", etiqueta: "Nombre" },
  { valor: "apellido", etiqueta: "Apellido" },
  { valor: "correo", etiqueta: "Correo electrónico" },
];

// Etiqueta de color según el rol
function RolBadge({ rol }) {
  if (rol === "admin") { //Verifica si el rol es "admin" y muestra un badge con un icono de escudo y el texto "admin"
    return (
      <span className="rol-badge rol-badge--admin">
        <i className="bi bi-shield-check"></i> { /*Icono de escudo para indicar que es un administrador*/ }
        {rol} {/* Muestra el rol con un icono de escudo */}
      </span>
    );
  }

  if (rol === "usuario") { //Verifica si el rol es "usuario" y muestra un badge con un icono de persona y el texto "usuario"
    return (
      <span className="rol-badge rol-badge--usuario">
        <i className="bi bi-person"></i> {/*Icono de persona para indicar que es un usuario normal*/ }
        {rol} {/* Muestra el rol con un icono de persona */}
      </span>
    );
  }

  return <span className="rol-badge rol-badge--otro">{rol || "Sin rol"}</span>; //Retorna un badge genérico para roles desconocidos o vacíos, mostrando "Sin rol" si no hay rol definido.
}

function AdminUsuarios() { //Muestra la página de administración de usuarios, con filtros y ordenamiento. Se accede desde Admin.jsx.
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  //Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [campoOrden, setCampoOrden] = useState("nombre");
  const [direccion, setDireccion] = useState("asc");

  //Consulta a Firestore (colección "usuarios")
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const datos = await obtenerUsuarios();

        //Solo se conservan los campos que se muestran, omitiendo datos no necesarios.
        setUsuarios(
          datos.map((u) => ({
            id: u.id,
            nombre: u.nombre || "",
            apellido: u.apellido || "",
            correo: u.correo || "",
            rol: u.rol || "",
          }))
        );
      } catch (err) { //Si ocurre un error al obtener los usuarios, se muestra un mensaje de error en la consola y se actualiza el estado de error para mostrarlo en la interfaz.
        console.error("Error al obtener usuarios:", err);
        setError(
          err.code === "permission-denied"
            ? "Firestore rechazó la consulta por permisos. Revisá las reglas de seguridad de la colección usuarios."
            : "No se pudieron cargar los usuarios."
        );
      } finally {
        setCargando(false); //Indica que ya no se está cargando la lista de usuarios.
      }
    };

    cargarUsuarios();//Llama a la función para cargar los usuarios al montar el componente.
  }, []);

  // Aplica rol + búsqueda + orden, todo junto
  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());

    const filtrados = usuarios.filter((u) => { //Filtra los usuarios según el rol seleccionado y el texto de búsqueda ingresado.
      if (filtroRol !== "todos" && u.rol !== filtroRol) return false;
      if (!texto) return true;

      return ( //Verifica si el nombre, apellido, correo o la combinación de nombre y apellido contienen el texto de búsqueda normalizado.
        normalizar(u.nombre).includes(texto) ||
        normalizar(u.apellido).includes(texto) ||
        normalizar(u.correo).includes(texto) ||
        normalizar(`${u.nombre} ${u.apellido}`).includes(texto)
      );
    });

    return [...filtrados].sort((a, b) => { //Ordena los usuarios filtrados según el campo seleccionado y la dirección de ordenamiento (ascendente o descendente).
      const va = a[campoOrden];
      const vb = b[campoOrden];

      //Los campos vacíos siempre quedan al final
      if (!va && !vb) return 0;
      if (!va) return 1;
      if (!vb) return -1;

      const resultado = va.localeCompare(vb, "es", { sensitivity: "base" });
      return direccion === "asc" ? resultado : -resultado;
    });
  }, [usuarios, busqueda, filtroRol, campoOrden, direccion]);

  const hayFiltros = busqueda.trim() !== "" || filtroRol !== "todos"; //Indica si hay filtros activos para mostrar el botón de limpiar filtros.

  const limpiarFiltros = () => { //Limpia los filtros de búsqueda y rol, y restablece el estado de búsqueda y filtro de rol a sus valores iniciales.
    setBusqueda("");
    setFiltroRol("todos");
  };

  return ( //Renderiza la página de administración de usuarios.
    <div className="admin-page">
      <div className="admin-contenedor">

        <Link to="/Admin" className="admin-volver">
          <i className="bi bi-arrow-left"></i>
          Volver al panel
        </Link>

        <header className="usuarios-encabezado">
          <h1 className="usuarios-titulo">Gestión de usuarios</h1>
          <p className="usuarios-descripcion">
            Consulta de usuarios registrados en Deej&apos;s.
          </p>
        </header>

        <section className="usuarios-panel">
          {cargando ? ( //Muestra un spinner de carga mientras se obtienen los usuarios consultados desde firestore.
            <div className="usuarios-estado" role="status">
              <div className="usuarios-spinner"></div>
              Cargando usuarios...
            </div>
          ) : error ? ( //Si ocurre un error al obtener los usuarios, se muestra un mensaje de error en la interfaz.
            <div className="usuarios-estado usuarios-estado--error">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          ) : usuarios.length === 0 ? ( //Si no hay usuarios registrados, se muestra un mensaje indicando que no hay usuarios.
            <div className="usuarios-estado">
              <i className="bi bi-people"></i>
              Todavía no hay usuarios registrados.
            </div>
          ) : ( //Si hay usuarios registrados, se muestra la tabla con los usuarios filtrados y ordenados según los filtros aplicados.
            <>
              {/* Herramientas: buscador, filtro por rol y orden */}
              <div className="usuarios-herramientas">
                <div className="usuarios-buscador">
                  <i className="bi bi-search"></i>
                  <input
                    type="search"
                    className="usuarios-input"
                    placeholder="Buscar por nombre, apellido o correo"
                    aria-label="Buscar usuarios"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)} //Actualiza el estado de búsqueda cuando el usuario escribe en el campo de búsqueda.
                  />
                </div>

                <select
                  className="usuarios-select"
                  aria-label="Filtrar por rol"
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)} //Actualiza el estado de filtro de rol cuando el usuario selecciona un rol en el menú desplegable.
                >
                  <option value="todos">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="usuario">Usuarios</option>
                </select>

                <select
                  className="usuarios-select"
                  aria-label="Ordenar por"
                  value={campoOrden}
                  onChange={(e) => setCampoOrden(e.target.value)} //Actualiza el estado de campo de orden cuando el usuario selecciona un campo en el menú desplegable.
                >
                  {CAMPOS_ORDEN.map((campo) => (
                    <option key={campo.valor} value={campo.valor}>
                      Ordenar por: {campo.etiqueta}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="usuarios-btn usuarios-btn--acento usuarios-btn-orden"
                  onClick={() =>
                    setDireccion(direccion === "asc" ? "desc" : "asc") //Invierte la dirección de ordenamiento (ascendente o descendente) cuando el usuario hace clic en el botón de orden.
                  }
                  title="Invertir el orden"
                >
                  <i
                    className={`bi ${
                      direccion === "asc"
                        ? "bi-sort-alpha-down"
                        : "bi-sort-alpha-up"
                    }`}
                  ></i>
                  {direccion === "asc" ? "A → Z" : "Z → A"} {/* Muestra la dirección de ordenamiento actual (ascendente o descendente) con un icono y texto. */}
                </button>
              </div>

              {/* Resumen de resultados */}
              <div className="usuarios-resumen">
                <span>
                  Mostrando {visibles.length} de {usuarios.length} usuarios
                </span>

                {hayFiltros && (
                  <button
                    type="button"
                    className="usuarios-limpiar"
                    onClick={limpiarFiltros} //Llama a la función limpiar filtros cuando el usuario hace click en el boton de limpiar filtros.
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              {visibles.length === 0 ? ( //Si no hay usuarios visibles después de aplicar los filtros se muestra un mensaje indicando que no se encontraron usuarios.
                <div className="usuarios-estado">
                  <i className="bi bi-search"></i>
                  No se encontraron usuarios.
                </div>
              ) : ( //Si hay usuarios visivles después de aplicar los filtros, se muestra la tabla con los usuarios filtrados y ordenados.
                <div className="usuarios-tabla-envoltorio">
                  <table className="usuarios-tabla">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Correo electrónico</th>
                        <th>Rol</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibles.map((usuario) => ( //Itera sobre los usuarios visibles y renderiza una fila de la tabla para cada usuario, mostrando su nombre, apellido, correo electrónico y rol. Si algún campo está vacío, se muestra un guion en su lugar. El rol se muestra con un badge de color según el rol del usuario (admin o usuario).
                        <tr key={usuario.id}>
                          <td data-label="Nombre">
                            {usuario.nombre || ( //Si el nombre del usuario está vacío, se muestra un guion en su lugar.
                              <span className="usuarios-sin-dato">-</span>
                            )}
                          </td>
                          <td data-label="Apellido">
                            {usuario.apellido || ( //Si el apellido del usuario está vacío, se muestra un guion en su lugar.
                              <span className="usuarios-sin-dato">-</span>
                            )}
                          </td>
                          <td data-label="Correo">
                            {usuario.correo || ( //Si el correo del usuario está vacío, se muestra un guion en su lugar.
                              <span className="usuarios-sin-dato">-</span>
                            )}
                          </td>
                          <td data-label="Rol">
                            <RolBadge rol={usuario.rol} /> {/* Muestra el rol del usuario con un badge de color según el rol (admin o usuario). Si el rol está vacío, se muestra un badge genérico con "Sin rol". */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminUsuarios;