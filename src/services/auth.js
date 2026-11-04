//Bloque 1: Importa variables y funciones necesarias de Firebase para la autenticación de usuarios
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";

import { auth } from "./firebase";

//Bloque 2:Exporta funciones para registrar, iniciar sesión, cerrar sesión y restablecer la contraseña de usuarios utilizando Firebase Authentication

// Registrar usuario
export const registerUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Iniciar sesión
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Cerrar sesión
export const logoutUser = async () => {
  return await signOut(auth);
};

// Enviar el correo de Firebase para restablecer o cambiar la contraseña
export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};