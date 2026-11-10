//Página de admin. Desde aca se puede acceder a los paneles de productos, reseñas y usuarios
//Solo funciona si el usuario logueado es un administrador. AdminRoute verifica que el usuario logueado sea un administrador. En caso de no serlo te redirige a la página de perfil.  
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { obtenerPerfil } from "../services/userService";
import "../estilos/Admin.css";

// Secciones del panel.
// Cuando una sección tenga su página, completa su "ruta" (y agrega la <Route>
// en App.jsx). Mientras la ruta sea null, el botón queda deshabilitado para
// no enviar al administrador a una página que no existe.
const SECCIONES = [ //Secciones del panel de administración para después renderizar las tarjetas de acceso a cada sección
  { //Seccion de productos
    clave: "productos",
    icono: "bi-disc",
    titulo: "Productos",
    descripcion: "Gestioná el catálogo de productos de Deej's",
    boton: "Administrar productos",
    ruta: "/Admin/Productos",
  },
  {
    clave: "merch",
    icono: "bi-bag",
    titulo: "Merch",
    descripcion: "Gestioná indumentaria y accesorios de la tienda",
    boton: "Administrar merch",
    ruta: "/Admin/Merch",
  },
  {//Seccion de reseñas
    clave: "resenas",
    icono: "bi-chat-square-text",
    titulo: "Reseñas",
    descripcion: "Consultá y administrá las reseñas publicadas",
    boton: "Administrar reseñas",
    ruta: "/Admin/Review",
  },
  {//Seccion de recomendaciones
    clave: "recomendaciones",
    icono: "bi-music-note-list",
    titulo: "Recomendaciones",
    descripcion: "Consultá y administrá las recomendaciones de la comunidad",
    boton: "Moderar recomendaciones",
    ruta: "/Admin/Recomendacion",
  },
  {//Seccion de usuarios
    clave: "usuarios",
    icono: "bi-people",
    titulo: "Usuarios",
    descripcion: "Consultá los usuarios registrados y sus roles",
    boton: "Administrar usuarios",
    ruta: "/Admin/Usuarios",
  },
];

function Admin() { //Página de administración principal
  const [nombre, setNombre] = useState(""); //Guarda el nombre del administrador que inició sesión
  const [cargandoNombre, setCargandoNombre] = useState(true); //Indica si se está cargando el nombre del administrador

  // Obtiene el nombre del administrador que inició sesión desde Firestore
  useEffect(() => {
    let activo = true;

    const cancelarObservador = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (activo) {
          setNombre("");
          setCargandoNombre(false); //Si no hay usuario logueado, se limpia el nombre y se indica que ya no se está cargando
        }
        return;
      }

      try {
        const perfil = await obtenerPerfil(user.uid);
        if (activo) setNombre(perfil?.nombre || ""); //Si se obtiene el perfil, se guarda el nombre del administrador. Si no, se guarda un string vacío
      } catch (error) {
        console.error("Error al obtener el perfil del administrador:", error); //Muestra un error en la consola si no se puede obtener el perfil
      } finally {
        if (activo) setCargandoNombre(false); //Indica que ya no se está cargando el nombre del administrador
      }
    });

    return () => { //Cuando el componente se desmonta, se limpia el observador de autenticación y se indica que ya no está activo
      activo = false;
      cancelarObservador();
    };
  }, []);

  return ( //Renderiza la página de administración
    <div className="admin-page">
      <div className="admin-contenedor">

        {/* Bienvenida */}
        <header className="admin-encabezado">
          <span className="admin-insignia">
            <i className="bi bi-shield-lock-fill"></i>
            Panel de administración
          </span>

          <h1
            className={`admin-saludo ${cargandoNombre ? "admin-saludo--cargando" : ""}`}
          >
            ¡Bienvenido, Admin
            {nombre && (
              <>
                {" "}
                <span className="admin-saludo-nombre">{nombre}</span> { /*Muestra el nombre del administrador si se obtuvo correctamente*/ }
              </>
            )}
            !
          </h1>

          <p className="admin-subtitulo">
            Elegí una sección para gestionar la tienda.
          </p>
        </header>

        {/* Tarjetas de acceso */}
        <div className="admin-grid">
          {SECCIONES.map((seccion) => { //Itera sobre las secciones definidas y renderiza una tarjeta para cada una
            const disponible = Boolean(seccion.ruta);

            return (
              <article
                key={seccion.clave}
                className={`admin-card ${disponible ? "admin-card--activa" : ""}`}
              >
                {!disponible && (
                  <span className="admin-proximamente">Próximamente</span> //Muestra un mensaje de "Próximamente" porque la sección no tiene ruta definida.
                )}

                <div className="admin-card-icono">
                  <i className={`bi ${seccion.icono}`}></i>
                </div>

                <h2 className="admin-card-titulo">{seccion.titulo}</h2> { /*Muestra el título de la sección*/ }
                <p className="admin-card-texto">{seccion.descripcion}</p>  { /*Muestra la descripción de la sección*/ }

                {disponible ? ( //Si la sección tiene ruta definida, muestra un enlace al panel de administración correspondiente
                  <Link to={seccion.ruta} className="admin-card-boton">
                    {seccion.boton}
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="admin-card-boton"
                    disabled
                    title="Disponible próximamente"
                  >
                    {seccion.boton} { /*Muestra el botón de la sección, pero deshabilitado por no tener la ruta definida.*/ }
                    <i className="bi bi-arrow-right"></i>
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Admin;