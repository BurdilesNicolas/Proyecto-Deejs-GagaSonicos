//Componente SelectorFoto.jsx de Perfil.jsx y Registro.jsx
import React, { useRef, useState } from "react";

//Variables de control de la foto que elige el usuario
const FORMATOS_VALIDOS = ["image/jpeg", "image/png", "image/webp"]; //Acepta formato JPG, JPEG, PNG, WEBP
const MAX_PESO_MB = 2; //Peso máximo del archivo que elige el usuario. Posteriormente se reduce a 256x256 px y se guarda en Firebase Storage.
const LADO_FINAL = 256; //La foto guardada se reduce a 256 x 256 px para que quede fachera

// Lee la imagen, la recorta en cuadrado (centrada) y la reduce. Devuelve "data:image/jpeg;base64,..." (pesa unos 15-40 KB).
function procesarImagen(archivo) { // Devuelve una promesa que se resuelve con la imagen procesada como data URL
  return new Promise((resolve, reject) => {  //Una promesa en un objeto que devuelve el exito o el error de la función asincrona
    const lector = new FileReader(); //Objeto que permite leer archivos de manera asincrona
    lector.onerror = () => reject(new Error("No se pudo leer la imagen.")); //Si hay un error al leer el archivo, se rechaza la promesa con un mensaje de error
    lector.onload = () => { //Cuando se carga el archivo, se crea un objeto Image para procesarlo
      const img = new Image(); //Objeto que permite crear una imagen a partir de un archivo
      img.onerror = () => 
        reject(new Error("El archivo no es una imagen válida.")); //Si hay un error al cargar la imagen, se rechaza la promesa con un mensaje de error
      img.onload = () => { //Cuando se carga la imagen, se recorta y se reduce a 256x256 px
        const lado = Math.min(img.width, img.height);
        const sx = (img.width - lado) / 2;
        const sy = (img.height - lado) / 2;
        const tam = Math.min(LADO_FINAL, lado);

        const canvas = document.createElement("canvas"); //Crea un elemento canvas para dibujar la imagen recortada y reducida
        canvas.width = tam;
        canvas.height = tam;
        const ctx = canvas.getContext("2d"); //Obtiene el contexto de dibujo del canvas
        ctx.fillStyle = "#fff"; //Establece fondo para PNG/WEBP con transparencia
        ctx.fillRect(0, 0, tam, tam); //Rellena con el fondo en blanco
        ctx.drawImage(img, sx, sy, lado, lado, 0, 0, tam, tam); //Dibuja la imagen recortada y reducida
        resolve(canvas.toDataURL("image/jpeg", 0.85)); //Devuelve la imagen procesada como dato url
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo); //Lee el archivo como dato url (base64) y dispara el evento onload cuando termina
  });
}

//Componente SelectorFoto que permite al usuario elegir una foto de perfil, cambiarla o quitarla. Muestra una vista previa de la foto elegida y valida el formato y peso del archivo.
function SelectorFoto({ value, onChange }) { //Función que recibe como props (propiedades del componente) el valor de la foto y una función para actualizarlo
  const inputRef = useRef(null); //
  const [error, setError] = useState("");

  const handleArchivo = async (e) => { //Función asincrona que se ejecuta cuando el usuario elige un archivo. Valida el formato y peso del archivo, procesa la imagen y llama a onChange con la imagen procesada o vacía si se quita la foto
    const archivo = e.target.files[0];
    e.target.value = ""; //Permite volver a elegir el mismo archivo
    if (!archivo) return;

    if (!FORMATOS_VALIDOS.includes(archivo.type)) {
      setError("Formato no válido. Usa una imagen JPG, JPEG, PNG o WEBP."); //Muestra un mensaje de error si el formato del archivo no es válido
      return;
    }
    if (archivo.size > MAX_PESO_MB * 1024 * 1024) {
      setError(`La imagen es demasiado pesada. El máximo es ${MAX_PESO_MB} MB.`); //Muestra un mensaje de error si el peso del archivo es mayor al máximo permitido (2MB)
      return;
    }

    try { //Procesa la imagen y llama a onChange con la imagen procesada
      setError("");
      onChange(await procesarImagen(archivo));
    } catch (err) {
      setError(err.message); //Muestra un mensaje de error si hay un error al procesar la imagen
    }
  };

  return ( //Retorna el JSX del componente SelectorFoto que muestra un botón para elegir la foto, una vista previa de la foto elegida, un botón para cambiarla o quitarla y un mensaje de ayuda sobre el formato y peso del archivo
    <div className="text-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="d-none"
        onChange={handleArchivo} //Cuando el usuario elige un archivo, se ejecuta la función handleArchivo
      />

      <button
        type="button"
        className="foto-circulo"
        onClick={() => inputRef.current.click()} //Cuando el usuario hace click en el botón, se dispara el click del input file para abrir el explorador de archivos
        title="Elegir foto"
        aria-label="Elegir foto de perfil"
      >
        {value ? (<img src={value} alt="Vista previa de la foto de perfil" /> ) : (<i className="bi bi-camera fs-2"></i>)}
      </button>

      <div className="d-flex justify-content-center align-items-center gap-3 mt-2">
        <button
          type="button"
          className="btn auth-social btn-sm px-3"
          onClick={() => inputRef.current.click()} //Cuando el usuario hace click en el botón, abrer el explorador de archivos
        >
          {value ? "Cambiar foto" : "Subir foto"}
        </button>
        {value && (
          <button
            type="button"
            className="btn btn-link auth-link btn-sm p-0"
            onClick={() => onChange("")} //Cuando el usuario hace click en el botón, se llama a onChange con un valor vacío para quitar la foto
          >
            Quitar
          </button>
        )}
      </div>

      <small className="foto-ayuda d-block mt-2">
        JPG, PNG o WEBP · máximo {MAX_PESO_MB} MB
      </small>

      {error && <div className="auth-error mt-2">{error}</div>} //Muestra un mensaje de error si hay un error al elegir o procesar la foto
    </div>
  );
}

export default SelectorFoto;