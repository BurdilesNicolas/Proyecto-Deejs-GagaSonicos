/* ============================================================
   COMUNIDAD.JSX  ·  Página "Reseñas y comunidad"
   ------------------------------------------------------------
   Tiene dos pestañas:
     1) Reseñas    -> opiniones con estrellas sobre los productos de la tienda.
     2) Comunidad  -> recomendaciones libres (álbumes, artistas, equipos...).

   Todo se guarda en Firebase (Firestore) y se actualiza en tiempo real:
     - colección "resenas"         -> las reseñas
     - colección "recomendaciones" -> las recomendaciones
     - colección "productos"       -> el catálogo (solo se lee, para armar la lista del formulario)

   Estructura del archivo (de arriba hacia abajo):
     1. Imports
     2. Constantes y utilidades (funciones y hooks de ayuda)
     3. Componentes chicos reutilizables (estrellas, avatar, avisos...)
     4. Reseñas:         formulario + sección
     5. Recomendaciones: formulario + sección
     6. Componente principal <Comunidad />  (une todo)
   ============================================================ */

/* ============================================================
   1. IMPORTS
   ============================================================ */

// Hooks de React: estado, valores calculados, efectos, referencias y funciones estables.
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
// Link permite navegar a otras páginas sin recargar el sitio.
import { Link } from 'react-router-dom'
// Estilos de esta página (todas sus clases empiezan con "cm-").
import '../estilos/Comunidad.css'
// useUsuarioActual: devuelve quién tiene la sesión iniciada. nombrePublico: arma "Ana P.".
import { useUsuarioActual, nombrePublico } from '../utils/sesion'
// Funciones que hablan con Firestore (están en services/comunidadService.js).
import {
    suscribirResenas,            // escucha las reseñas en tiempo real
    crearResena,                 // guarda una reseña nueva
    eliminarResena,              // borra una reseña
    alternarVotoResena,          // agrega o quita el voto "Útil"
    suscribirRecomendaciones,    // escucha las recomendaciones en tiempo real
    crearRecomendacion,          // guarda una recomendación nueva
    eliminarRecomendacion,       // borra una recomendación
    alternarVotoRecomendacion,   // agrega o quita el "Me gusta"
    TIPOS_RECOMENDACION as TIPOS, // lista de tipos: Vinilo, Cassette, CD, Artista, Equipo
} from '../services/comunidadService'
// Escucha en tiempo real el catálogo de productos de Firestore.
import { suscribirProductos } from '../services/productosService'

/* ============================================================
   DATOS
   ------------------------------------------------------------
   Los productos salen de la colección "productos" de Firestore
   (la misma que administra AdminProductos y muestra el catálogo),
   así que la lista del formulario siempre está al día. Las
   reseñas y recomendaciones también viven en Firestore.
   ============================================================ */

// Texto que acompaña a cada cantidad de estrellas en el formulario.
const TEXTO_ESTRELLAS = { 1: 'Malo', 2: 'Regular', 3: 'Bueno', 4: 'Muy bueno', 5: 'Excelente' }

/* ============================================================
   2. UTILIDADES
   ============================================================ */

// Convierte una fecha en texto legible. Ejemplo: "10 nov 2026".
function formatearFecha(fecha) {
    return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Los ids de producto pueden ser números (catálogo original) o texto (productos
// nuevos): se comparan siempre como texto para que funcionen los dos.
function mismoProducto(a, b) {
    return String(a) === String(b)
}

// HOOK: carga una colección de Firestore en tiempo real: { datos, cargando, error }.
// "suscribir" tiene que ser una función estable (las del servicio lo son).
function useColeccion(suscribir) {
    // Estado inicial: sin datos, "cargando" activado y sin error.
    const [estado, setEstado] = useState({ datos: [], cargando: true, error: '' })

    useEffect(() => {
        // Nos suscribimos: Firestore avisa cada vez que algo cambia en la colección.
        const cancelar = suscribir(
            // Llegaron datos: los guardamos y apagamos el "cargando".
            (datos) => setEstado({ datos, cargando: false, error: '' }),
            // Falló la consulta: mostramos un mensaje según el tipo de error.
            (err) => {
                console.error('Error al leer Firestore:', err)
                setEstado({
                    datos: [],
                    cargando: false,
                    error:
                        err.code === 'permission-denied'
                            ? 'Firestore rechazó la consulta por permisos. Revisá las reglas de seguridad.'
                            : 'No pudimos cargar el contenido. Probá de nuevo en un momento.',
                })
            },
        )
        // Al salir de la página dejamos de escuchar (evita consumo innecesario).
        return cancelar
    }, [suscribir])

    return estado
}

// HOOK: mensaje temporal ("¡Gracias!…") que se borra solo a los 4 segundos.
// Devuelve [aviso, mostrar]: "aviso" es lo que se muestra y "mostrar(texto, tipo)" lo activa.
function useAviso() {
    const [aviso, setAviso] = useState(null) // { texto, tipo: 'ok' | 'error' | 'info' }
    const temporizador = useRef(null) // guarda el temporizador para poder cancelarlo

    const mostrar = useCallback((texto, tipo = 'ok') => {
        clearTimeout(temporizador.current) // si ya había un aviso, se reinicia el conteo
        setAviso({ texto, tipo })
        temporizador.current = setTimeout(() => setAviso(null), 4000)
    }, [])

    // Al desmontar el componente se cancela el temporizador pendiente.
    useEffect(() => () => clearTimeout(temporizador.current), [])

    return [aviso, mostrar]
}

/* ============================================================
   3. COMPONENTES CHICOS
   ------------------------------------------------------------
   Piezas pequeñas que se reutilizan en varias partes de la página.
   ============================================================ */

// Estrellas de solo lectura (se usan para mostrar la nota de una reseña).
function Estrellas({ valor }) {
    return (
        // role="img" + aria-label: los lectores de pantalla leen "4.0 de 5 estrellas".
        <span className="cm-estrellas" role="img" aria-label={`${valor.toFixed(1)} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <i
                    key={n}
                    // Si la estrella está dentro de la nota (redondeada) se pinta "llena" (dorada).
                    className={n <= Math.round(valor) ? 'bi bi-star-fill cm-estrella llena' : 'bi bi-star-fill cm-estrella'}
                    aria-hidden="true"
                ></i>
            ))}
        </span>
    )
}

// Estrellas clickeables para el formulario: elegís cuántas estrellas das.
function SelectorEstrellas({ valor, onChange }) {
    const [hover, setHover] = useState(0) // estrella sobre la que está el mouse (0 = ninguna)
    const activo = hover || valor // mientras el mouse pasa por encima, se previsualiza esa nota

    return (
        // Al sacar el mouse del grupo se apaga la previsualización.
        <div className="cm-selector" role="radiogroup" aria-label="Calificación" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={valor === n}
                    aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                    className={n <= activo ? 'cm-selector-btn llena' : 'cm-selector-btn'}
                    onClick={() => onChange(n)}       // confirma la nota
                    onMouseEnter={() => setHover(n)}  // previsualiza la nota
                >
                    <i className="bi bi-star-fill" aria-hidden="true"></i>
                </button>
            ))}
            {/* Palabra que acompaña a la nota: "Malo", "Bueno", "Excelente"... */}
            {activo > 0 && <span className="cm-selector-texto">{TEXTO_ESTRELLAS[activo]}</span>}
        </div>
    )
}

// Envoltorio de un campo del formulario: etiqueta + control + mensaje de error.
function Campo({ etiqueta, htmlFor, error, children, ancho }) {
    return (
        <div className={ancho ? `cm-campo ${ancho}` : 'cm-campo'}>
            {/* Si el campo tiene un input asociado usa <label>; si no (estrellas), un <span>. */}
            {htmlFor ? <label htmlFor={htmlFor}>{etiqueta}</label> : <span className="cm-label">{etiqueta}</span>}
            {children}
            {/* El error solo aparece si la validación falló. */}
            {error && <span className="cm-error" role="alert">{error}</span>}
        </div>
    )
}

// Círculo con la inicial del autor (en lugar de una foto).
function Avatar({ nombre }) {
    return <span className="cm-avatar" aria-hidden="true">{nombre.trim().charAt(0).toUpperCase()}</span>
}

// Cartel que reemplaza al formulario cuando no hay sesión iniciada.
function AvisoSesion({ accion, onCerrar }) {
    return (
        <div className="cm-form cm-gate" role="alert">
            <div className="cm-gate-icono"><i className="bi bi-person-lock" aria-hidden="true"></i></div>
            <h3 className="cm-form-titulo">Necesitás una cuenta</h3>
            <p className="cm-gate-texto">Para {accion} tenés que iniciar sesión o crear una cuenta.</p>
            <div className="cm-form-acciones">
                <button type="button" className="cm-btn cm-btn-sec" onClick={onCerrar}>Ahora no</button>
                {/* Lleva a /Perfil, donde está el login y el registro. */}
                <Link to="/Perfil" className="cm-btn cm-btn-prim">Iniciar sesión / Registrarse</Link>
            </div>
        </div>
    )
}

// Botón "Eliminar" con confirmación en dos pasos (evita borrar sin querer).
function BotonEliminar({ onConfirmar, etiqueta }) {
    const [confirmando, setConfirmando] = useState(false) // false = botón normal, true = "¿Eliminar? Sí / No"

    // Segundo paso: pregunta si de verdad querés eliminar.
    if (confirmando) {
        return (
            <span className="cm-confirmar" role="group" aria-label="Confirmar eliminación">
                <span className="cm-confirmar-texto">¿Eliminar?</span>
                <button type="button" className="cm-btn-mini cm-btn-peligro" onClick={onConfirmar}>Sí</button>
                <button type="button" className="cm-btn-mini" onClick={() => setConfirmando(false)}>No</button>
            </span>
        )
    }

    // Primer paso: el botón "Eliminar" común.
    return (
        <button
            type="button"
            className="cm-btn-mini cm-btn-eliminar"
            onClick={() => setConfirmando(true)}
            aria-label={etiqueta}
        >
            <i className="bi bi-trash3" aria-hidden="true"></i> Eliminar
        </button>
    )
}

// Mensajes de estado de una lista: cargando / error.
function EstadoLista({ cargando, error }) {
    // Mientras Firestore responde: spinner giratorio.
    if (cargando) {
        return (
            <div className="cm-estado" role="status">
                <div className="cm-spinner"></div>
                Cargando...
            </div>
        )
    }

    // Si falló la carga: mensaje de error.
    return (
        <div className="cm-estado cm-estado-error" role="alert">
            <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
            {error}
        </div>
    )
}

// Mensaje temporal (verde = éxito, rojo = error, violeta = información).
// Se alimenta del hook useAviso().
function Aviso({ aviso }) {
    if (!aviso) return null // si no hay aviso, no dibuja nada
    return <p className={`cm-aviso cm-aviso-${aviso.tipo}`} role="status">{aviso.texto}</p>
}

/* ============================================================
   4A. FORMULARIO DE RESEÑA
   ------------------------------------------------------------
   Se abre con el botón "Escribir reseña". Pide: producto,
   calificación (estrellas) y comentario.
   ============================================================ */
function FormularioResena({ cuenta, productos, productosCargando, productosError, productoInicial, onPublicar, onCancelar }) {
    // Producto elegido (guardado como texto, que es lo que devuelve el <select>).
    // Si el usuario venía filtrando por un producto, ese ya aparece elegido.
    const [productoId, setProductoId] = useState(productoInicial ? String(productoInicial) : '')
    // Busca el producto completo (nombre, imagen, etc.) a partir del id elegido.
    const productoElegido = productos.find((p) => mismoProducto(p.id, productoId))
    // true cuando ya terminó de cargar y la base no tiene ningún producto.
    const sinProductos = !productosCargando && productos.length === 0
    const [calificacion, setCalificacion] = useState(0) // 0 = todavía sin elegir
    const [comentario, setComentario] = useState('')
    const [errores, setErrores] = useState({})          // errores de validación por campo
    const [enviando, setEnviando] = useState(false)     // true mientras se guarda en Firestore
    const [errorEnvio, setErrorEnvio] = useState('')    // error al guardar (red, permisos, etc.)

    // Se ejecuta al apretar "Publicar reseña".
    const enviar = async (e) => {
        e.preventDefault() // evita que el navegador recargue la página

        // Paso 1: validar los campos.
        const nuevos = {}
        if (!productoElegido) nuevos.productoId = 'Elegí un producto.'
        if (calificacion < 1) nuevos.calificacion = 'Elegí una calificación.'
        if (comentario.trim().length < 10) nuevos.comentario = 'Contanos un poco más (mínimo 10 caracteres).'

        setErrores(nuevos)
        if (Object.keys(nuevos).length > 0) return // hay errores: no se envía nada

        // Paso 2: guardar en Firestore.
        setEnviando(true)
        setErrorEnvio('')

        try {
            await onPublicar({
                productoId: productoElegido.id, // se guarda con su tipo original (número o texto)
                calificacion,
                comentario: comentario.trim(),
            })
            // Si salió bien, el formulario se cierra solo.
        } catch (err) {
            console.error('No se pudo publicar la reseña:', err)
            setErrorEnvio('No pudimos publicar tu reseña. Probá de nuevo en un momento.')
            setEnviando(false)
        }
    }

    return (
        // noValidate: la validación la hacemos nosotros (arriba), no el navegador.
        <form className="cm-form" onSubmit={enviar} noValidate>
            <h3 className="cm-form-titulo">Escribir una reseña</h3>
            <p className="cm-publicando">Publicando como <strong>{nombrePublico(cuenta)}</strong></p>

            <div className="cm-form-grid">
                {/* ---- Campo 1: lista de productos (viene de Firestore) ---- */}
                <Campo etiqueta="Producto" htmlFor="rs-producto" error={errores.productoId} ancho="completo">
                    <select
                        id="rs-producto"
                        value={productoElegido ? productoId : ''}
                        onChange={(e) => setProductoId(e.target.value)}
                        aria-invalid={!!errores.productoId}
                        // Se deshabilita mientras carga o si no hay productos.
                        disabled={productosCargando || sinProductos}
                    >
                        {/* Primera opción: cambia según el estado de la carga. */}
                        <option value="">
                            {productosCargando
                                ? 'Cargando productos...'
                                : sinProductos
                                    ? 'No hay productos disponibles'
                                    : 'Seleccioná un producto'}
                        </option>
                        {/* Una opción por cada producto de la base de datos: "NOMBRE · Artista". */}
                        {productos.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.nombre}{p.artista ? ` · ${p.artista}` : ''}
                            </option>
                        ))}
                    </select>

                    {/* Si falló la carga de productos, se avisa acá. */}
                    {productosError && <span className="cm-error" role="alert">{productosError}</span>}

                    {/* Vista previa del producto elegido: portada, nombre y artista. */}
                    {productoElegido && (
                        <div className="cm-producto-elegido">
                            {productoElegido.imagen && <img src={productoElegido.imagen} alt="" />}
                            <div>
                                <strong>{productoElegido.nombre}</strong>
                                {productoElegido.artista && <span>{productoElegido.artista}</span>}
                            </div>
                        </div>
                    )}
                </Campo>

                {/* ---- Campo 2: calificación con estrellas ---- */}
                <Campo etiqueta="Calificación" error={errores.calificacion} ancho="completo">
                    <SelectorEstrellas valor={calificacion} onChange={setCalificacion} />
                </Campo>

                {/* ---- Campo 3: comentario (máximo 500 caracteres) ---- */}
                <Campo etiqueta="Tu opinión" htmlFor="rs-comentario" error={errores.comentario} ancho="completo">
                    <textarea
                        id="rs-comentario"
                        rows={4}
                        maxLength={500}
                        placeholder="¿Cómo suena? ¿Cómo llegó? ¿Lo recomendarías?"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        aria-invalid={!!errores.comentario}
                    />
                    {/* Contador de caracteres usados. */}
                    <span className="cm-contador">{comentario.length}/500</span>
                </Campo>
            </div>

            {/* Error al guardar (distinto de los errores de validación). */}
            {errorEnvio && <p className="cm-aviso cm-aviso-error" role="alert">{errorEnvio}</p>}

            {/* Botones: mientras se envía quedan bloqueados para evitar duplicados. */}
            <div className="cm-form-acciones">
                <button type="button" className="cm-btn cm-btn-sec" onClick={onCancelar} disabled={enviando}>Cancelar</button>
                <button type="submit" className="cm-btn cm-btn-prim" disabled={enviando}>
                    {enviando ? 'Publicando...' : 'Publicar reseña'}
                </button>
            </div>
        </form>
    )
}

/* ============================================================
   4B. SECCIÓN: RESEÑAS
   ------------------------------------------------------------
   Pestaña "Reseñas". Izquierda: resumen de notas y filtro por
   producto. Derecha: botón para escribir, orden y lista de reseñas.
   ============================================================ */
function SeccionResenas({ cuenta, sesionCargando, coleccion, catalogo }) {
    // "coleccion" trae las reseñas; "catalogo" trae los productos (ambos de Firestore).
    const { datos: resenas, cargando, error } = coleccion
    const { datos: productos, cargando: productosCargando, error: productosError } = catalogo

    // Busca un producto por id (sirve para mostrar su nombre e imagen en cada reseña).
    const buscarProducto = (id) => productos.find((p) => mismoProducto(p.id, id))

    const [productoFiltro, setProductoFiltro] = useState(null) // null = todos
    const [orden, setOrden] = useState('recientes')            // criterio de orden elegido
    const [formAbierto, setFormAbierto] = useState(false)      // ¿está abierto el formulario?
    const [aviso, mostrarAviso] = useAviso()                   // mensajes temporales

    // Reseñas que quedan después de aplicar el filtro por producto.
    const resenasFiltradas = useMemo(
        () => (productoFiltro ? resenas.filter((r) => mismoProducto(r.productoId, productoFiltro)) : resenas),
        [resenas, productoFiltro],
    )

    // Promedio y distribución de estrellas (para el resumen de la izquierda).
    const resumen = useMemo(() => {
        const total = resenasFiltradas.length
        const suma = resenasFiltradas.reduce((acc, r) => acc + r.calificacion, 0)
        // Para cada nota (5 a 1): cuántas reseñas tiene y qué porcentaje del total (barra).
        const distribucion = [5, 4, 3, 2, 1].map((estrellas) => {
            const cantidad = resenasFiltradas.filter((r) => r.calificacion === estrellas).length
            return { estrellas, cantidad, porcentaje: total ? (cantidad / total) * 100 : 0 }
        })
        return { total, promedio: total ? suma / total : 0, distribucion }
    }, [resenasFiltradas])

    // Lista final, ordenada según el selector "Ordenar reseñas".
    const lista = useMemo(() => {
        const copia = [...resenasFiltradas] // copia, para no modificar el original
        const masNueva = (a, b) => b.fecha - a.fecha // desempate: la más reciente primero
        if (orden === 'mejor') return copia.sort((a, b) => b.calificacion - a.calificacion || masNueva(a, b))
        if (orden === 'peor') return copia.sort((a, b) => a.calificacion - b.calificacion || masNueva(a, b))
        if (orden === 'utiles') return copia.sort((a, b) => b.votantes.length - a.votantes.length || masNueva(a, b))
        return copia.sort(masNueva) // 'recientes' (por defecto)
    }, [resenasFiltradas, orden])

    // Cuántas reseñas tiene un producto (el número que se ve al lado en el filtro).
    const cantidadPorProducto = (id) => resenas.filter((r) => mismoProducto(r.productoId, id)).length

    // Guarda la reseña en Firestore y limpia la pantalla. Lo llama el formulario.
    const publicar = async (datos) => {
        if (!cuenta) return // solo usuarios con cuenta pueden publicar

        await crearResena({
            ...datos,
            // Datos del autor: el uid es lo que valida Firebase en sus reglas de seguridad.
            autorUid: cuenta.uid,
            autorNombre: nombrePublico(cuenta),
            autorCorreo: cuenta.correo,
        })

        // Se cierra el formulario, se quita el filtro y se muestra la nueva arriba.
        setFormAbierto(false)
        setProductoFiltro(null)
        setOrden('recientes')
        mostrarAviso('¡Gracias! Tu reseña ya está publicada.')
    }

    // Solo se puede borrar una reseña propia (Firestore también lo valida con sus reglas).
    const eliminar = async (id) => {
        try {
            await eliminarResena(id)
            mostrarAviso('Tu reseña fue eliminada.')
        } catch (err) {
            console.error('No se pudo eliminar la reseña:', err)
            mostrarAviso('No pudimos eliminar la reseña. Probá de nuevo.', 'error')
        }
    }

    // Botón "Útil": agrega o quita tu voto (cada usuario vota una sola vez por reseña).
    const alternarUtil = async (item) => {
        // Sin sesión no se puede votar: se avisa.
        if (!cuenta) {
            mostrarAviso('Iniciá sesión para marcar una reseña como útil.', 'info')
            return
        }

        try {
            // El tercer dato indica si ya habías votado (en ese caso se quita el voto).
            await alternarVotoResena(item.id, cuenta.uid, item.votantes.includes(cuenta.uid))
        } catch (err) {
            console.error('No se pudo registrar el voto:', err)
            mostrarAviso('No pudimos registrar tu voto. Probá de nuevo.', 'error')
        }
    }

    return (
        <div className="cm-layout">
            {/* ---------- SIDEBAR (columna izquierda) ---------- */}
            <aside className="cm-sidebar">
                <h2 className="cm-sidebar-titulo">Opiniones</h2>

                {/* Resumen: nota promedio, estrellas y cantidad de reseñas. */}
                <div className="cm-resumen">
                    <div className="cm-resumen-nota">
                        <span className="cm-nota">{resumen.total ? resumen.promedio.toFixed(1) : '–'}</span>
                        <div>
                            <Estrellas valor={resumen.promedio} />
                            <span className="cm-resumen-total">
                                {resumen.total} {resumen.total === 1 ? 'reseña' : 'reseñas'}
                            </span>
                        </div>
                    </div>

                    {/* Barras: cuántas reseñas hay de 5, 4, 3, 2 y 1 estrella. */}
                    <ul className="cm-distribucion">
                        {resumen.distribucion.map((fila) => (
                            <li key={fila.estrellas}>
                                <span className="cm-dist-label">{fila.estrellas} <i className="bi bi-star-fill" aria-hidden="true"></i></span>
                                <span className="cm-dist-barra">
                                    {/* El ancho del relleno es el porcentaje de reseñas con esa nota. */}
                                    <span className="cm-dist-relleno" style={{ width: `${fila.porcentaje}%` }} />
                                </span>
                                <span className="cm-dist-cantidad">{fila.cantidad}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Filtro por producto (la lista sale de Firestore). */}
                <h3 className="cm-filtro-titulo">Filtrar por producto</h3>
                <ul className="cm-lista-filtros cm-lista-scroll">
                    <li>
                        {/* "Todos": quita el filtro. */}
                        <button
                            className={productoFiltro === null ? 'cm-filtro activo' : 'cm-filtro'}
                            onClick={() => setProductoFiltro(null)}
                        >
                            Todos
                            <span className="cm-filtro-cant">{resenas.length}</span>
                        </button>
                    </li>
                    {/* Un botón por producto, con su cantidad de reseñas. */}
                    {productos.map((p) => (
                        <li key={p.id}>
                            <button
                                className={productoFiltro !== null && mismoProducto(productoFiltro, p.id) ? 'cm-filtro activo' : 'cm-filtro'}
                                onClick={() => setProductoFiltro(String(p.id))}
                            >
                                <span className="cm-filtro-nombre">{p.nombre}</span>
                                <span className="cm-filtro-cant">{cantidadPorProducto(p.id)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* ---------- CONTENIDO (columna derecha) ---------- */}
            <div className="cm-contenido">
                {/* Barra superior: abrir/cerrar formulario y selector de orden. */}
                <div className="cm-barra">
                    <button
                        className="cm-btn cm-btn-prim"
                        onClick={() => setFormAbierto((abierto) => !abierto)}
                        aria-expanded={formAbierto}
                        disabled={sesionCargando} // se habilita cuando Firebase confirma si hay sesión
                    >
                        <i className={formAbierto ? 'bi bi-x-lg' : 'bi bi-plus-lg'} aria-hidden="true"></i>
                        {formAbierto ? 'Cerrar' : 'Escribir reseña'}
                    </button>

                    <select
                        className="cm-select-orden"
                        value={orden}
                        onChange={(e) => setOrden(e.target.value)}
                        aria-label="Ordenar reseñas"
                    >
                        <option value="recientes">Más recientes</option>
                        <option value="utiles">Más útiles</option>
                        <option value="mejor">Mejor calificadas</option>
                        <option value="peor">Peor calificadas</option>
                    </select>
                </div>

                {/* Mensaje temporal ("¡Gracias!...", errores, etc.). */}
                <Aviso aviso={aviso} />

                {/* Si el formulario está abierto: con sesión se ve el formulario, sin sesión el cartel "Necesitás una cuenta". */}
                {formAbierto && (cuenta ? (
                    <FormularioResena
                        cuenta={cuenta}
                        productos={productos}
                        productosCargando={productosCargando}
                        productosError={productosError}
                        productoInicial={productoFiltro}
                        onPublicar={publicar}
                        onCancelar={() => setFormAbierto(false)}
                    />
                ) : (
                    <AvisoSesion accion="escribir una reseña" onCerrar={() => setFormAbierto(false)} />
                ))}

                {/* Lista de reseñas. Mientras carga (o si falla) se muestra el estado correspondiente. */}
                {cargando || error ? (
                    <EstadoLista cargando={cargando} error={error} />
                ) : (
                    <div className="cm-lista">
                        {/* Una tarjeta por reseña. */}
                        {lista.map((item) => {
                            const producto = buscarProducto(item.productoId) // producto al que pertenece
                            const votado = !!cuenta && item.votantes.includes(cuenta.uid) // ¿ya marcaste "Útil"?

                            return (
                                <article className="cm-card" key={item.id}>
                                    {/* Cabecera: portada, nombre del producto, artista, estrellas y fecha. */}
                                    <header className="cm-resena-cab">
                                        <div className="cm-miniatura">
                                            {producto?.imagen && <img src={producto.imagen} alt="" />}
                                        </div>
                                        <div className="cm-resena-datos">
                                            <h3 className="cm-card-titulo">
                                                {/* Si el producto existe: enlace a su ficha. Si no, un texto de respaldo. */}
                                                {producto ? (
                                                    <Link to={`/Productos/${producto.id}`}>{producto.nombre}</Link>
                                                ) : productosCargando ? (
                                                    'Cargando...'
                                                ) : (
                                                    'Producto no disponible'
                                                )}
                                            </h3>
                                            {producto && <span className="cm-artista">{producto.artista}</span>}
                                            <div className="cm-resena-meta">
                                                <Estrellas valor={item.calificacion} />
                                                <span className="cm-fecha">{formatearFecha(item.fecha)}</span>
                                            </div>
                                        </div>
                                    </header>

                                    {/* Texto de la reseña. */}
                                    <p className="cm-texto">{item.comentario}</p>

                                    {/* Pie: autor a la izquierda; acciones a la derecha. */}
                                    <footer className="cm-card-pie">
                                        <span className="cm-autor">
                                            <Avatar nombre={item.autorNombre || '?'} />
                                            {item.autorNombre}
                                        </span>
                                        <span className="cm-acciones">
                                            {/* "Eliminar" solo aparece en tus propias reseñas. */}
                                            {cuenta && item.autorUid === cuenta.uid && (
                                                <BotonEliminar
                                                    onConfirmar={() => eliminar(item.id)}
                                                    etiqueta="Eliminar mi reseña"
                                                />
                                            )}
                                            {/* Botón "Útil" con el contador de votos. */}
                                            <button
                                                className={votado ? 'cm-btn-mini activo' : 'cm-btn-mini'}
                                                onClick={() => alternarUtil(item)}
                                                aria-pressed={votado}
                                            >
                                                <i className={votado ? 'bi bi-hand-thumbs-up-fill' : 'bi bi-hand-thumbs-up'} aria-hidden="true"></i>
                                                Útil · {item.votantes.length}
                                            </button>
                                        </span>
                                    </footer>
                                </article>
                            )
                        })}

                        {/* Estado vacío: no hay reseñas (o ninguna con ese filtro). */}
                        {lista.length === 0 && (
                            <div className="cm-vacio">
                                <i className="bi bi-chat-square-text" aria-hidden="true"></i>
                                <p>Todavía no hay reseñas</p>
                                <button className="cm-btn cm-btn-sec" onClick={() => setFormAbierto(true)} disabled={sesionCargando}>
                                    Sé el primero en opinar
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

/* ============================================================
   5A. FORMULARIO DE RECOMENDACIÓN
   ------------------------------------------------------------
   Se abre con el botón "Hacer recomendación". Pide: tipo,
   título (álbum, artista o equipo) y el motivo.
   Funciona igual que el formulario de reseña.
   ============================================================ */
function FormularioRecomendacion({ cuenta, onPublicar, onCancelar }) {
    const [tipo, setTipo] = useState(TIPOS[0]) // arranca en el primer tipo ("Vinilo")
    const [titulo, setTitulo] = useState('')
    const [comentario, setComentario] = useState('')
    const [errores, setErrores] = useState({})       // errores de validación por campo
    const [enviando, setEnviando] = useState(false)  // true mientras se guarda
    const [errorEnvio, setErrorEnvio] = useState('') // error al guardar

    // Se ejecuta al apretar "Publicar".
    const enviar = async (e) => {
        e.preventDefault()

        // Paso 1: validar.
        const nuevos = {}
        if (titulo.trim().length < 2) nuevos.titulo = '¿Qué querés recomendar?'
        if (comentario.trim().length < 10) nuevos.comentario = 'Contanos por qué (mínimo 10 caracteres).'

        setErrores(nuevos)
        if (Object.keys(nuevos).length > 0) return

        // Paso 2: guardar en Firestore.
        setEnviando(true)
        setErrorEnvio('')

        try {
            await onPublicar({ tipo, titulo: titulo.trim(), comentario: comentario.trim() })
        } catch (err) {
            console.error('No se pudo publicar la recomendación:', err)
            setErrorEnvio('No pudimos publicar tu recomendación. Probá de nuevo en un momento.')
            setEnviando(false)
        }
    }

    return (
        <form className="cm-form" onSubmit={enviar} noValidate>
            <h3 className="cm-form-titulo">Hacer una recomendación</h3>
            <p className="cm-publicando">Publicando como <strong>{nombrePublico(cuenta)}</strong></p>

            <div className="cm-form-grid">
                {/* ---- Campo 1: tipo de recomendación ---- */}
                <Campo etiqueta="Tipo" htmlFor="rc-tipo" ancho="completo">
                    <select id="rc-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                        {TIPOS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </Campo>

                {/* ---- Campo 2: qué se recomienda (máximo 60 caracteres) ---- */}
                <Campo etiqueta="Álbum, artista o equipo" htmlFor="rc-titulo" error={errores.titulo} ancho="completo">
                    <input
                        id="rc-titulo"
                        type="text"
                        maxLength={60}
                        placeholder="Ej: Kind of Blue – Miles Davis"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        aria-invalid={!!errores.titulo}
                    />
                </Campo>

                {/* ---- Campo 3: el motivo (máximo 500 caracteres) ---- */}
                <Campo etiqueta="¿Por qué lo recomendás?" htmlFor="rc-comentario" error={errores.comentario} ancho="completo">
                    <textarea
                        id="rc-comentario"
                        rows={4}
                        maxLength={500}
                        placeholder="Contale a la comunidad qué te gustó."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        aria-invalid={!!errores.comentario}
                    />
                    <span className="cm-contador">{comentario.length}/500</span>
                </Campo>
            </div>

            {/* Error al guardar. */}
            {errorEnvio && <p className="cm-aviso cm-aviso-error" role="alert">{errorEnvio}</p>}

            {/* Botones (bloqueados mientras se envía). */}
            <div className="cm-form-acciones">
                <button type="button" className="cm-btn cm-btn-sec" onClick={onCancelar} disabled={enviando}>Cancelar</button>
                <button type="submit" className="cm-btn cm-btn-prim" disabled={enviando}>
                    {enviando ? 'Publicando...' : 'Publicar'}
                </button>
            </div>
        </form>
    )
}

/* ============================================================
   5B. SECCIÓN: COMUNIDAD
   ------------------------------------------------------------
   Pestaña "Comunidad". Izquierda: filtro por tipo. Derecha:
   botón para recomendar y lista de recomendaciones con "Me gusta".
   ============================================================ */
function SeccionComunidad({ cuenta, sesionCargando, coleccion }) {
    // "coleccion" trae las recomendaciones desde Firestore.
    const { datos: recomendaciones, cargando, error } = coleccion

    const [tipoActivo, setTipoActivo] = useState(null)    // null = todas
    const [formAbierto, setFormAbierto] = useState(false) // ¿está abierto el formulario?
    const [aviso, mostrarAviso] = useAviso()              // mensajes temporales

    // Firestore ya las trae de la más nueva a la más vieja.
    // Acá solo se aplica el filtro por tipo.
    const lista = useMemo(
        () => (tipoActivo ? recomendaciones.filter((r) => r.tipo === tipoActivo) : recomendaciones),
        [recomendaciones, tipoActivo],
    )

    // Cuántas recomendaciones hay de cada tipo (número del filtro).
    const cantidadPorTipo = (tipo) => recomendaciones.filter((r) => r.tipo === tipo).length

    // Guarda la recomendación en Firestore y limpia la pantalla. Lo llama el formulario.
    const publicar = async (datos) => {
        if (!cuenta) return // solo usuarios con cuenta pueden publicar

        await crearRecomendacion({
            ...datos,
            autorUid: cuenta.uid,
            autorNombre: nombrePublico(cuenta),
            autorCorreo: cuenta.correo,
        })

        setFormAbierto(false)
        setTipoActivo(null)
        mostrarAviso('¡Gracias por recomendar! Ya está publicado.')
    }

    // Solo se puede borrar una opinión propia (Firestore también lo valida con sus reglas).
    const eliminar = async (id) => {
        try {
            await eliminarRecomendacion(id)
            mostrarAviso('Tu recomendación fue eliminada.')
        } catch (err) {
            console.error('No se pudo eliminar la recomendación:', err)
            mostrarAviso('No pudimos eliminarla. Probá de nuevo.', 'error')
        }
    }

    // Botón "Me gusta": agrega o quita tu like (uno por usuario).
    const alternarLike = async (item) => {
        // Sin sesión no se puede dar me gusta: se avisa.
        if (!cuenta) {
            mostrarAviso('Iniciá sesión para dar me gusta.', 'info')
            return
        }

        try {
            await alternarVotoRecomendacion(item.id, cuenta.uid, item.votantes.includes(cuenta.uid))
        } catch (err) {
            console.error('No se pudo registrar el me gusta:', err)
            mostrarAviso('No pudimos registrar tu me gusta. Probá de nuevo.', 'error')
        }
    }

    return (
        <div className="cm-layout">
            {/* ---------- SIDEBAR (columna izquierda): filtro por tipo ---------- */}
            <aside className="cm-sidebar">
                <h2 className="cm-sidebar-titulo">Comunidad</h2>

                <ul className="cm-lista-filtros">
                    <li>
                        {/* "Todas": quita el filtro. */}
                        <button
                            className={tipoActivo === null ? 'cm-filtro activo' : 'cm-filtro'}
                            onClick={() => setTipoActivo(null)}
                        >
                            Todas
                            <span className="cm-filtro-cant">{recomendaciones.length}</span>
                        </button>
                    </li>
                    {/* Un botón por cada tipo (Vinilo, Cassette, CD...). */}
                    {TIPOS.map((tipo) => (
                        <li key={tipo}>
                            <button
                                className={tipoActivo === tipo ? 'cm-filtro activo' : 'cm-filtro'}
                                onClick={() => setTipoActivo(tipo)}
                            >
                                {tipo}
                                <span className="cm-filtro-cant">{cantidadPorTipo(tipo)}</span>
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Nota de convivencia. */}
                <p className="cm-nota-chica">
                    <i className="bi bi-music-note-beamed" aria-hidden="true"></i>
                    Recomendá lo que realmente escuchaste o usaste, y siempre con respeto.
                </p>
            </aside>

            {/* ---------- CONTENIDO (columna derecha) ---------- */}
            <div className="cm-contenido">
                {/* Barra superior: abrir/cerrar el formulario. */}
                <div className="cm-barra">
                    <button
                        className="cm-btn cm-btn-prim"
                        onClick={() => setFormAbierto((abierto) => !abierto)}
                        aria-expanded={formAbierto}
                        disabled={sesionCargando}
                    >
                        <i className={formAbierto ? 'bi bi-x-lg' : 'bi bi-plus-lg'} aria-hidden="true"></i>
                        {formAbierto ? 'Cerrar' : 'Hacer recomendación'}
                    </button>
                </div>

                {/* Mensaje temporal. */}
                <Aviso aviso={aviso} />

                {/* Formulario (con sesión) o cartel "Necesitás una cuenta" (sin sesión). */}
                {formAbierto && (cuenta ? (
                    <FormularioRecomendacion
                        cuenta={cuenta}
                        onPublicar={publicar}
                        onCancelar={() => setFormAbierto(false)}
                    />
                ) : (
                    <AvisoSesion accion="publicar una opinión" onCerrar={() => setFormAbierto(false)} />
                ))}

                {/* Lista de recomendaciones. */}
                {cargando || error ? (
                    <EstadoLista cargando={cargando} error={error} />
                ) : (
                    <div className="cm-lista">
                        {/* Una tarjeta por recomendación. */}
                        {lista.map((item) => {
                            const meGusta = !!cuenta && item.votantes.includes(cuenta.uid) // ¿ya diste me gusta?

                            return (
                                <article className="cm-card" key={item.id}>
                                    {/* Cabecera: etiqueta del tipo y fecha. */}
                                    <header className="cm-reco-cab">
                                        <span className="cm-tag">{item.tipo}</span>
                                        <span className="cm-fecha">{formatearFecha(item.fecha)}</span>
                                    </header>

                                    {/* Qué se recomienda y por qué. */}
                                    <h3 className="cm-card-titulo cm-reco-titulo">{item.titulo}</h3>
                                    <p className="cm-texto">{item.comentario}</p>

                                    {/* Pie: autor a la izquierda; acciones a la derecha. */}
                                    <footer className="cm-card-pie">
                                        <span className="cm-autor">
                                            <Avatar nombre={item.autorNombre || '?'} />
                                            {item.autorNombre}
                                        </span>
                                        <span className="cm-acciones">
                                            {/* "Eliminar" solo aparece en tus propias recomendaciones. */}
                                            {cuenta && item.autorUid === cuenta.uid && (
                                                <BotonEliminar
                                                    onConfirmar={() => eliminar(item.id)}
                                                    etiqueta="Eliminar mi opinión"
                                                />
                                            )}
                                            {/* Botón "Me gusta" (corazón) con el contador. */}
                                            <button
                                                className={meGusta ? 'cm-btn-mini activo' : 'cm-btn-mini'}
                                                onClick={() => alternarLike(item)}
                                                aria-pressed={meGusta}
                                                aria-label={meGusta ? 'Quitar me gusta' : 'Me gusta'}
                                            >
                                                <i className={meGusta ? 'bi bi-heart-fill' : 'bi bi-heart'} aria-hidden="true"></i>
                                                {item.votantes.length}
                                            </button>
                                        </span>
                                    </footer>
                                </article>
                            )
                        })}

                        {/* Estado vacío. */}
                        {lista.length === 0 && (
                            <div className="cm-vacio">
                                <i className="bi bi-music-note-list" aria-hidden="true"></i>
                                <p>Todavía no hay opiniones</p>
                                <button className="cm-btn cm-btn-sec" onClick={() => setFormAbierto(true)} disabled={sesionCargando}>
                                    Hacer la primera
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

/* ============================================================
   6. PÁGINA PRINCIPAL
   ------------------------------------------------------------
   Es el componente que se ve en la ruta /Comunidad. Carga los
   datos de Firestore y dibuja el encabezado, las pestañas y la
   sección que corresponda.
   ============================================================ */
function Comunidad() {
    const [pestana, setPestana] = useState('resenas') // pestaña activa: 'resenas' | 'comunidad'
    // Usuario con sesión iniciada: cuenta = null si no hay sesión; cargando = Firebase todavía verifica.
    const { cuenta, cargando: sesionCargando } = useUsuarioActual()
    // Tres suscripciones en tiempo real a Firestore: reseñas, recomendaciones y productos.
    const resenas = useColeccion(suscribirResenas)
    const recomendaciones = useColeccion(suscribirRecomendaciones)
    const catalogo = useColeccion(suscribirProductos)

    return (
        <div className="cm-page">
            <div className="cm-contenedor">
                {/* ---------- BREADCRUMB (ruta de navegación: Inicio > ...) ---------- */}
                <div className="cm-breadcrumb">
                    <Link to="/">Inicio</Link>
                    <span> &gt; </span>
                    <span>Reseñas y comunidad</span>
                </div>

                {/* ---------- ENCABEZADO: título, descripción y pestañas ---------- */}
                <header className="cm-header">
                    <h1 className="cm-titulo">Reseñas y comunidad</h1>
                    <p className="cm-subtitulo">
                        Opiná sobre los productos de la tienda y compartí tus recomendaciones con otros melómanos.
                    </p>

                    {/* Selector de pestañas: cambia la sección que se muestra abajo. */}
                    <div className="cm-tabs" role="tablist" aria-label="Secciones">
                        <button
                            role="tab"
                            aria-selected={pestana === 'resenas'}
                            className={pestana === 'resenas' ? 'cm-tab activo' : 'cm-tab'}
                            onClick={() => setPestana('resenas')}
                        >
                            <i className="bi bi-chat-square-text" aria-hidden="true"></i>
                            Reseñas
                        </button>
                        <button
                            role="tab"
                            aria-selected={pestana === 'comunidad'}
                            className={pestana === 'comunidad' ? 'cm-tab activo' : 'cm-tab'}
                            onClick={() => setPestana('comunidad')}
                        >
                            <i className="bi bi-people" aria-hidden="true"></i>
                            Comunidad
                        </button>
                    </div>
                </header>

                {/* ---------- CONTENIDO: según la pestaña activa ---------- */}
                {pestana === 'resenas' ? (
                    <SeccionResenas cuenta={cuenta} sesionCargando={sesionCargando} coleccion={resenas} catalogo={catalogo} />
                ) : (
                    <SeccionComunidad cuenta={cuenta} sesionCargando={sesionCargando} coleccion={recomendaciones} />
                )}
            </div>
        </div>
    )
}

export default Comunidad
 
