import React, { useRef, useState } from "react";

const MAX_LADO = 256; // tamaño final de la foto (px). Pequeña para que quepa en localStorage
const MAX_PESO_MB = 5; // peso máximo del archivo original

// Lee la imagen, la recorta en cuadrado (centrada) y la reduce.
// Devuelve un string "data:image/jpeg;base64,..." listo para usar en <img src>.
function procesarImagen(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(new Error("No se pudo leer la imagen."));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () =>
        reject(new Error("El archivo no es una imagen válida."));
      img.onload = () => {
        const lado = Math.min(img.width, img.height);
        const sx = (img.width - lado) / 2;
        const sy = (img.height - lado) / 2;
        const tam = Math.min(MAX_LADO, lado);

        const canvas = document.createElement("canvas");
        canvas.width = tam;
        canvas.height = tam;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff"; // fondo para PNG con transparencia
        ctx.fillRect(0, 0, tam, tam);
        ctx.drawImage(img, sx, sy, lado, lado, 0, 0, tam, tam);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

// Props:
//  value    -> foto actual (data URL) o ""
//  onChange -> se llama con la nueva foto, o "" si la quitan
function SelectorFoto({ value, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const handleArchivo = async (e) => {
    const archivo = e.target.files[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      setError("Elige un archivo de imagen.");
      return;
    }
    if (archivo.size > MAX_PESO_MB * 1024 * 1024) {
      setError(`La imagen no debe pesar más de ${MAX_PESO_MB} MB.`);
      return;
    }

    try {
      setError("");
      onChange(await procesarImagen(archivo));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="text-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="d-none"
        onChange={handleArchivo}
      />

      <button
        type="button"
        className="foto-circulo d-inline-flex align-items-center justify-content-center"
        onClick={() => inputRef.current.click()}
        title="Elegir foto"
        aria-label="Elegir foto de perfil"
      >
        {value ? (
          <img src={value} alt="Foto de perfil" />
        ) : (
          <i className="bi bi-camera fs-2"></i>
        )}
      </button>

      <div className="d-flex justify-content-center gap-2 mt-2">
        <button
          type="button"
          className="btn auth-social btn-sm px-3"
          onClick={() => inputRef.current.click()}
        >
          {value ? "Cambiar foto" : "Subir foto"}
        </button>
        {value && (
          <button
            type="button"
            className="btn btn-link auth-link btn-sm p-0"
            onClick={() => onChange("")}
          >
            Quitar
          </button>
        )}
      </div>

      {error && <div className="auth-error mt-2">{error}</div>}
    </div>
  );
}

export default SelectorFoto;