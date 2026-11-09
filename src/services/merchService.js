import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const COLECCION = "merch";

export function suscribirMerch(alCambiar, alFallar) {
  const consulta = query(collection(db, COLECCION), orderBy("nombre"));

  return onSnapshot(
    consulta,
    (snapshot) => {
      alCambiar(snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      })));
    },
    alFallar
  );
}

export function crearMerch(datos) {
  return addDoc(collection(db, COLECCION), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
}

export function actualizarMerch(id, datos) {
  return updateDoc(doc(db, COLECCION, String(id)), {
    ...datos,
    actualizadoEn: serverTimestamp(),
  });
}

export function eliminarMerch(id) {
  return deleteDoc(doc(db, COLECCION, String(id)));
}
