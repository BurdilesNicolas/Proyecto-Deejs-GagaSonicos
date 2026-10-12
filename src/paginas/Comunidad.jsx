import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../estilos/Comunidad.css'
import portada from '../assets/ProducutosImgs/IN RAINBOWS.jpg'

/* ============================================================
   DATOS
   ------------------------------------------------------------
   Esta lista replica la de productos.jsx. Cuando tengas los
   productos reales, conviene moverla a un archivo compartido
   (por ej. src/datos/productos.js) e importarla en las dos
   páginas, así reseñas y catálogo nunca quedan desfasados.
   ============================================================ */
const PRODUCTOS = [
    { id: 1, nombre: 'Producto 1', imagen: portada },
    { id: 2, nombre: 'Producto 2', imagen: portada },
    { id: 3, nombre: 'Producto 3', imagen: portada },
    { id: 4, nombre: 'Producto 4', imagen: portada },
    { id: 5, nombre: 'Producto 5', imagen: portada },
    { id: 6, nombre: 'Producto 6', imagen: portada },
    { id: 7, nombre: 'Producto 7', imagen: portada },
    { id: 8, nombre: 'Producto 8', imagen: portada },
]

// Tipos de recomendación (se usan en el filtro y en el formulario).
const TIPOS = ['Vinilo', 'Cassette', 'CD', 'Artista', 'Equipo']

const TEXTO_ESTRELLAS = { 1: 'Malo', 2: 'Regular', 3: 'Bueno', 4: 'Muy bueno', 5: 'Excelente' }

const RESENAS_INICIALES = [
    {
        id: 1, productoId: 1, usuario: 'Ana Vinyl', calificacion: 5, fecha: '2026-09-28', util: 6, votado: false,
        comentario: 'La edición suena impecable. La calidez del audio analógico realza muchísimo la producción del álbum y el packaging llegó perfecto.',
    },
    {
        id: 2, productoId: 3, usuario: 'Diego_Tape', calificacion: 4, fecha: '2026-09-30', util: 3, votado: false,
        comentario: 'Llegó en excelentes condiciones y bien protegido. Muy recomendado para coleccionistas.',
    },
    {
        id: 3, productoId: 1, usuario: 'Lucía M.', calificacion: 4, fecha: '2026-10-02', util: 2, votado: false,
        comentario: 'Gran sonido y buena relación precio-calidad. Le saco una estrella solo porque el envío tardó un poco más de lo previsto.',
    },
    {
        id: 4, productoId: 5, usuario: 'Tomás R.', calificacion: 5, fecha: '2026-10-05', util: 4, votado: false,
        comentario: 'Para los que disfrutamos del jazz, esta edición es una joya. Se nota el cuidado en el prensado.',
    },
    {
        id: 5, productoId: 2, usuario: 'Sol', calificacion: 3, fecha: '2026-10-07', util: 1, votado: false,
        comentario: 'Está bien, cumple lo que promete. Esperaba un poco más de detalle en la parte técnica de la descripción.',
    },
    {
        id: 6, productoId: 7, usuario: 'Mati_OST', calificacion: 5, fecha: '2026-10-09', util: 5, votado: false,
        comentario: 'Una banda sonora hermosa, ideal para escuchar de punta a punta. La calidad de impresión de la portada es de lo mejor que vi.',
    },
]

const RECOMENDACIONES_INICIALES = [
    {
        id: 1, usuario: 'Ana Vinyl', tipo: 'Vinilo', titulo: 'Blonde – Frank Ocean', fecha: '2026-10-01', likes: 12, meGusta: false,
        comentario: 'Un disco para escuchar de noche y sin interrupciones. En vinilo gana muchísimo, sobre todo las voces.',
    },
    {
        id: 2, usuario: 'Diego_Tape', tipo: 'Cassette', titulo: 'channel ORANGE – Frank Ocean', fecha: '2026-10-03', likes: 7, meGusta: false,
        comentario: 'Si recién empiezan a coleccionar cassettes, este es un gran primer paso: suena cálido y tiene mucha personalidad.',
    },
    {
        id: 3, usuario: 'Lucía M.', tipo: 'Artista', titulo: 'Khruangbin', fecha: '2026-10-04', likes: 9, meGusta: false,
        comentario: 'Psicodelia instrumental con groove. Perfecta para mates de tarde o para sumar a una playlist de fondo.',
    },
    {
        id: 4, usuario: 'Tomás R.', tipo: 'Equipo', titulo: 'Tornamesa de tracción directa', fecha: '2026-10-06', likes: 5, meGusta: false,
        comentario: 'Para empezar con vinilos vale la pena invertir en una buena púa antes que en parlantes caros. Se nota la diferencia.',
    },
    {
        id: 5, usuario: 'Sol', tipo: 'CD', titulo: 'Kind of Blue – Miles Davis', fecha: '2026-10-08', likes: 8, meGusta: false,
        comentario: 'Clásico absoluto. Si no escuchás jazz todavía, es la puerta de entrada ideal.',
    },
]

/* ============================================================
   UTILIDADES
   ============================================================ */

// Guarda el estado en localStorage para que sobreviva a un refresh.
// Si el navegador no lo permite, simplemente funciona en memoria.
function useAlmacenado(clave, inicial) {
    const [valor, setValor] = useState(() => {
        try {
            const guardado = localStorage.getItem(clave)
            return guardado ? JSON.parse(guardado) : inicial
        } catch {
            return inicial
        }
    })

    useEffect(() => {
        try {
            localStorage.setItem(clave, JSON.stringify(valor))
        } catch {
            // sin almacenamiento disponible: se ignora
        }
    }, [clave, valor])

    return [valor, setValor]
}

// Fecha local en formato AAAA-MM-DD (evita el desfase por UTC).
function hoy() {
    const d = new Date()
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mes}-${dia}`
}

function formatearFecha(iso) {
    return new Date(`${iso}T12:00:00`).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

function buscarProducto(id) {
    return PRODUCTOS.find((p) => p.id === id)
}

/* ============================================================
   COMPONENTES CHICOS
   ============================================================ */

// Estrellas de solo lectura.
function Estrellas({ valor }) {
    return (
        <span className="cm-estrellas" role="img" aria-label={`${valor} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= Math.round(valor) ? 'cm-estrella llena' : 'cm-estrella'} aria-hidden="true">
                    ★
                </span>
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
                    ★
                </button>
            ))}
            {activo > 0 && <span className="cm-selector-texto">{TEXTO_ESTRELLAS[activo]}</span>}
        </div>
    )
}

function Campo({ etiqueta, htmlFor, error, children, ancho }) {
    return (
        <div className={ancho ? `cm-campo ${ancho}` : 'cm-campo'}>
            <label htmlFor={htmlFor}>{etiqueta}</label>
            {children}
            {error && <span className="cm-error" role="alert">{error}</span>}
        </div>
    )
}

function Avatar({ nombre }) {
    return <span className="cm-avatar" aria-hidden="true">{nombre.trim().charAt(0).toUpperCase()}</span>
}

/* ============================================================
   FORMULARIO DE RESEÑA
   ============================================================ */
function FormularioResena({ productoInicial, onPublicar, onCancelar }) {
    const [productoId, setProductoId] = useState(productoInicial ? String(productoInicial) : '')
    const [calificacion, setCalificacion] = useState(0)
    const [usuario, setUsuario] = useState('')
    const [comentario, setComentario] = useState('')
    const [errores, setErrores] = useState({})

    const enviar = (e) => {
        e.preventDefault()

        const nuevos = {}
        if (!productoId) nuevos.productoId = 'Elegí un producto.'
        if (calificacion < 1) nuevos.calificacion = 'Elegí una calificación.'
        if (usuario.trim().length < 2) nuevos.usuario = 'Ingresá tu nombre o alias.'
        if (comentario.trim().length < 10) nuevos.comentario = 'Contanos un poco más (mínimo 10 caracteres).'

        setErrores(nuevos)
        if (Object.keys(nuevos).length > 0) return

        onPublicar({
            id: Date.now(),
            productoId: Number(productoId),
            usuario: usuario.trim(),
            calificacion,
            comentario: comentario.trim(),
            fecha: hoy(),
            util: 0,
            votado: false,
        })
    }

    return (
        <form className="cm-form" onSubmit={enviar} noValidate>
            <h3 className="cm-form-titulo">Escribir una reseña</h3>

            <div className="cm-form-grid">
                <Campo etiqueta="Producto" htmlFor="rs-producto" error={errores.productoId}>
                    <select
                        id="rs-producto"
                        value={productoId}
                        onChange={(e) => setProductoId(e.target.value)}
                        aria-invalid={!!errores.productoId}
                    >
                        <option value="">Seleccioná un producto</option>
                        {PRODUCTOS.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                </Campo>

                <Campo etiqueta="Tu nombre o alias" htmlFor="rs-usuario" error={errores.usuario}>
                    <input
                        id="rs-usuario"
                        type="text"
                        maxLength={30}
                        placeholder="Ej: Ana Vinyl"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        aria-invalid={!!errores.usuario}
                    />
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

            <div className="cm-form-acciones">
                <button type="button" className="cm-btn cm-btn-sec" onClick={onCancelar}>Cancelar</button>
                <button type="submit" className="cm-btn cm-btn-prim">Publicar reseña</button>
            </div>
        </form>
    )
}

/* ============================================================
   SECCIÓN: RESEÑAS
   ============================================================ */
function SeccionResenas({ resenas, setResenas }) {
    const [productoFiltro, setProductoFiltro] = useState(null) // null = todos
    const [orden, setOrden] = useState('recientes')
    const [formAbierto, setFormAbierto] = useState(false)
    const [aviso, setAviso] = useState('')

    const resenasFiltradas = useMemo(
        () => (productoFiltro ? resenas.filter((r) => r.productoId === productoFiltro) : resenas),
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
        if (orden === 'mejor') return copia.sort((a, b) => b.calificacion - a.calificacion || b.id - a.id)
        if (orden === 'peor') return copia.sort((a, b) => a.calificacion - b.calificacion || b.id - a.id)
        if (orden === 'utiles') return copia.sort((a, b) => b.util - a.util || b.id - a.id)
        return copia.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
    }, [resenasFiltradas, orden])

    const cantidadPorProducto = (id) => resenas.filter((r) => r.productoId === id).length

    const publicar = (nueva) => {
        setResenas((prev) => [nueva, ...prev])
        setFormAbierto(false)
        setProductoFiltro(null)
        setOrden('recientes')
        setAviso('¡Gracias! Tu reseña ya está publicada.')
        setTimeout(() => setAviso(''), 4000)
    }

    const alternarUtil = (id) => {
        setResenas((prev) =>
            prev.map((r) => (r.id === id ? { ...r, votado: !r.votado, util: r.util + (r.votado ? -1 : 1) } : r)),
        )
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
                                <span className="cm-dist-label">{fila.estrellas} ★</span>
                                <span className="cm-dist-barra">
                                    <span className="cm-dist-relleno" style={{ width: `${fila.porcentaje}%` }} />
                                </span>
                                <span className="cm-dist-cantidad">{fila.cantidad}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <h3 className="cm-filtro-titulo">Filtrar por producto</h3>
                <ul className="cm-lista-filtros">
                    <li>
                        <button
                            className={productoFiltro === null ? 'cm-filtro activo' : 'cm-filtro'}
                            onClick={() => setProductoFiltro(null)}
                        >
                            Todos
                        </button>
                    </li>
                    {PRODUCTOS.map((p) => (
                        <li key={p.id}>
                            <button
                                className={productoFiltro === p.id ? 'cm-filtro activo' : 'cm-filtro'}
                                onClick={() => setProductoFiltro(p.id)}
                            >
                                {p.nombre}
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
                    >
                        {formAbierto ? 'Cerrar' : '+ Escribir reseña'}
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

                {aviso && <p className="cm-aviso" role="status">{aviso}</p>}

                {formAbierto && (
                    <FormularioResena
                        productoInicial={productoFiltro}
                        onPublicar={publicar}
                        onCancelar={() => setFormAbierto(false)}
                    />
                )}

                <div className="cm-lista">
                    {lista.map((item) => {
                        const producto = buscarProducto(item.productoId)
                        return (
                            <article className="cm-card" key={item.id}>
                                <header className="cm-resena-cab">
                                    <div className="cm-miniatura">
                                        {producto?.imagen && <img src={producto.imagen} alt="" />}
                                    </div>
                                    <div className="cm-resena-datos">
                                        <h3 className="cm-card-titulo">{producto ? producto.nombre : 'Producto'}</h3>
                                        <div className="cm-resena-meta">
                                            <Estrellas valor={item.calificacion} />
                                            <span className="cm-fecha">{formatearFecha(item.fecha)}</span>
                                        </div>
                                    </div>
                                </header>

                                <p className="cm-texto">{item.comentario}</p>

                                <footer className="cm-card-pie">
                                    <span className="cm-autor">
                                        <Avatar nombre={item.usuario} />
                                        {item.usuario}
                                    </span>
                                    <button
                                        className={item.votado ? 'cm-btn-mini activo' : 'cm-btn-mini'}
                                        onClick={() => alternarUtil(item.id)}
                                        aria-pressed={item.votado}
                                    >
                                        Útil · {item.util}
                                    </button>
                                </footer>
                            </article>
                        )
                    })}

                    {lista.length === 0 && (
                        <div className="cm-vacio">
                            <p>Todavía no hay reseñas para este producto.</p>
                            <button className="cm-btn cm-btn-sec" onClick={() => setFormAbierto(true)}>
                                Sé el primero en opinar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ============================================================
   FORMULARIO DE RECOMENDACIÓN
   ============================================================ */
function FormularioRecomendacion({ onPublicar, onCancelar }) {
    const [usuario, setUsuario] = useState('')
    const [tipo, setTipo] = useState(TIPOS[0])
    const [titulo, setTitulo] = useState('')
    const [comentario, setComentario] = useState('')
    const [errores, setErrores] = useState({})

    const enviar = (e) => {
        e.preventDefault()

        const nuevos = {}
        if (usuario.trim().length < 2) nuevos.usuario = 'Ingresá tu nombre o alias.'
        if (titulo.trim().length < 2) nuevos.titulo = '¿Qué querés recomendar?'
        if (comentario.trim().length < 10) nuevos.comentario = 'Contanos por qué (mínimo 10 caracteres).'

        setErrores(nuevos)
        if (Object.keys(nuevos).length > 0) return

        onPublicar({
            id: Date.now(),
            usuario: usuario.trim(),
            tipo,
            titulo: titulo.trim(),
            comentario: comentario.trim(),
            fecha: hoy(),
            likes: 0,
            meGusta: false,
        })
    }

    return (
        <form className="cm-form" onSubmit={enviar} noValidate>
            <h3 className="cm-form-titulo">Hacer una recomendación</h3>

            <div className="cm-form-grid">
                <Campo etiqueta="Tu nombre o alias" htmlFor="rc-usuario" error={errores.usuario}>
                    <input
                        id="rc-usuario"
                        type="text"
                        maxLength={30}
                        placeholder="Ej: Diego_Tape"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        aria-invalid={!!errores.usuario}
                    />
                </Campo>

                <Campo etiqueta="Tipo" htmlFor="rc-tipo">
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

            <div className="cm-form-acciones">
                <button type="button" className="cm-btn cm-btn-sec" onClick={onCancelar}>Cancelar</button>
                <button type="submit" className="cm-btn cm-btn-prim">Publicar</button>
            </div>
        </form>
    )
}

/* ============================================================
   SECCIÓN: COMUNIDAD
   ============================================================ */
function SeccionComunidad({ recomendaciones, setRecomendaciones }) {
    const [tipoActivo, setTipoActivo] = useState(null) // null = todas
    const [formAbierto, setFormAbierto] = useState(false)
    const [aviso, setAviso] = useState('')

    const lista = useMemo(() => {
        const filtradas = tipoActivo ? recomendaciones.filter((r) => r.tipo === tipoActivo) : recomendaciones
        return [...filtradas].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
    }, [recomendaciones, tipoActivo])

    const cantidadPorTipo = (tipo) => recomendaciones.filter((r) => r.tipo === tipo).length

    const publicar = (nueva) => {
        setRecomendaciones((prev) => [nueva, ...prev])
        setFormAbierto(false)
        setTipoActivo(null)
        setAviso('¡Gracias por recomendar! Ya está publicado.')
        setTimeout(() => setAviso(''), 4000)
    }

    const alternarLike = (id) => {
        setRecomendaciones((prev) =>
            prev.map((r) => (r.id === id ? { ...r, meGusta: !r.meGusta, likes: r.likes + (r.meGusta ? -1 : 1) } : r)),
        )
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
                    Recomendá lo que realmente escuchaste o usaste, y siempre con respeto. 🎶
                </p>
            </aside>

            {/* ---------- CONTENIDO ---------- */}
            <div className="cm-contenido">
                <div className="cm-barra">
                    <button
                        className="cm-btn cm-btn-prim"
                        onClick={() => setFormAbierto((abierto) => !abierto)}
                        aria-expanded={formAbierto}
                    >
                        {formAbierto ? 'Cerrar' : '+ Hacer recomendación'}
                    </button>
                </div>

                {aviso && <p className="cm-aviso" role="status">{aviso}</p>}

                {formAbierto && (
                    <FormularioRecomendacion onPublicar={publicar} onCancelar={() => setFormAbierto(false)} />
                )}

                <div className="cm-lista">
                    {lista.map((item) => (
                        <article className="cm-card" key={item.id}>
                            <header className="cm-reco-cab">
                                <span className="cm-tag">{item.tipo}</span>
                                <span className="cm-fecha">{formatearFecha(item.fecha)}</span>
                            </header>

                            <h3 className="cm-card-titulo cm-reco-titulo">{item.titulo}</h3>
                            <p className="cm-texto">{item.comentario}</p>

                            <footer className="cm-card-pie">
                                <span className="cm-autor">
                                    <Avatar nombre={item.usuario} />
                                    {item.usuario}
                                </span>
                                <button
                                    className={item.meGusta ? 'cm-btn-mini activo' : 'cm-btn-mini'}
                                    onClick={() => alternarLike(item.id)}
                                    aria-pressed={item.meGusta}
                                    aria-label={item.meGusta ? 'Quitar me gusta' : 'Me gusta'}
                                >
                                    {item.meGusta ? '♥' : '♡'} {item.likes}
                                </button>
                            </footer>
                        </article>
                    ))}

                    {lista.length === 0 && (
                        <div className="cm-vacio">
                            <p>Todavía no hay recomendaciones en esta categoría.</p>
                            <button className="cm-btn cm-btn-sec" onClick={() => setFormAbierto(true)}>
                                Hacer la primera
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ============================================================
   PÁGINA
   ============================================================ */
function Comunidad() {
    const [pestana, setPestana] = useState('resenas') // 'resenas' | 'comunidad'
    const [resenas, setResenas] = useAlmacenado('deejs_resenas', RESENAS_INICIALES)
    const [recomendaciones, setRecomendaciones] = useAlmacenado('deejs_recomendaciones', RECOMENDACIONES_INICIALES)

    return (
        <div className="cm-page">
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
                        Reseñas
                    </button>
                    <button
                        role="tab"
                        aria-selected={pestana === 'comunidad'}
                        className={pestana === 'comunidad' ? 'cm-tab activo' : 'cm-tab'}
                        onClick={() => setPestana('comunidad')}
                    >
                        Comunidad
                    </button>
                </div>
            </header>

            {pestana === 'resenas' ? (
                <SeccionResenas resenas={resenas} setResenas={setResenas} />
            ) : (
                <SeccionComunidad recomendaciones={recomendaciones} setRecomendaciones={setRecomendaciones} />
            )}
        </div>
    )
}

export default Comunidad
