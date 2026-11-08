import { useEffect, useState } from "react";
import { searchSpotify } from "../../services/spotify";

const FORMATOS = ["Vinilo", "CD", "Cassette"];
const CATEGORIAS = ["Rock", "Indie", "Jazz / Blues", "Internacional", "Under", "Pop", "Soundtrack", "Otro"];

function crearFormatoInicial(producto, nombre) {
  const existente = producto?.formatos?.find((formato) => formato.nombre === nombre);
  return {
    activo: Boolean(existente),
    precio: existente?.precio ?? "",
    stock: existente?.stock ?? 0,
  };
}

function FormularioProducto({ producto, onGuardar, onCancelar, guardando }) {
  const [formulario, setFormulario] = useState({
    nombre: producto?.nombre ?? "",
    artista: producto?.artista ?? "",
    precio: producto?.precio ?? "",
    categoria: producto?.categoria ?? "Rock",
    imagen: producto?.imagen ?? "",
    descripcion: producto?.descripcion ?? "",
    anio: producto?.anio ?? "",
    sello: producto?.sello ?? "",
    spotify: producto?.spotify ?? "",
    spotifyUrl: producto?.spotifyUrl ?? "",
    formatos: Object.fromEntries(FORMATOS.map((nombre) => [nombre, crearFormatoInicial(producto, nombre)])),
  });

  const [busquedaSpotify, setBusquedaSpotify] = useState("");
  const [resultadosSpotify, setResultadosSpotify] = useState([]);
  const [buscandoSpotify, setBuscandoSpotify] = useState(false);
  const [errorSpotify, setErrorSpotify] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");

  useEffect(() => {
    if (!producto) return;
    setFormulario({
      nombre: producto.nombre ?? "",
      artista: producto.artista ?? "",
      precio: producto.precio ?? "",
      categoria: producto.categoria ?? "Rock",
      imagen: producto.imagen ?? "",
      descripcion: producto.descripcion ?? "",
      anio: producto.anio ?? "",
      sello: producto.sello ?? "",
      spotify: producto.spotify ?? "",
      spotifyUrl: producto.spotifyUrl ?? "",
      formatos: Object.fromEntries(FORMATOS.map((nombre) => [nombre, crearFormatoInicial(producto, nombre)])),
    });
  }, [producto]);

  function cambiarCampo(e) {
    const { name, value } = e.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  }

  function cambiarFormato(nombre, campo, valor) {
    setFormulario((actual) => ({
      ...actual,
      formatos: {
        ...actual.formatos,
        [nombre]: { ...actual.formatos[nombre], [campo]: valor },
      },
    }));
  }

  async function buscarAlbum(e) {
    e.preventDefault();
    if (!busquedaSpotify.trim()) return;

    setBuscandoSpotify(true);
    setErrorSpotify("");
    setResultadosSpotify([]);

    try {
      const respuesta = await searchSpotify(busquedaSpotify, ["album"], 8);
      setResultadosSpotify(respuesta.albums ?? []);
      if (!respuesta.albums?.length) setErrorSpotify("No se encontraron álbumes.");
    } catch (error) {
      setErrorSpotify(error.message || "No se pudo buscar en Spotify.");
    } finally {
      setBuscandoSpotify(false);
    }
  }

  function seleccionarAlbum(album) {
    setFormulario((actual) => ({
      ...actual,
      nombre: album.name ?? actual.nombre,
      artista: album.artists?.map((artista) => artista.name).join(", ") ?? actual.artista,
      imagen: album.images?.[0]?.url ?? actual.imagen,
      spotify: album.id ?? "",
      spotifyUrl: album.external_urls?.spotify ?? "",
      anio: album.release_date?.slice(0, 4) ?? actual.anio,
      sello: album.label ?? actual.sello,
    }));
    setResultadosSpotify([]);
    setBusquedaSpotify("");
  }

  function enviar(e) {
    e.preventDefault();
    setErrorFormulario("");

    const precio = Number(formulario.precio);
    if (!formulario.nombre.trim() || !formulario.artista.trim()) {
      setErrorFormulario("Completá el nombre del álbum y el artista.");
      return;
    }
    if (!Number.isFinite(precio) || precio < 0) {
      setErrorFormulario("Ingresá un precio base válido.");
      return;
    }
    if (!formulario.imagen.trim()) {
      setErrorFormulario("Ingresá una URL de portada o elegí un álbum de Spotify.");
      return;
    }

    const formatos = FORMATOS
      .filter((nombre) => formulario.formatos[nombre].activo)
      .map((nombre) => ({
        nombre,
        precio: Number(formulario.formatos[nombre].precio || 0),
        stock: Math.max(0, Number(formulario.formatos[nombre].stock || 0)),
      }));

    if (formatos.length === 0) {
      setErrorFormulario("Seleccioná al menos un formato físico.");
      return;
    }
    if (formatos.some((formato) => !Number.isFinite(formato.precio) || formato.precio < 0)) {
      setErrorFormulario("Revisá los precios de los formatos.");
      return;
    }

    onGuardar({
      nombre: formulario.nombre.trim(),
      artista: formulario.artista.trim(),
      precio,
      categoria: formulario.categoria,
      imagen: formulario.imagen.trim(),
      descripcion: formulario.descripcion.trim(),
      anio: formulario.anio ? Number(formulario.anio) : "",
      sello: formulario.sello.trim(),
      spotify: formulario.spotify.trim(),
      spotifyUrl: formulario.spotifyUrl.trim(),
      formatos,
    });
  }

  return (
    <form className="ap-formulario" onSubmit={enviar}>
      <div className="ap-spotify">
        <div className="ap-spotify-titulo"><i className="bi bi-spotify"></i> Buscar álbum en Spotify</div>
        <div className="ap-spotify-busqueda">
          <input
            className="ap-input"
            value={busquedaSpotify}
            onChange={(e) => setBusquedaSpotify(e.target.value)}
            placeholder="Nombre del álbum o artista"
            aria-label="Buscar álbum en Spotify"
          />
          <button className="ap-boton ap-boton-secundario" type="button" onClick={buscarAlbum} disabled={buscandoSpotify}>
            {buscandoSpotify ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {errorSpotify && <p className="ap-error-texto">{errorSpotify}</p>}
        {resultadosSpotify.length > 0 && (
          <div className="ap-resultados-spotify">
            {resultadosSpotify.map((album) => (
              <button type="button" className="ap-resultado-spotify" key={album.id} onClick={() => seleccionarAlbum(album)}>
                <img src={album.images?.[2]?.url || album.images?.[0]?.url} alt="" />
                <span><strong>{album.name}</strong><small>{album.artists?.map((a) => a.name).join(", ")}</small></span>
                <i className="bi bi-plus-circle"></i>
              </button>
            ))}
          </div>
        )}
        <p className="ap-ayuda">Spotify completa los datos musicales. Los precios y el stock los definís vos.</p>
      </div>

      <div className="ap-campos-grid">
        <label className="ap-campo">
          <span>Nombre del álbum *</span>
          <input className="ap-input" name="nombre" value={formulario.nombre} onChange={cambiarCampo} required />
        </label>
        <label className="ap-campo">
          <span>Artista *</span>
          <input className="ap-input" name="artista" value={formulario.artista} onChange={cambiarCampo} required />
        </label>
        <label className="ap-campo">
          <span>Precio base *</span>
          <input className="ap-input" type="number" name="precio" min="0" step="1" value={formulario.precio} onChange={cambiarCampo} required />
        </label>
        <label className="ap-campo">
          <span>Categoría</span>
          <select className="ap-input" name="categoria" value={formulario.categoria} onChange={cambiarCampo}>
            {CATEGORIAS.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
          </select>
        </label>
        <label className="ap-campo">
          <span>Año de lanzamiento</span>
          <input className="ap-input" type="number" name="anio" min="1900" max="2100" value={formulario.anio} onChange={cambiarCampo} />
        </label>
        <label className="ap-campo">
          <span>Sello discográfico</span>
          <input className="ap-input" name="sello" value={formulario.sello} onChange={cambiarCampo} />
        </label>
        <label className="ap-campo ap-campo-completo">
          <span>URL de portada *</span>
          <input className="ap-input" type="url" name="imagen" value={formulario.imagen} onChange={cambiarCampo} placeholder="https://..." required />
        </label>
        {formulario.imagen && (
          <div className="ap-portada-preview ap-campo-completo">
            <img src={formulario.imagen} alt="Vista previa de portada" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <span>Vista previa de portada</span>
          </div>
        )}
        <label className="ap-campo ap-campo-completo">
          <span>Descripción</span>
          <textarea className="ap-input ap-textarea" name="descripcion" value={formulario.descripcion} onChange={cambiarCampo} rows="3" />
        </label>
      </div>

      <div className="ap-formatos">
        <h3>Formatos físicos y stock</h3>
        {FORMATOS.map((nombre) => {
          const formato = formulario.formatos[nombre];
          return (
            <div className={`ap-formato ${formato.activo ? "ap-formato-activo" : ""}`} key={nombre}>
              <label className="ap-formato-check">
                <input type="checkbox" checked={formato.activo} onChange={(e) => cambiarFormato(nombre, "activo", e.target.checked)} />
                <strong>{nombre}</strong>
              </label>
              <label><span>Precio</span><input className="ap-input" type="number" min="0" step="1" disabled={!formato.activo} value={formato.precio} onChange={(e) => cambiarFormato(nombre, "precio", e.target.value)} /></label>
              <label><span>Stock</span><input className="ap-input" type="number" min="0" step="1" disabled={!formato.activo} value={formato.stock} onChange={(e) => cambiarFormato(nombre, "stock", e.target.value)} /></label>
            </div>
          );
        })}
      </div>

      {errorFormulario && <p className="ap-error-texto" role="alert">{errorFormulario}</p>}
      <div className="ap-formulario-acciones">
        <button type="button" className="ap-boton ap-boton-secundario" onClick={onCancelar} disabled={guardando}>Cancelar</button>
        <button type="submit" className="ap-boton ap-boton-principal" disabled={guardando}>{guardando ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}</button>
      </div>
    </form>
  );
}

export default FormularioProducto;
