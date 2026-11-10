import { useSyncExternalStore } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

function leerLocal(clave, normalizar) {
  try {
    return normalizar(JSON.parse(localStorage.getItem(clave) || '[]'))
  } catch {
    return []
  }
}

export function crearCuentaStore({ claveLocal, documento, normalizar }) {
  const evento = `deejs-${documento}-cambio`
  let uidActivo = null
  let cancelarSnapshot = null
  let colaGuardado = Promise.resolve()
  const suscriptores = new Set()
  let estado = {
    uid: null,
    items: leerLocal(claveLocal, normalizar),
    cargando: Boolean(auth.currentUser),
    error: '',
  }

  function notificar() {
    for (const suscriptor of suscriptores) suscriptor()
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(evento))
  }

  function actualizarEstado(cambios) {
    estado = { ...estado, ...cambios }
    notificar()
  }

  function limpiarLegacy() {
    try {
      localStorage.removeItem(claveLocal)
    } catch (error) {
      console.error(`No se pudo limpiar ${documento} local:`, error)
    }
  }

  onAuthStateChanged(auth, (usuario) => {
    if (cancelarSnapshot) cancelarSnapshot()
    cancelarSnapshot = null
    uidActivo = usuario?.uid ?? null
    colaGuardado = Promise.resolve()

    if (!usuario) {
      actualizarEstado({
        uid: null,
        items: leerLocal(claveLocal, normalizar),
        cargando: false,
        error: '',
      })
      return
    }

    const uid = usuario.uid
    const referencia = doc(db, 'usuarios', uid, 'preferencias', documento)
    actualizarEstado({ uid, items: [], cargando: true, error: '' })

    cancelarSnapshot = onSnapshot(referencia, async (snapshot) => {
      if (uidActivo !== uid) return

      try {
        let items
        if (snapshot.exists()) {
          items = normalizar(snapshot.data().items)
          limpiarLegacy()
        } else {
          items = leerLocal(claveLocal, normalizar)
          if (items.length > 0) {
            await setDoc(referencia, { items, actualizadoEn: serverTimestamp() })
          }
          limpiarLegacy()
        }

        if (uidActivo !== uid) return
        actualizarEstado({ uid, items, cargando: false, error: '' })
      } catch (error) {
        if (uidActivo !== uid) return
        console.error(`No se pudieron cargar los datos de ${documento}:`, error)
        actualizarEstado({
          uid,
          cargando: false,
          error: 'No se pudieron cargar tus datos. Revisá los permisos de Firestore.',
        })
      }
    }, (error) => {
      if (uidActivo !== uid) return
      console.error(`Error al sincronizar ${documento}:`, error)
      actualizarEstado({
        uid,
        cargando: false,
        error: 'No se pudieron sincronizar tus datos. Revisá los permisos de Firestore.',
      })
    })
  })

  async function esperarCarga(uid) {
    if (estado.uid === uid && !estado.cargando) return
    await new Promise((resolve) => {
      const comprobar = () => {
        if (estado.uid === uid && !estado.cargando) {
          suscriptores.delete(comprobar)
          resolve()
        } else if (auth.currentUser?.uid !== uid) {
          suscriptores.delete(comprobar)
          resolve()
        }
      }
      suscriptores.add(comprobar)
      comprobar()
    })
  }

  async function modificar(transformar) {
    const usuario = auth.currentUser
    if (!usuario) {
      const items = normalizar(transformar(leerLocal(claveLocal, normalizar)))
      try {
        localStorage.setItem(claveLocal, JSON.stringify(items))
      } catch (error) {
        console.error(`No se pudo guardar ${documento} en este navegador:`, error)
        throw error
      }
      actualizarEstado({ uid: null, items, cargando: false, error: '' })
      return items
    }

    const uid = usuario.uid
    await esperarCarga(uid)
    if (estado.error) throw new Error(estado.error)
    if (uidActivo !== uid || estado.uid !== uid) {
      throw new Error('La cuenta cambió. Volvé a intentar la operación.')
    }

    const items = normalizar(transformar(estado.items))
    actualizarEstado({ items, error: '' })
    const referencia = doc(db, 'usuarios', uid, 'preferencias', documento)
    const guardado = colaGuardado.catch(() => {}).then(() =>
      setDoc(referencia, { items, actualizadoEn: serverTimestamp() })
    )
    colaGuardado = guardado
    try {
      await guardado
      return items
    } catch (error) {
      console.error(`No se pudieron guardar los datos de ${documento}:`, error)
      if (uidActivo === uid && estado.uid === uid) {
        actualizarEstado({
          error: 'No se pudieron guardar tus cambios. Revisá los permisos de Firestore.',
        })
      }
      throw error
    }
  }

  function useStore() {
    return useSyncExternalStore(
      (suscriptor) => {
        suscriptores.add(suscriptor)
        return () => suscriptores.delete(suscriptor)
      },
      () => estado,
      () => estado
    )
  }

  return {
    useStore,
    getItems: () => estado.items,
    modificar,
    evento,
  }
}
