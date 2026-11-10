// Ventana de confirmación para eliminar un registro desde los paneles de administración
// (reseñas y recomendaciones). Los estilos (rv-modal-*) están en AdminReview.css.
//
// Props:
//  titulo, texto  -> encabezado y aviso de la ventana
//  children       -> detalle del registro que se va a borrar
//  eliminando     -> true mientras se espera a Firestore
//  error          -> mensaje de error (si falló)
//  onCancelar, onConfirmar
import { useEffect, useRef } from "react";

function ModalEliminar({ titulo, texto, children, eliminando, error, onCancelar, onConfirmar }) {
  const botonCancelar = useRef(null);

  // El foco empieza en "Cancelar" (la opción segura) y Esc cierra la ventana
  useEffect(() => {
    botonCancelar.current?.focus();

    const alTeclear = (e) => {
      if (e.key === "Escape" && !eliminando) onCancelar();
    };

    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [eliminando, onCancelar]);

  return (
    <div
      className="rv-modal-fondo"
      onClick={() => !eliminando && onCancelar()} //Cierra la ventana al hacer click fuera de ella
    >
      <div
        className="rv-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="rv-modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rv-modal-icono">
          <i className="bi bi-trash3"></i>
        </div>

        <h2 id="rv-modal-titulo" className="rv-modal-titulo">{titulo}</h2>
        <p className="rv-modal-texto">{texto}</p>

        <div className="rv-modal-detalle">{children}</div>

        {error && (
          <p className="rv-modal-error" role="alert">
            <i className="bi bi-exclamation-triangle"></i> {error}
          </p>
        )}

        <div className="rv-modal-acciones">
          <button
            type="button"
            ref={botonCancelar}
            className="rv-btn"
            onClick={onCancelar}
            disabled={eliminando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rv-btn rv-btn--peligro-solido"
            onClick={onConfirmar}
            disabled={eliminando}
          >
            {eliminando ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalEliminar;
