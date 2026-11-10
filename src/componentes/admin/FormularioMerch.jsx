import { useState } from "react";

const CATEGORIAS = ["Indumentaria", "Accesorios", "Hogar"];

// Al editar, convierte las variantes existentes a texto para los inputs.
// En un artículo nuevo propone "Único", opción habitual para accesorios sin talle.
function variantesIniciales(merch) {
  return merch?.variantes?.length
    ? merch.variantes.map((variante) => ({
      talle: variante.talle ?? "",
      color: variante.color ?? "",
      stock: String(variante.stock ?? 0),
    }))
    : [{ talle: "Único", color: "", stock: "0" }];
}

function datosIniciales(merch) {
  // El formulario reutiliza los datos guardados o establece valores iniciales para el alta.
  return {
    nombre: merch?.nombre ?? "",
    categoria: merch?.categoria ?? CATEGORIAS[0],
    precio: merch?.precio ?? "",
    imagen: merch?.imagen ?? "",
    descripcion: merch?.descripcion ?? "",
    variantes: variantesIniciales(merch),
  };
}

function FormularioMerch({ merch, onGuardar, onCancelar, guardando }) {
  // formulario guarda todos los campos editables; errorFormulario contiene
  // validaciones que deben resolverse antes de enviar al administrador.
  const [formulario, setFormulario] = useState(() => datosIniciales(merch));
  const [errorFormulario, setErrorFormulario] = useState("");

  function cambiarCampo(e) {
    const { name, value } = e.target;
    // El atributo name permite actualizar cualquier campo simple con un solo manejador.
    setFormulario((actual) => ({ ...actual, [name]: value }));
  }

  function cambiarVariante(indice, campo, valor) {
    // Actualiza solo la variante y propiedad editada, conservando el resto del formulario.
    setFormulario((actual) => ({
      ...actual,
      variantes: actual.variantes.map((variante, i) =>
        i === indice ? { ...variante, [campo]: valor } : variante
      ),
    }));
  }

  // Valida los datos comerciales y que no se repita ninguna combinación de talle/color.
  // Luego convierte precio y stock a números antes de entregar el objeto al CRUD.
  function enviar(e) {
    e.preventDefault();
    setErrorFormulario("");

    const precio = Number(formulario.precio);
    if (!formulario.nombre.trim()) {
      setErrorFormulario("Ingresá el nombre del artículo.");
      return;
    }
    if (!Number.isFinite(precio) || precio < 0) {
      setErrorFormulario("Ingresá un precio válido.");
      return;
    }
    if (!formulario.imagen.trim()) {
      setErrorFormulario("Ingresá la URL de una imagen.");
      return;
    }

    const variantes = formulario.variantes.map((variante) => ({
      talle: variante.talle.trim(),
      color: variante.color.trim(),
      stock: Number(variante.stock),
    }));
    if (variantes.some((variante) =>
      !variante.talle ||
      !Number.isInteger(variante.stock) ||
      variante.stock < 0
    )) {
      setErrorFormulario("Cada variante debe tener talle (o «Único») y stock válido.");
      return;
    }
    const combinaciones = variantes.map((variante) =>
      `${variante.talle.toLocaleLowerCase()}|${variante.color.toLocaleLowerCase()}`
    );
    if (new Set(combinaciones).size !== combinaciones.length) {
      setErrorFormulario("No repitas la misma combinación de talle y color.");
      return;
    }

    onGuardar({
      nombre: formulario.nombre.trim(),
      categoria: formulario.categoria,
      precio,
      imagen: formulario.imagen.trim(),
      descripcion: formulario.descripcion.trim(),
      variantes,
    });
  }

  // El formulario agrupa información general del artículo y filas de variantes.
  // Cada variante se vende de forma independiente y lleva su propio stock.
  return (
    <form className="ap-formulario" onSubmit={enviar}>
      <div className="ap-campos-grid">
        <label className="ap-campo">
          <span>Nombre del artículo *</span>
          <input className="ap-input" name="nombre" value={formulario.nombre} onChange={cambiarCampo} required />
        </label>
        <label className="ap-campo">
          <span>Categoría *</span>
          <select className="ap-input" name="categoria" value={formulario.categoria} onChange={cambiarCampo}>
            {CATEGORIAS.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
          </select>
        </label>
        <label className="ap-campo">
          <span>Precio *</span>
          <input className="ap-input" type="number" name="precio" min="0" step="1" value={formulario.precio} onChange={cambiarCampo} required />
        </label>
        <label className="ap-campo ap-campo-completo">
          <span>URL de imagen *</span>
          <input className="ap-input" type="url" name="imagen" value={formulario.imagen} onChange={cambiarCampo} placeholder="https://..." required />
        </label>
        {/* La vista previa ayuda a comprobar que la URL ingresada apunta a la imagen correcta. */}
        {formulario.imagen && (
          <div className="ap-portada-preview ap-campo-completo">
            <img src={formulario.imagen} alt="Vista previa del artículo" />
            <span>Vista previa del artículo</span>
          </div>
        )}
        <label className="ap-campo ap-campo-completo">
          <span>Descripción</span>
          <textarea className="ap-input ap-textarea" name="descripcion" value={formulario.descripcion} onChange={cambiarCampo} rows="3" />
        </label>
      </div>

      {/* El administrador puede agregar y quitar combinaciones de talle, color y stock. */}
      <div className="ap-formatos">
        <h3>Talles, colores y stock</h3>
        {formulario.variantes.map((variante, indice) => (
          <div className="ap-formato ap-merch-variante" key={indice}>
            <label>
              <span>Talle *</span>
              <input className="ap-input" value={variante.talle} onChange={(e) => cambiarVariante(indice, "talle", e.target.value)} placeholder="Único, S, M, L..." required />
            </label>
            <label>
              <span>Color</span>
              <input className="ap-input" value={variante.color} onChange={(e) => cambiarVariante(indice, "color", e.target.value)} placeholder="Negro" />
            </label>
            <label>
              <span>Stock *</span>
              <input className="ap-input" type="number" min="0" step="1" value={variante.stock} onChange={(e) => cambiarVariante(indice, "stock", e.target.value)} required />
            </label>
            <button
              className="ap-icono-boton ap-icono-peligro"
              type="button"
              aria-label={`Quitar variante ${indice + 1}`}
              title="Quitar variante"
              onClick={() => setFormulario((actual) => ({
                ...actual,
                variantes: actual.variantes.filter((_, i) => i !== indice),
              }))}
              disabled={formulario.variantes.length === 1}
            >
              <i className="bi bi-trash3"></i>
            </button>
          </div>
        ))}
        <button
          className="ap-boton ap-boton-secundario ap-merch-agregar-variante"
          type="button"
          onClick={() => setFormulario((actual) => ({
            ...actual,
            variantes: [...actual.variantes, { talle: "", color: "", stock: "0" }],
          }))}
        >
          <i className="bi bi-plus-lg"></i> Agregar talle o color
        </button>
      </div>

      {errorFormulario && <p className="ap-error-texto" role="alert">{errorFormulario}</p>}
      <div className="ap-formulario-acciones">
        <button type="button" className="ap-boton ap-boton-secundario" onClick={onCancelar} disabled={guardando}>Cancelar</button>
        <button type="submit" className="ap-boton ap-boton-principal" disabled={guardando}>{guardando ? "Guardando..." : merch ? "Guardar cambios" : "Crear artículo"}</button>
      </div>
    </form>
  );
}

export default FormularioMerch;
