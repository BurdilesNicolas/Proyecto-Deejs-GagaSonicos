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
  return await createUserWithEmailAndPassword(auth, email, password); //Crea un nuevo usuario con el correo electrónico y la contraseña proporcionados, y devuelve una promesa que se resuelve con el usuario autenticado si la creación es exitosa
};

// Iniciar sesión
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password); //Inicia sesión con el correo electrónico y la contraseña proporcionados, y devuelve una promesa que se resuelve con el usuario autenticado si las credenciales son correctas
};

// Cerrar sesión
export const logoutUser = async () => {
  return await signOut(auth); //Cierra la sesión del usuario actual en Firebase Authentication
};

// Enviar el correo de Firebase para restablecer o cambiar la contraseña
export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email); //Envía un correo electrónico de restablecimiento de contraseña al usuario
};