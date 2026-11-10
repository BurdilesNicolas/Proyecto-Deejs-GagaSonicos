// Reseñas y recomendaciones de la comunidad, guardadas en Firestore.
//
// Colecciones:
//   "resenas"         -> { productoId, calificacion, comentario, autorUid, autorNombre,
//                          autorCorreo, votantes: [uid...], fecha }
//   "recomendaciones" -> { tipo, titulo, comentario, autorUid, autorNombre,
//                          autorCorreo, votantes: [uid...], fecha }
//
// "votantes" guarda el uid de cada persona que marcó "Útil" (reseñas) o "Me gusta"
// (recomendaciones). Así cada usuario solo puede votar una vez y el contador es
// simplemente votantes.length.
import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
// Tipos de recomendación (los usan el formulario, el filtro y el panel de administración).
export const TIPOS_RECOMENDACION = ["Vinilo", "Cassette", "CD", "Artista", "Equipo"];

// Tipos de recomendación (los usan el formulario, el filtro y el panel de administración).
export const TIPOS_RECOMENDACION = ["Vinilo", "Cassette", "CD", "Artista", "Equipo"];

const COLECCION_RESENAS = "resenas";
const COLECCION_RECOMENDACIONES = "recomendaciones";

/* ---------- Funciones genéricas (las comparten reseñas y recomendaciones) ---------- */

// Escucha la colección en tiempo real, de la más nueva a la más vieja.
// Devuelve la función para cancelar la suscripción.
function suscribir(nombreColeccion, alCambiar, alFallar) {
  const consulta = query(collection(db, nombreColeccion), orderBy("fecha", "desc"));

  return onSnapshot(
    consulta,
    (instantanea) => {
      alCambiar(
        instantanea.docs.map((documento) => {
          // "estimate": mientras el servidor confirma la fecha, se usa la hora local
          // para que lo recién publicado aparezca enseguida y en su lugar.
          const datos = documento.data({ serverTimestamps: "estimate" });

          return {
            id: documento.id,
            ...datos,
            fecha: datos.fecha?.toDate?.() ?? new Date(),
            votantes: datos.votantes ?? [],
          };
        })
      );
    },
    alFallar
  );
}

const crear = (nombreColeccion, datos) =>
  addDoc(collection(db, nombreColeccion), {
    ...datos,
    votantes: [],
    fecha: serverTimestamp(),
  });

const eliminar = (nombreColeccion, id) => deleteDoc(doc(db, nombreColeccion, id));

// Agrega o quita el voto de un usuario (sin pisar los votos de los demás).
const alternarVoto = (nombreColeccion, id, uid, yaVotado) =>
  updateDoc(doc(db, nombreColeccion, id), {
    votantes: yaVotado ? arrayRemove(uid) : arrayUnion(uid),
  });

/* ---------- Reseñas ---------- */
export const suscribirResenas = (alCambiar, alFallar) =>
  suscribir(COLECCION_RESENAS, alCambiar, alFallar);

export const crearResena = (datos) => crear(COLECCION_RESENAS, datos);

export const eliminarResena = (id) => eliminar(COLECCION_RESENAS, id);

export const alternarVotoResena = (id, uid, yaVotado) =>
  alternarVoto(COLECCION_RESENAS, id, uid, yaVotado);

/* ---------- Recomendaciones ---------- */
export const suscribirRecomendaciones = (alCambiar, alFallar) =>
  suscribir(COLECCION_RECOMENDACIONES, alCambiar, alFallar);

export const crearRecomendacion = (datos) => crear(COLECCION_RECOMENDACIONES, datos);

export const eliminarRecomendacion = (id) => eliminar(COLECCION_RECOMENDACIONES, id);

export const alternarVotoRecomendacion = (id, uid, yaVotado) =>
  alternarVoto(COLECCION_RECOMENDACIONES, id, uid, yaVotado);
