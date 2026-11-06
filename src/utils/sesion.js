import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { obtenerPerfil } from '../services/userService'

/* ============================================================
   SESIÓN (Firebase Authentication + perfil en Firestore)
   ------------------------------------------------------------
   Es la misma fuente de verdad que usa Perfil.jsx: el usuario
   que inició sesión en Firebase y su documento en "usuarios".
   ============================================================ */

// Nombre que se muestra públicamente: "Ana P." (nombre + inicial del apellido).
// Si el perfil no tiene nombre, se usa la parte del correo antes de la @.
export function nombrePublico(usuario) {
    const nombre = (usuario?.nombre || '').trim()
    const inicial = (usuario?.apellido || '').trim().charAt(0).toUpperCase()

    if (!nombre) return (usuario?.correo || '').split('@')[0] || 'Usuario'
    return inicial ? `${nombre} ${inicial}.` : nombre
}

// Hook: devuelve { cuenta, cargando }.
//  - cargando: true hasta que Firebase confirma si hay sesión o no.
//  - cuenta: { uid, correo, nombre, apellido, rol } o null si no hay sesión.
export function useUsuarioActual() {
    const [estado, setEstado] = useState({ cuenta: null, cargando: true })

    useEffect(() => {
        let activo = true

        const cancelar = onAuthStateChanged(auth, async (usuario) => {
            if (!usuario) {
                if (activo) setEstado({ cuenta: null, cargando: false })
                return
            }

            let perfil = null
            try {
                perfil = await obtenerPerfil(usuario.uid)
            } catch (error) {
                console.error('No se pudo leer el perfil:', error)
            }

            if (activo) {
                setEstado({
                    cuenta: {
                        uid: usuario.uid,
                        correo: usuario.email || '',
                        nombre: perfil?.nombre || '',
                        apellido: perfil?.apellido || '',
                        rol: perfil?.rol || 'usuario',
                    },
                    cargando: false,
                })
            }
        })

        return () => {
            activo = false
            cancelar()
        }
    }, [])

    return estado
}
