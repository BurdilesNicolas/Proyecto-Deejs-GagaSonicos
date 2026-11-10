// Archivo que contiene los servicios relacionados con el usuario, como guardar y obtener el perfil, así como obtener todos los usuarios registrados.
import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  getDocs
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
// Obtener todos los usuarios registrados
export const obtenerUsuarios = async () => {
  const referencia = collection(db, "usuarios");
  const consulta = await getDocs(referencia);

  return consulta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
};