import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

// Guardar los datos del perfil
export const guardarPerfil = async (uid, datos) => {
  const referencia = doc(db, "usuarios", uid);

  await setDoc(referencia, {
    ...datos,
    actualizadoEn: serverTimestamp()
  }, { merge: true });
};

// Obtener los datos del perfil
export const obtenerPerfil = async (uid) => {
  const referencia = doc(db, "usuarios", uid);
  const documento = await getDoc(referencia);

  if (documento.exists()) {
    return documento.data();
  }

  return null;
};