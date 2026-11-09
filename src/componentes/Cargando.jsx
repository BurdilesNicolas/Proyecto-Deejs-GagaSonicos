// Pantalla / indicador de carga reutilizable. Un disco de vinilo girando con un texto.
//
// modo:
//   'pagina' -> cubre toda la pantalla, incluidos el navbar y el footer
//   'bloque' -> dentro de un panel o sección
//   'inline' -> dentro de un botón o una línea de texto
// texto:   mensaje que se muestra junto al disco
// retraso: milisegundos antes de mostrarse. Evita el destello cuando la carga es muy rápida
//          (el espacio se reserva igual, así la página no salta).
// aviso:   milisegundos después de los cuales se agrega "está tardando más de lo normal".
//
// Se muestra mientras de verdad se está esperando algo: ponelo donde ya tenés un estado
// "cargando" y sacalo cuando ese estado pase a false.
import { useEffect, useState } from "react";
import "../estilos/Cargando.css";

function Cargando({ modo = "bloque", texto = "Cargando...", retraso = 200, aviso = 8000 }) {
  const [visible, setVisible] = useState(retraso === 0);
  const [lento, setLento] = useState(false);

  useEffect(() => {
    const mostrar = setTimeout(() => setVisible(true), retraso);
    const avisarDemora = setTimeout(() => setLento(true), aviso);

    return () => {
      clearTimeout(mostrar);
      clearTimeout(avisarDemora);
    };
  }, [retraso, aviso]);

  return (
    <div className={`cargando cargando--${modo}`} role="status" aria-live="polite">
      {visible && (
        <>
          <span className="cargando-disco" aria-hidden="true" />
          <span className="cargando-texto">{texto}</span>

          {lento && modo !== "inline" && (
            <span className="cargando-lento">Está tardando más de lo normal. Revisá tu conexión.</span>
          )}
        </>
      )}
    </div>
  );
}

export default Cargando;