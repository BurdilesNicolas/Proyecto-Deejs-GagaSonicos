import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import '../estilos/Comunidad.css'
import { useUsuarioActual, nombrePublico } from '../utils/sesion'
import {
    suscribirResenas,
    crearResena,
    eliminarResena,
    alternarVotoResena,
    suscribirRecomendaciones,
    crearRecomendacion,
    eliminarRecomendacion,
    alternarVotoRecomendacion,
    TIPOS_RECOMENDACION as TIPOS,
} from '../services/comunidadService'
import { suscribirProductos } from '../services/productosService'

/* ============================================================
   DATOS
   ------------------------------------------------------------
   Los productos salen de la colección "productos" de Firestore
   (la misma que administra AdminProductos y muestra el catálogo),
   así que la lista del formulario siempre está al día. Las
   reseñas y recomendaciones también viven en Firestore.
   ============================================================ */

const TEXTO_ESTRELLAS = { 1: 'Malo', 2: 'Regular', 3: 'Bueno', 4: 'Muy bueno', 5: 'Excelente' }

/* ============================================================
   UTILIDADES
   ============================================================ */

function formatearFecha(fecha) {
    return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Los ids de producto pueden ser números (catálogo original) o texto (productos
// nuevos): se comparan siempre como texto para que funcionen los dos.
function mismoProducto(a, b) {
    return String(a) === String(b)
}

// Carga una colección de Firestore en tiempo real: { datos, cargando, error }.
// "suscribir" tiene que ser una función estable (las del servicio lo son).
function useColeccion(suscribir) {
    const [estado, setEstado] = useState({ datos: [], cargando: true, error: '' })

    useEffect(() => {
        const cancelar = suscribir(
            (datos) => setEstado({ datos, cargando: false, error: '' }),
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
        return cancelar
    }, [suscribir])

    return estado
}

// Mensaje temporal ("¡Gracias!…") que se borra solo a los 4 segundos.
function useAviso() {
    const [aviso, setAviso] = useState(null) // { texto, tipo: 'ok' | 'error' | 'info' }
    const temporizador = useRef(null)

    const mostrar = useCallback((texto, tipo = 'ok') => {
        clearTimeout(temporizador.current)
        setAviso({ texto, tipo })
        temporizador.current = setTimeout(() => setAviso(null), 4000)
    }, [])

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
                    className={n <= Math.round(valor) ? 'bi bi-star-fill cm-estrella llena' : 'bi bi-star-fill cm-estrella'}
                    aria-hidden="true"
                ></i>
            ))}
        </span>
    )
}

// Estrellas clickeables para el formulario.
function SelectorEstrellas({ valor, onChange }) {
    const [hover, setHover] = useState(0)
    const activo = hover || valor

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
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHover(n)}
                >
                    <i className="bi bi-star-fill" aria-hidden="true"></i>
                </button>
            ))}
            {activo > 0 && <span className="cm-selector-texto">{TEXTO_ESTRELLAS[activo]}</span>}
        </div>
    )
}

function Campo({ etiqueta, htmlFor, error, children, ancho }) {
    return (
        <div className={ancho ? `cm-campo ${ancho}` : 'cm-campo'}>
            {htmlFor ? <label htmlFor={htmlFor}>{etiqueta}</label> : <span className="cm-label">{etiqueta}</span>}
            {children}
            {error && <span className="cm-error" role="alert">{error}</span>}
        </div>
    )
}

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
                <Link to="/Perfil" className="cm-btn cm-btn-prim">Iniciar sesión / Registrarse</Link>
            </div>
        </div>
    )
}

// Botón "Eliminar" con confirmación en dos pasos (evita borrar sin querer).
function BotonEliminar({ onConfirmar, etiqueta }) {
    const [confirmando, setConfirmando] = useState(false)

    if (confirmando) {
        return (
            <span className="cm-confirmar" role="group" aria-label="Confirmar eliminación">
                <span className="cm-confirmar-texto">¿Eliminar?</span>
                <button type="button" className="cm-btn-mini cm-btn-peligro" onClick={onConfirmar}>Sí</button>
                <button type="button" className="cm-btn-mini" onClick={() => setConfirmando(false)}>No</button>
            </span>
        )
    }

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
    if (cargando) {
        return (
            <div className="cm-estado" role="status">
                <div className="cm-spinner"></div>
                Cargando...
            </div>
        )
    }

    return (
        <div className="cm-estado cm-estado-error" role="alert">
            <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
            {error}
        </div>
    )
}

function Aviso({ aviso }) {
    if (!aviso) return null
    return <p className={`cm-aviso cm-aviso-${aviso.tipo}`} role="status">{aviso.texto}</p>
}

/* ============================================================
   FORMULARIO DE RESEÑA
   ============================================================ */
function FormularioResena({ cuenta, productos, productosCargando, productosError, productoInicial, onPublicar, onCancelar }) {
    const [productoId, setProductoId] = useState(productoInicial ? String(productoInicial) : '')
    const productoElegido = productos.find((p) => mismoProducto(p.id, productoId))
    const sinProductos = !productosCargando && productos.length === 0
    const [calificacion, setCalificacion] = useState(0)
    const [comentario, setComentario] = useState('')
    const [errores, setErrores] = useState({})
    const [enviando, setEnviando] = useState(false)
    const [errorEnvio, setErrorEnvio] = useState('')

    const enviar = async (e) => {
        e.preventDefault()

        const nuevos = {}
        if (!productoElegido) nuevos.productoId = 'Elegí un producto.'
        if (calificacion < 1) nuevos.calificacion = 'Elegí una calificación.'
        if (comentario.trim().length < 10) nuevos.comentario = 'Contanos un poco más (mínimo 10 caracteres).'

        setErrores(nuevos)
        if (Object.keys(nuevos).length > 0) return

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
        <form className="cm-form" onSubmit={enviar} noValidate>
            <h3 className="cm-form-titulo">Escribir una reseña</h3>
            <p className="cm-publicando">Publicando como <strong>{nombrePublico(cuenta)}</strong></p>

            <div className="cm-form-grid">
                <Campo etiqueta="Producto" htmlFor="rs-producto" error={errores.productoId} ancho="completo">
                    <select
                        id="rs-producto"
                        value={productoElegido ? productoId : ''}
                        onChange={(e) => setProductoId(e.target.value)}
                        aria-invalid={!!errores.productoId}
                        disabled={productosCargando || sinProductos}
                    >
                        <option value="">
                            {productosCargando
                                ? 'Cargando productos...'
                                : sinProductos
                                    ? 'No hay productos disponibles'
                                    : 'Seleccioná un producto'}
                        </option>
                        {productos.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.nombre}{p.artista ? ` · ${p.artista}` : ''}
                            </option>
                        ))}
                    </select>

                    {productosError && <span className="cm-error" role="alert">{productosError}</span>}

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

                <Campo etiqueta="Calificación" error={errores.calificacion} ancho="completo">
                    <SelectorEstrellas valor={calificacion} onChange={setCalificacion} />
                </Campo>

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

            {errorEnvio && <p className="cm-aviso cm-aviso-error" role="alert">{errorEnvio}</p>}

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
function SeccionResenas({ cuenta, sesionCargando, coleccion, catalogo }) {
    const { datos: resenas, cargando, error } = coleccion
    const { datos: productos, cargando: productosCargando, error: productosError } = catalogo

    const buscarProducto = (id) => productos.find((p) => mismoProducto(p.id, id))

    const [productoFiltro, setProductoFiltro] = useState(null) // null = todos
    const [orden, setOrden] = useState('recientes')
    const [formAbierto, setFormAbierto] = useState(false)
    const [aviso, mostrarAviso] = useAviso()

    const resenasFiltradas = useMemo(
        () => (productoFiltro ? resenas.filter((r) => mismoProducto(r.productoId, productoFiltro)) : resenas),
        [resenas, productoFiltro],
    )

    // Promedio y distribución de estrellas (para el resumen de la izquierda).
    const resumen = useMemo(() => {
        const total = resenasFiltradas.length
        const suma = resenasFiltradas.reduce((acc, r) => acc + r.calificacion, 0)
        const distribucion = [5, 4, 3, 2, 1].map((estrellas) => {
            const cantidad = resenasFiltradas.filter((r) => r.calificacion === estrellas).length
            return { estrellas, cantidad, porcentaje: total ? (cantidad / total) * 100 : 0 }
        })
        return { total, promedio: total ? suma / total : 0, distribucion }
    }, [resenasFiltradas])

    const lista = useMemo(() => {
        const copia = [...resenasFiltradas]
        const masNueva = (a, b) => b.fecha - a.fecha
        if (orden === 'mejor') return copia.sort((a, b) => b.calificacion - a.calificacion || masNueva(a, b))
        if (orden === 'peor') return copia.sort((a, b) => a.calificacion - b.calificacion || masNueva(a, b))
        if (orden === 'utiles') return copia.sort((a, b) => b.votantes.length - a.votantes.length || masNueva(a, b))
        return copia.sort(masNueva)
    }, [resenasFiltradas, orden])

    const cantidadPorProducto = (id) => resenas.filter((r) => mismoProducto(r.productoId, id)).length

    const publicar = async (datos) => {
        if (!cuenta) return // solo usuarios con cuenta pueden publicar

        await crearResena({
            ...datos,
            autorUid: cuenta.uid,
            autorNombre: nombrePublico(cuenta),
            autorCorreo: cuenta.correo,
        })

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

    const alternarUtil = async (item) => {
        if (!cuenta) {
            mostrarAviso('Iniciá sesión para marcar una reseña como útil.', 'info')
            return
        }

        try {
            await alternarVotoResena(item.id, cuenta.uid, item.votantes.includes(cuenta.uid))
        } catch (err) {
            console.error('No se pudo registrar el voto:', err)
            mostrarAviso('No pudimos registrar tu voto. Probá de nuevo.', 'error')
        }
    }

    return (
        <div className="cm-layout">
            {/* ---------- SIDEBAR ---------- */}
            <aside className="cm-sidebar">
                <h2 className="cm-sidebar-titulo">Opiniones</h2>

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

                    <ul className="cm-distribucion">
                        {resumen.distribucion.map((fila) => (
                            <li key={fila.estrellas}>
                                <span className="cm-dist-label">{fila.estrellas} <i className="bi bi-star-fill" aria-hidden="true"></i></span>
                                <span className="cm-dist-barra">
                                    <span className="cm-dist-relleno" style={{ width: `${fila.porcentaje}%` }} />
                                </span>
                                <span className="cm-dist-cantidad">{fila.cantidad}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <h3 className="cm-filtro-titulo">Filtrar por producto</h3>
                <ul className="cm-lista-filtros cm-lista-scroll">
                    <li>
                        <button
                            className={productoFiltro === null ? 'cm-filtro activo' : 'cm-filtro'}
                            onClick={() => setProductoFiltro(null)}
                        >
                            Todos
                            <span className="cm-filtro-cant">{resenas.length}</span>
                        </button>
                    </li>
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

            {/* ---------- CONTENIDO ---------- */}
            <div className="cm-contenido">
                <div className="cm-barra">
                    <button
                        className="cm-btn cm-btn-prim"
                        onClick={() => setFormAbierto((abierto) => !abierto)}
                        aria-expanded={formAbierto}
                        disabled={sesionCargando}
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

                <Aviso aviso={aviso} />

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

                {cargando || error ? (
                    <EstadoLista cargando={cargando} error={error} />
                ) : (
                    <div className="cm-lista">
                        {lista.map((item) => {
                            const producto = buscarProducto(item.productoId)
                            const votado = !!cuenta && item.votantes.includes(cuenta.uid)

                            return (
                                <article className="cm-card" key={item.id}>
                                    <header className="cm-resena-cab">
                                        <div className="cm-miniatura">
                                            {producto?.imagen && <img src={producto.imagen} alt="" />}
                                        </div>
                                        <div className="cm-resena-datos">
                                            <h3 className="cm-card-titulo">
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

                                    <p className="cm-texto">{item.comentario}</p>

                                    <footer className="cm-card-pie">
                                        <span className="cm-autor">
                                            <Avatar nombre={item.autorNombre || '?'} />
                                            {item.autorNombre}
                                        </span>
                                        <span className="cm-acciones">
                                            {cuenta && item.autorUid === cuenta.uid && (
                                                <BotonEliminar
                                                    onConfirmar={() => eliminar(item.id)}
                                                    etiqueta="Eliminar mi reseña"
                                                />
                                            )}
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
    const [tipo, setTipo] = useState(TIPOS[0])
    const [titulo, setTitulo] = useState('')
    const [comentario, setComentario] = useState('')
    const [errores, setErrores] = useState({})
    const [enviando, setEnviando] = useState(false)
    const [errorEnvio, setErrorEnvio] = useState('')

    const enviar = async (e) => {
        e.preventDefault()

        const nuevos = {}
        if (titulo.trim().length < 2) nuevos.titulo = '¿Qué querés recomendar?'
        if (comentario.trim().length < 10) nuevos.comentario = 'Contanos por qué (mínimo 10 caracteres).'

        setErrores(nuevos)
        if (Object.keys(nuevos).length > 0) return

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
                <Campo etiqueta="Tipo" htmlFor="rc-tipo" ancho="completo">
                    <select id="rc-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                        {TIPOS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </Campo>

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

            {errorEnvio && <p className="cm-aviso cm-aviso-error" role="alert">{errorEnvio}</p>}

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
    const { datos: recomendaciones, cargando, error } = coleccion

    const [tipoActivo, setTipoActivo] = useState(null) // null = todas
    const [formAbierto, setFormAbierto] = useState(false)
    const [aviso, mostrarAviso] = useAviso()

    // Firestore ya las trae de la más nueva a la más vieja.
    const lista = useMemo(
        () => (tipoActivo ? recomendaciones.filter((r) => r.tipo === tipoActivo) : recomendaciones),
        [recomendaciones, tipoActivo],
    )

    const cantidadPorTipo = (tipo) => recomendaciones.filter((r) => r.tipo === tipo).length

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

    const alternarLike = async (item) => {
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
            {/* ---------- SIDEBAR ---------- */}
            <aside className="cm-sidebar">
                <h2 className="cm-sidebar-titulo">Comunidad</h2>

                <ul className="cm-lista-filtros">
                    <li>
                        <button
                            className={tipoActivo === null ? 'cm-filtro activo' : 'cm-filtro'}
                            onClick={() => setTipoActivo(null)}
                        >
                            Todas
                            <span className="cm-filtro-cant">{recomendaciones.length}</span>
                        </button>
                    </li>
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

                <p className="cm-nota-chica">
                    <i className="bi bi-music-note-beamed" aria-hidden="true"></i>
                    Recomendá lo que realmente escuchaste o usaste, y siempre con respeto.
                </p>
            </aside>

            {/* ---------- CONTENIDO ---------- */}
            <div className="cm-contenido">
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

                <Aviso aviso={aviso} />

                {formAbierto && (cuenta ? (
                    <FormularioRecomendacion
                        cuenta={cuenta}
                        onPublicar={publicar}
                        onCancelar={() => setFormAbierto(false)}
                    />
                ) : (
                    <AvisoSesion accion="publicar una opinión" onCerrar={() => setFormAbierto(false)} />
                ))}

                {cargando || error ? (
                    <EstadoLista cargando={cargando} error={error} />
                ) : (
                    <div className="cm-lista">
                        {lista.map((item) => {
                            const meGusta = !!cuenta && item.votantes.includes(cuenta.uid)

                            return (
                                <article className="cm-card" key={item.id}>
                                    <header className="cm-reco-cab">
                                        <span className="cm-tag">{item.tipo}</span>
                                        <span className="cm-fecha">{formatearFecha(item.fecha)}</span>
                                    </header>

                                    <h3 className="cm-card-titulo cm-reco-titulo">{item.titulo}</h3>
                                    <p className="cm-texto">{item.comentario}</p>

                                    <footer className="cm-card-pie">
                                        <span className="cm-autor">
                                            <Avatar nombre={item.autorNombre || '?'} />
                                            {item.autorNombre}
                                        </span>
                                        <span className="cm-acciones">
                                            {cuenta && item.autorUid === cuenta.uid && (
                                                <BotonEliminar
                                                    onConfirmar={() => eliminar(item.id)}
                                                    etiqueta="Eliminar mi opinión"
                                                />
                                            )}
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
    const [pestana, setPestana] = useState('resenas') // 'resenas' | 'comunidad'
    const { cuenta, cargando: sesionCargando } = useUsuarioActual() // cuenta = null si no hay sesión
    const resenas = useColeccion(suscribirResenas)
    const recomendaciones = useColeccion(suscribirRecomendaciones)
    const catalogo = useColeccion(suscribirProductos)

    return (
        <div className="cm-page">
            <div className="cm-contenedor">
                {/* BREADCRUMB */}
                <div className="cm-breadcrumb">
                    <Link to="/">Inicio</Link>
                    <span> &gt; </span>
                    <span>Reseñas y comunidad</span>
                </div>

                {/* ENCABEZADO */}
                <header className="cm-header">
                    <h1 className="cm-titulo">Reseñas y comunidad</h1>
                    <p className="cm-subtitulo">
                        Opiná sobre los productos de la tienda y compartí tus recomendaciones con otros melómanos.
                    </p>

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
