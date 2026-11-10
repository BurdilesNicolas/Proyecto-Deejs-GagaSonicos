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

// Guardar los datos del perfil en firestore
export const guardarPerfil = async (uid, datos) => {
  const referencia = doc(db, "usuarios", uid); //Hace referencia al documento usuario en firebase usando UID

  await setDoc(referencia, { //Guarda los datos en firebase
    ...datos,
    actualizadoEn: serverTimestamp()
  }, { merge: true }); //Evita que se borren los campos ya existentes fusionandolos con los viejos
};

// Obtener los datos del perfil
export const obtenerPerfil = async (uid) => { //Define la referencia al documento del usuario mediante su ID
  const referencia = doc(db, "usuarios", uid);
  const documento = await getDoc(referencia);

  if (documento.exists()) {
    return documento.data();
  }

  return null;
};
// Obtiene la lista de completa de todos los usuarios
export const obtenerUsuarios = async () => {
  const referencia = collection(db, "usuarios"); // referencia a la colección llamada Usuarios
  const consulta = await getDocs(referencia); //Trae todos los usuarios

  return consulta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data() //Copia todos los campos internos del usuario
  }));
};