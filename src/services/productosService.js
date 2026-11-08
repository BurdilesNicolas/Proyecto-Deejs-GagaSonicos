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
  setDoc,
  updateDoc,
} from "firebase/firestore";

const COLECCION = "productos";

// Escucha los productos en tiempo real. El ID del documento también será el ID del producto.
export function suscribirProductos(alCambiar, alFallar) {
  const consulta = query(collection(db, COLECCION), orderBy("nombre"));

  return onSnapshot(
    consulta,
    (snapshot) => {
      const productos = snapshot.docs.map((documento) => ({
        id: /^\d+$/.test(documento.id) ? Number(documento.id) : documento.id,
        ...documento.data(),
      }));
      alCambiar(productos);
    },
    alFallar
  );
}

export function crearProducto(datos) {
  return addDoc(collection(db, COLECCION), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
}

export function actualizarProducto(id, datos) {
  return updateDoc(doc(db, COLECCION, String(id)), {
    ...datos,
    actualizadoEn: serverTimestamp(),
  });
}

export function eliminarProducto(id) {
  return deleteDoc(doc(db, COLECCION, String(id)));
}

// Importa el catálogo local una sola vez. Conserva los IDs numéricos existentes
// para que las reseñas antiguas sigan apuntando al mismo producto.
export async function importarCatalogoInicial(productosLocales) {
  const operaciones = productosLocales.map((producto) =>
    setDoc(
      doc(db, COLECCION, String(producto.id)),
      {
        ...producto,
        actualizadoEn: serverTimestamp(),
        creadoEn: serverTimestamp(),
      },
      { merge: true }
    )
  );

  await Promise.all(operaciones);
}
