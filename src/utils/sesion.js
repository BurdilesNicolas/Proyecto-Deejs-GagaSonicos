import { useState, useEffect } from 'react'

/* ============================================================
   SESIÓN (compartida con Perfil.jsx)
   ------------------------------------------------------------
   Perfil.jsx guarda la sesión en localStorage con estas mismas
   claves. Acá solo se LEE, para saber si hay un usuario con
   cuenta y quién es.
   ============================================================ */
const CLAVE_USUARIOS = 'usuarios'
const CLAVE_SESION = 'sesionCorreo'
const CLAVE_TOKEN = 'userToken'

// Devuelve el usuario con sesión abierta, o null si no hay.
export function obtenerUsuarioActual() {
    try {
        if (!localStorage.getItem(CLAVE_TOKEN)) return null
        const correo = localStorage.getItem(CLAVE_SESION)
        const usuarios = JSON.parse(localStorage.getItem(CLAVE_USUARIOS)) || []
        return usuarios.find((u) => u.correo === correo) || null
    } catch {
        return null
    }
}

// Nombre que se muestra públicamente: "Ana P." (nombre + inicial del apellido).
export function nombrePublico(usuario) {
    const nombre = (usuario?.nombre || '').trim()
    const inicial = (usuario?.apellido || '').trim().charAt(0).toUpperCase()
    return inicial ? `${nombre} ${inicial}.` : nombre || 'Usuario'
}

// Hook: usuario actual. Se actualiza si la sesión cambia en otra pestaña.
export function useUsuarioActual() {
    const [usuario, setUsuario] = useState(obtenerUsuarioActual)

    useEffect(() => {
        const alCambiar = () => setUsuario(obtenerUsuarioActual())
        window.addEventListener('storage', alCambiar)
        return () => window.removeEventListener('storage', alCambiar)
    }, [])

    return usuario
}
