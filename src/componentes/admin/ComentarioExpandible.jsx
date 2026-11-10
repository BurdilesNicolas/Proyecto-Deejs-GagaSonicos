// Comentario recortado a 3 líneas, con "Ver más / Ver menos" cuando es largo.
// Los estilos (rv-comentario, rv-ver-mas) están en AdminReview.css.
import { useState } from "react";

function ComentarioExpandible({ texto }) {
  const [abierto, setAbierto] = useState(false);
  const esLargo = texto.length > 140;

  return (
    <div>
      <p className={`rv-comentario ${esLargo && !abierto ? "rv-comentario--corto" : ""}`}>{texto}</p>
      {esLargo && (
        <button type="button" className="rv-ver-mas" onClick={() => setAbierto(!abierto)}>
          {abierto ? "Ver menos" : "Ver más"}
        </button>
      )}
    </div>
  );
}

export default ComentarioExpandible;
