import { crearCuentaStore } from './cuentaStore'

// Este nombre identifica la lista que se conserva en el navegador cuando no
// hay sesión. Al iniciar sesión, crearCuentaStore la sincroniza por separado
// para cada usuario autenticado en Firestore.
const CLAVE = 'wishlist-deejs'

// La wishlist guarda referencias, no copias completas de los artículos:
// cada entrada tiene un ID y el catálogo de origen al que pertenece. Así se
// pueden guardar discos y merch incluso si ambos usan el mismo ID.
const wishlistStore = crearCuentaStore({
  claveLocal: CLAVE,
  documento: 'wishlist',
  // Normaliza los datos leídos del almacenamiento antes de usarlos:
  // - acepta el formato anterior, que guardaba solamente IDs de discos;
  // - convierte cada entrada a { id, tipo };
  // - descarta entradas incompletas y elimina duplicados del mismo catálogo.
  normalizar: (favoritos) => {
    if (!Array.isArray(favoritos)) return []
    const normalizados = favoritos
      .filter((favorito) => favorito !== null && favorito !== undefined)
      .map((favorito) => typeof favorito === 'object'
        ? { id: favorito.id, tipo: favorito.tipo === 'merch' ? 'merch' : 'producto' }
        : { id: favorito, tipo: 'producto' })
      .filter((favorito) => favorito.id !== null && favorito.id !== undefined)
    return normalizados.filter((favorito, indice) =>
      normalizados.findIndex((otro) =>
        otro.tipo === favorito.tipo && String(otro.id) === String(favorito.id)
      ) === indice
    )
  },
})

// Alterna un artículo en la lista: si ya estaba guardado en ese catálogo,
// lo quita; si no, añade su ID y tipo. El store persiste el cambio y notifica
// a los componentes suscritos, además de propagar cualquier error de guardado.
export async function alternarWishlist(id, tipo = 'producto') {
  await wishlistStore.modificar((favoritos) =>
    favoritos.some((favorito) => favorito.tipo === tipo && String(favorito.id) === String(id))
      ? favoritos.filter((favorito) => !(favorito.tipo === tipo && String(favorito.id) === String(id)))
      : [...favoritos, { id, tipo }]
  )
}

// Hook compartido por las pantallas que consultan o cambian favoritos.
// useSyncExternalStore mantiene el componente al día cuando el store cambia,
// incluso si la actualización vino de otra pantalla o de Firestore.
export function useWishlist() {
  const estado = wishlistStore.useStore()
  const favoritos = estado.items

  return {
    // Elementos normalizados con forma { id, tipo }.
    favoritos,
    // Separa la espera inicial del estado vacío: sirve para no mostrar
    // momentáneamente una wishlist vacía mientras Firestore aún responde.
    cargando: estado.cargando,
    // Mensaje para informar fallos de lectura o sincronización en la interfaz.
    error: estado.error,
    // Compara ID y tipo para que un disco y una prenda con el mismo ID
    // sigan siendo favoritos distintos.
    estaEnWishlist: (id, tipo = 'producto') => favoritos.some(
      (favorito) => favorito.tipo === tipo && String(favorito.id) === String(id)
    ),
    // La misma operación se reutiliza desde tarjetas, detalles y wishlist.
    alternar: alternarWishlist,
  }
}