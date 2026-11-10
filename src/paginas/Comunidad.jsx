// ===== Imports =====
import { useState, useMemo, useEffect, useRef, useCallback } from 'react' // hooks de React
import { Link } from 'react-router-dom'                                    // enlaces entre páginas
import '../estilos/Comunidad.css'                                          // estilos de esta página (clases "cm-")
import { productos } from '../data/Productos'                              // lista de productos (archivo local)
import { useUsuarioActual, nombrePublico } from '../utils/sesion'          // usuario logueado y su nombre público
import {
    suscribirResenas,           // escucha las reseñas en tiempo real
    crearResena,                // guarda una reseña
    eliminarResena,             // borra una reseña
    alternarVotoResena,         // agrega/quita el voto "Útil"
    suscribirRecomendaciones,   // escucha las recomendaciones en tiempo real
    crearRecomendacion,         // guarda una recomendación
    eliminarRecomendacion,      // borra una recomendación
    alternarVotoRecomendacion,  // agrega/quita el "Me gusta"
} from '../services/comunidadService'                                      // funciones que hablan con Firestore

/* ============================================================
   DATOS
   ------------------------------------------------------------
   Los productos salen de src/data/Productos.js (la misma lista
   que usan el catálogo y la ficha), así las reseñas nunca quedan
   desfasadas. Las reseñas y recomendaciones viven en Firestore.
   ============================================================ */

// Tipos de recomendación (se usan en el filtro y en el formulario).
const TIPOS = ['Vinilo', 'Cassette', 'CD', 'Artista', 'Equipo']

// Palabra que acompaña a cada cantidad de estrellas.
const TEXTO_ESTRELLAS = { 1: 'Malo', 2: 'Regular', 3: 'Bueno', 4: 'Muy bueno', 5: 'Excelente' }

/* ============================================================
   UTILIDADES
   ============================================================ */

// Convierte una fecha en texto legible. Ej: "10 nov 2026".
function formatearFecha(fecha) {
    return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Devuelve el producto que tiene ese id (o undefined si no existe).
function buscarProducto(id) {
    return productos.find((p) => p.id === id)
}

// Carga una colección de Firestore en tiempo real: { datos, cargando, error }.
// "suscribir" tiene que ser una función estable (las del servicio lo son).
function useColeccion(suscribir) {
    // Arranca sin datos y en "cargando".
    const [estado, setEstado] = useState({ datos: [], cargando: true, error: '' })

    useEffect(() => {
        // Se suscribe: Firestore avisa cada vez que algo cambia.
        const cancelar = suscribir(
            // Llegaron datos: se guardan y termina la carga.
            (datos) => setEstado({ datos, cargando: false, error: '' }),
            // Falló la consulta: se guarda un mensaje de error.
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
        return cancelar // al salir de la página, deja de escuchar
    }, [suscribir])

    return estado
}

// Mensaje temporal ("¡Gracias!…") que se borra solo a los 4 segundos.
function useAviso() {
    const [aviso, setAviso] = useState(null) // { texto, tipo: 'ok' | 'error' | 'info' }
    const temporizador = useRef(null)        // guarda el temporizador para poder cancelarlo

    // Muestra un aviso y programa su desaparición.
    const mostrar = useCallback((texto, tipo = 'ok') => {
        clearTimeout(temporizador.current) // si había otro aviso, reinicia el conteo
        setAviso({ texto, tipo })
        temporizador.current = setTimeout(() => setAviso(null), 4000)
    }, [])

    // Al cerrar la página, cancela el temporizador pendiente.
    useEffect(() => () => clearTimeout(temporizador.current), [])

    return [aviso, mostrar]
}

/* ============================================================
   COMPONENTES CHICOS
   ============================================================ */

// Estrellas de solo lectura.
function Estrellas({ valor }) {
    return (
        <span className="cm-estrellas" role="img" aria-label={`${valor.toFixed(1)} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <i
                    key={n}
                    // Dorada si entra en la nota (redondeada), gris si no.
                    className={n <= Math.round(valor) ? 'bi bi-star-fill cm-estrella llena' : 'bi bi-star-fill cm-estrella'}
                    aria-hidden="true"
                ></i>
            ))}
        </span>
    )
}

// Estrellas clickeables para el formulario.
function SelectorEstrellas({ valor, onChange }) {
    const [hover, setHover] = useState(0) // estrella bajo el mouse (0 = ninguna)
    const activo = hover || valor          // mientras pasás el mouse se previsualiza esa nota

    return (
        <div className="cm-selector" role="radiogroup" aria-label="Calificación" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={valor === n}
                    aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                    className={n <= activo ? 'cm-selector-btn llena' : 'cm-selector-btn'}
                    onClick={() => onChange(n)}      // confirma la nota
                    onMouseEnter={() => setHover(n)} // previsualiza la nota
                >
                    <i className="bi bi-star-fill" aria-hidden="true"></i>
                </button>
            ))}
            {/* Palabra de la nota: "Malo", "Bueno"... */}
            {activo > 0 && <span className="cm-selector-texto">{TEXTO_ESTRELLAS[activo]}</span>}
        </div>
    )
}

// Envoltorio de un campo del formulario: etiqueta + control + mensaje de error.
function Campo({ etiqueta, htmlFor, error, children, ancho }) {
    return (
        <div className={ancho ? `cm-campo ${ancho}` : 'cm-campo'}>
            {/* Con input asociado usa <label>; sin input (estrellas) usa <span>. */}
            {htmlFor ? <label htmlFor={htmlFor}>{etiqueta}</label> : <span className="cm-label">{etiqueta}</span>}
            {children}
            {error && <span className="cm-error" role="alert">{error}</span>}
        </div>
    )
}

// Círculo con la inicial del autor.
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
                {/* Lleva a /Perfil (login y registro). */}
                <Link to="/Perfil" className="cm-btn cm-btn-prim">Iniciar sesión / Registrarse</Link>
            </div>
        </div>
    )
}

// Botón "Eliminar" con confirmación en dos pasos (evita borrar sin querer).
function BotonEliminar({ onConfirmar, etiqueta }) {
    const [confirmando, setConfirmando] = useState(false) // false = botón normal, true = "¿Eliminar? Sí / No"

    // Paso 2: pregunta si de verdad querés eliminar.
    if (confirmando) {
        return (
            <span className="cm-confirmar" role="group" aria-label="Confirmar eliminación">
                <span className="cm-confirmar-texto">¿Eliminar?</span>
                <button type="button" className="cm-btn-mini cm-btn-peligro" onClick={onConfirmar}>Sí</button>
                <button type="button" className="cm-btn-mini" onClick={() => setConfirmando(false)}>No</button>
            </span>
        )
    }

    // Paso 1: el botón "Eliminar" común.
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
    // Mientras Firestore responde: spinner.
    if (cargando) {
        return (
            <div className="cm-estado" role="status">
                <div className="cm-spinner"></div>
                Cargando...
            </div>
        )
    }

    // Si falló: mensaje de error.
    return (
        <div className="cm-estado cm-estado-error" role="alert">
            <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
            {error}
        </div>
    )
}

// Mensaje temporal (verde = éxito, rojo = error, violeta = info). Se alimenta de useAviso().
function Aviso({ aviso }) {
    if (!aviso) return null // sin aviso, no dibuja nada
    return <p className={`cm-aviso cm-aviso-${aviso.tipo}`} role="status">{aviso.texto}</p>
}

/* ============================================================
   FORMULARIO DE RESEÑA
   ============================================================ */
function FormularioResena({ cuenta, productoInicial, onPublicar, onCancelar }) {
    // Producto elegido (texto, porque así lo devuelve el <select>). Si venías filtrando, ya aparece elegido.
    const [productoId, setProductoId] = useState(productoInicial ? String(productoInicial) : '')
    const [calificacion, setCalificacion] = useState(0) // 0 = sin elegir
    const [comentario, setComentario] = useState('')
    const [errores, setErrores] = useState({})          // errores de validación por campo
    const [enviando, setEnviando] = useState(false)     // true mientras se guarda
    const [errorEnvio, setErrorEnvio] = useState('')    // error al guardar

    // Se ejecuta al apretar "Publicar reseña".
    const enviar = async (e) => {
        e.preventDefault() // evita que el navegador recargue la página

        // 1) Validar los campos.
        const nuevos = {}
        if (!productoId) nuevos.productoId = 'Elegí un producto.'
        if (calificacion < 1) nuevos.calificacion = 'Elegí una calificación.'
        if (comentario.trim().length < 10) nuevos.comentario = 'Contanos un poco más (mínimo 10 caracteres).'

        setErrores(nuevos)
        if (Object.keys(nuevos).length > 0) return // si hay errores, no envía

        // 2) Guardar en Firestore.
        setEnviando(true)
        setErrorEnvio('')

        try {
            await onPublicar({
                productoId: Number(productoId), // convierte el texto del <select> a número
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
        // noValidate: la validación la hacemos nosotros, no el navegador.
        <form className="cm-form" onSubmit={enviar} noValidate>
            <h3 className="cm-form-titulo">Escribir una reseña</h3>
            <p className="cm-publicando">Publicando como <strong>{nombrePublico(cuenta)}</strong></p>

            <div className="cm-form-grid">
                {/* Producto: lista con los productos de Productos.js. */}
                <Campo etiqueta="Producto" htmlFor="rs-producto" error={errores.productoId} ancho="completo">
                    <select
                        id="rs-producto"
                        value={productoId}
                        onChange={(e) => setProductoId(e.target.value)}
                        aria-invalid={!!errores.productoId}
                    >
                        <option value="">Seleccioná un producto</option>
                        {productos.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre} · {p.artista}</option>
                        ))}
                    </select>
                </Campo>

                {/* Calificación con estrellas. */}
                <Campo etiqueta="Calificación" error={errores.calificacion} ancho="completo">
                    <SelectorEstrellas valor={calificacion} onChange={setCalificacion} />
                </Campo>

                {/* Comentario (máx. 500 caracteres) con contador. */}
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
                    <span className="cm-contador">{comentario.length}/500</span>
                </Campo>
            </div>

            {/* Error al guardar (distinto de los errores de validación). */}
            {errorEnvio && <p className="cm-aviso cm-aviso-error" role="alert">{errorEnvio}</p>}

            {/* Botones: se bloquean mientras se envía para evitar duplicados. */}
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
   SECCIÓN: RESEÑAS
   ============================================================ */
function SeccionResenas({ cuenta, sesionCargando, coleccion }) {
    // Reseñas traídas de Firestore, con su estado de carga y error.
    const { datos: resenas, cargando, error } = coleccion

    const [productoFiltro, setProductoFiltro] = useState(null) // null = todos
    const [orden, setOrden] = useState('recientes')            // criterio de orden
    const [formAbierto, setFormAbierto] = useState(false)      // ¿formulario abierto?
    const [aviso, mostrarAviso] = useAviso()                   // mensajes temporales

    // Reseñas que quedan tras aplicar el filtro por producto.
    const resenasFiltradas = useMemo(
        () => (productoFiltro ? resenas.filter((r) => r.productoId === productoFiltro) : resenas),
        [resenas, productoFiltro],
    )

    // Promedio y distribución de estrellas (para el resumen de la izquierda).
    const resumen = useMemo(() => {
        const total = resenasFiltradas.length
        const suma = resenasFiltradas.reduce((acc, r) => acc + r.calificacion, 0)
        // Por cada nota (5 a 1): cuántas reseñas y qué porcentaje del total (largo de la barra).
        const distribucion = [5, 4, 3, 2, 1].map((estrellas) => {
            const cantidad = resenasFiltradas.filter((r) => r.calificacion === estrellas).length
            return { estrellas, cantidad, porcentaje: total ? (cantidad / total) * 100 : 0 }
        })
        return { total, promedio: total ? suma / total : 0, distribucion }
    }, [resenasFiltradas])

    // Lista final, ordenada según el selector.
    const lista = useMemo(() => {
        const copia = [...resenasFiltradas]           // copia para no modificar el original
        const masNueva = (a, b) => b.fecha - a.fecha  // desempate: la más reciente primero
        if (orden === 'mejor') return copia.sort((a, b) => b.calificacion - a.calificacion || masNueva(a, b))
        if (orden === 'peor') return copia.sort((a, b) => a.calificacion - b.calificacion || masNueva(a, b))
        if (orden === 'utiles') return copia.sort((a, b) => b.votantes.length - a.votantes.length || masNueva(a, b))
        return copia.sort(masNueva) // 'recientes' (por defecto)
    }, [resenasFiltradas, orden])

    // Cuántas reseñas tiene un producto (número que se ve en el filtro).
    const cantidadPorProducto = (id) => resenas.filter((r) => r.productoId === id).length

    // Guarda la reseña en Firestore (la llama el formulario).
    const publicar = async (datos) => {
        if (!cuenta) return // solo usuarios con cuenta pueden publicar

        await crearResena({
            ...datos,
            // Datos del autor (el uid lo valida Firebase en sus reglas).
            autorUid: cuenta.uid,
            autorNombre: nombrePublico(cuenta),
            autorCorreo: cuenta.correo,
        })

        // Cierra el formulario, quita filtros y muestra la nueva arriba.
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

    // Botón "Útil": agrega o quita tu voto (uno por usuario).
    const alternarUtil = async (item) => {
        // Sin sesión no se puede votar.
        if (!cuenta) {
            mostrarAviso('Iniciá sesión para marcar una reseña como útil.', 'info')
            return
        }

        try {
            // El 3.er dato indica si ya habías votado (en ese caso se quita el voto).
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

                {/* Filtro por producto. */}
                <h3 className="cm-filtro-titulo">Filtrar por producto</h3>
                <ul className="cm-lista-filtros">
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
                                className={productoFiltro === p.id ? 'cm-filtro activo' : 'cm-filtro'}
                                onClick={() => setProductoFiltro(p.id)}
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
                {/* Barra superior: abrir/cerrar formulario y orden. */}
                <div className="cm-barra">
                    <button
                        className="cm-btn cm-btn-prim"
                        onClick={() => setFormAbierto((abierto) => !abierto)}
                        aria-expanded={formAbierto}
                        disabled={sesionCargando} // espera a que Firebase confirme si hay sesión
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

                {/* Mensaje temporal. */}
                <Aviso aviso={aviso} />

                {/* Formulario abierto: con sesión muestra el formulario; sin sesión, el cartel "Necesitás una cuenta". */}
                {formAbierto && (cuenta ? (
                    <FormularioResena
                        cuenta={cuenta}
                        productoInicial={productoFiltro}
                        onPublicar={publicar}
                        onCancelar={() => setFormAbierto(false)}
                    />
                ) : (
                    <AvisoSesion accion="escribir una reseña" onCerrar={() => setFormAbierto(false)} />
                ))}

                {/* Lista de reseñas (o spinner / error mientras carga o si falla). */}
                {cargando || error ? (
                    <EstadoLista cargando={cargando} error={error} />
                ) : (
                    <div className="cm-lista">
                        {/* Una tarjeta por reseña. */}
                        {lista.map((item) => {
                            const producto = buscarProducto(item.productoId)             // producto de la reseña
                            const votado = !!cuenta && item.votantes.includes(cuenta.uid) // ¿ya marcaste "Útil"?

                            return (
                                <article className="cm-card" key={item.id}>
                                    {/* Cabecera: portada, producto, artista, estrellas y fecha. */}
                                    <header className="cm-resena-cab">
                                        <div className="cm-miniatura">
                                            {producto?.imagen && <img src={producto.imagen} alt="" />}
                                        </div>
                                        <div className="cm-resena-datos">
                                            <h3 className="cm-card-titulo">
                                                {/* Si el producto existe: enlace a su ficha; si no, texto de respaldo. */}
                                                {producto ? (
                                                    <Link to={`/Productos/${producto.id}`}>{producto.nombre}</Link>
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

                                    {/* Pie: autor a la izquierda, acciones a la derecha. */}
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
                                            {/* Botón "Útil" con contador de votos. */}
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
   FORMULARIO DE RECOMENDACIÓN
   ============================================================ */
function FormularioRecomendacion({ cuenta, onPublicar, onCancelar }) {
    const [tipo, setTipo] = useState(TIPOS[0])       // arranca en "Vinilo"
    const [titulo, setTitulo] = useState('')
    const [comentario, setComentario] = useState('')
    const [errores, setErrores] = useState({})       // errores de validación por campo
    const [enviando, setEnviando] = useState(false)  // true mientras se guarda
    const [errorEnvio, setErrorEnvio] = useState('') // error al guardar

    // Se ejecuta al apretar "Publicar".
    const enviar = async (e) => {
        e.preventDefault()

        // 1) Validar.
        const nuevos = {}
        if (titulo.trim().length < 2) nuevos.titulo = '¿Qué querés recomendar?'
        if (comentario.trim().length < 10) nuevos.comentario = 'Contanos por qué (mínimo 10 caracteres).'

        setErrores(nuevos)
        if (Object.keys(nuevos).length > 0) return

        // 2) Guardar en Firestore.
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
                {/* Tipo de recomendación. */}
                <Campo etiqueta="Tipo" htmlFor="rc-tipo" ancho="completo">
                    <select id="rc-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                        {TIPOS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </Campo>

                {/* Qué se recomienda (máx. 60 caracteres). */}
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

                {/* Motivo (máx. 500 caracteres) con contador. */}
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
   SECCIÓN: COMUNIDAD
   ============================================================ */
function SeccionComunidad({ cuenta, sesionCargando, coleccion }) {
    // Recomendaciones traídas de Firestore, con su estado de carga y error.
    const { datos: recomendaciones, cargando, error } = coleccion

    const [tipoActivo, setTipoActivo] = useState(null)    // null = todas
    const [formAbierto, setFormAbierto] = useState(false) // ¿formulario abierto?
    const [aviso, mostrarAviso] = useAviso()              // mensajes temporales

    // Firestore ya las trae de la más nueva a la más vieja.
    // Acá solo se filtra por tipo.
    const lista = useMemo(
        () => (tipoActivo ? recomendaciones.filter((r) => r.tipo === tipoActivo) : recomendaciones),
        [recomendaciones, tipoActivo],
    )

    // Cuántas recomendaciones hay de cada tipo (número del filtro).
    const cantidadPorTipo = (tipo) => recomendaciones.filter((r) => r.tipo === tipo).length

    // Guarda la recomendación en Firestore (la llama el formulario).
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
        // Sin sesión no se puede dar me gusta.
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
                    {/* Un botón por tipo (Vinilo, Cassette, CD...). */}
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
                {/* Barra superior: abrir/cerrar formulario. */}
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

                {/* Lista de recomendaciones (o spinner / error). */}
                {cargando || error ? (
                    <EstadoLista cargando={cargando} error={error} />
                ) : (
                    <div className="cm-lista">
                        {/* Una tarjeta por recomendación. */}
                        {lista.map((item) => {
                            const meGusta = !!cuenta && item.votantes.includes(cuenta.uid) // ¿ya diste me gusta?

                            return (
                                <article className="cm-card" key={item.id}>
                                    {/* Cabecera: tipo y fecha. */}
                                    <header className="cm-reco-cab">
                                        <span className="cm-tag">{item.tipo}</span>
                                        <span className="cm-fecha">{formatearFecha(item.fecha)}</span>
                                    </header>

                                    {/* Qué se recomienda y por qué. */}
                                    <h3 className="cm-card-titulo cm-reco-titulo">{item.titulo}</h3>
                                    <p className="cm-texto">{item.comentario}</p>

                                    {/* Pie: autor a la izquierda, acciones a la derecha. */}
                                    <footer className="cm-card-pie">
                                        <span className="cm-autor">
                                            <Avatar nombre={item.autorNombre || '?'} />
                                            {item.autorNombre}
                                        </span>
                                        <span className="cm-acciones">
                                            {/* "Eliminar" solo en tus propias recomendaciones. */}
                                            {cuenta && item.autorUid === cuenta.uid && (
                                                <BotonEliminar
                                                    onConfirmar={() => eliminar(item.id)}
                                                    etiqueta="Eliminar mi opinión"
                                                />
                                            )}
                                            {/* "Me gusta" (corazón) con contador. */}
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
   PÁGINA
   ============================================================ */
function Comunidad() {
    const [pestana, setPestana] = useState('resenas') // pestaña activa: 'resenas' | 'comunidad'
    const { cuenta, cargando: sesionCargando } = useUsuarioActual() // cuenta = null si no hay sesión
    const resenas = useColeccion(suscribirResenas)                  // reseñas en tiempo real
    const recomendaciones = useColeccion(suscribirRecomendaciones)  // recomendaciones en tiempo real

    return (
        <div className="cm-page">
            <div className="cm-contenedor">
                {/* Ruta de navegación: Inicio > Reseñas y comunidad */}
                <div className="cm-breadcrumb">
                    <Link to="/">Inicio</Link>
                    <span> &gt; </span>
                    <span>Reseñas y comunidad</span>
                </div>

                {/* Encabezado: título, descripción y pestañas. */}
                <header className="cm-header">
                    <h1 className="cm-titulo">Reseñas y comunidad</h1>
                    <p className="cm-subtitulo">
                        Opiná sobre los productos de la tienda y compartí tus recomendaciones con otros melómanos.
                    </p>

                    {/* Pestañas: cambian la sección que se muestra abajo. */}
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

                {/* Sección según la pestaña activa. */}
                {pestana === 'resenas' ? (
                    <SeccionResenas cuenta={cuenta} sesionCargando={sesionCargando} coleccion={resenas} />
                ) : (
                    <SeccionComunidad cuenta={cuenta} sesionCargando={sesionCargando} coleccion={recomendaciones} />
                )}
            </div>
        </div>
    )
}

export default Comunidad