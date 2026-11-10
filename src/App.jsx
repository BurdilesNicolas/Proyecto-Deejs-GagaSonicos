import { lazy, Suspense, useLayoutEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Navbar from "./componentes/Navbar";
import Footer from "./componentes/Footer";
import AdminRoute from "./componentes/AdminRoute";
import Cargando from "./componentes/Cargando";
import { DURACION_MINIMA_CARGA_MS } from "./utils/tiempoCarga";
import audioGato from "./assets/audio/Gatomeme.mp3";

// Recorrido principal de compra: se descarga junto con la app.
import Inicio from "./paginas/Inicio";
import Productos from "./paginas/Productos";
import ProductoDetalle from "./paginas/ProductoDetalle";
import MerchDetalle from "./paginas/MerchDetalle";
import Carrito from "./paginas/Carrito";
import Wishlist from "./paginas/Wishlist";

// Páginas secundarias y de administración se descargan recién al entrar en ellas.
const Perfil = lazy(() => import("./paginas/Perfil"));
const Locales = lazy(() => import("./paginas/Locales"));
const Comunidad = lazy(() => import("./paginas/Comunidad"));
const Nosotros = lazy(() => import("./paginas/Nosotros"));
const Politicas = lazy(() => import("./paginas/Politicas"));
const ProductoSpotifyDetalle = lazy(() => import("./paginas/ProductoSpotifyDetalle"));
const Admin = lazy(() => import("./paginas/Admin"));
const AdminUsuarios = lazy(() => import("./paginas/admin/AdminUsuarios"));
const AdminReview = lazy(() => import("./paginas/admin/AdminReview"));
const AdminRecomendacion = lazy(() => import("./paginas/admin/AdminRecomendacion"));
const AdminProductos = lazy(() => import("./paginas/admin/AdminProductos"));
const AdminMerch = lazy(() => import("./paginas/admin/AdminMerch"));


function ContenidoApp() {
  const { pathname } = useLocation();
  const rutaAnterior = useRef(pathname);
  const temporizador = useRef(null);
  const [cargandoRuta, setCargandoRuta] = useState(false);
  const esRutaAdmin = /^\/admin(?:\/|$)/i.test(pathname);

  useLayoutEffect(() => {
    if (rutaAnterior.current === pathname) {
      return;
    }

    rutaAnterior.current = pathname;
    window.clearTimeout(temporizador.current);
    if (!/^\/admin(?:\/|$)/i.test(pathname)) {
      setCargandoRuta(false);
      temporizador.current = null;
      return;
    }

    setCargandoRuta(true);
    temporizador.current = window.setTimeout(() => {
      setCargandoRuta(false);
      temporizador.current = null;
    }, DURACION_MINIMA_CARGA_MS);
  }, [pathname]);

  useLayoutEffect(() => () => window.clearTimeout(temporizador.current), []);

  return (
    <>
      <Navbar />

      <Suspense fallback={esRutaAdmin ? <Cargando modo="pagina" retraso={0} /> : null}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/Inicio" element={<Inicio />} />
          <Route path="/Productos" element={<Productos />} />
          <Route path="/Perfil" element={<Perfil />} />
          <Route path="/Login" element={<Perfil />} />
          <Route path="/Locales" element={<Locales />} />
          <Route path="/Comunidad" element={<Comunidad />} />
          <Route path="/Nosotros" element={<Nosotros />} />
          <Route path="Carrito" element={<Carrito />} />
          <Route path="Wishlist" element={<Wishlist />} />
          <Route path="/Politicas" element={<Politicas />} />

          {/*Spotify*/}
          <Route path="/Productos/spotify/:spotifyAlbumId" element={<ProductoSpotifyDetalle />} />
          <Route path="/Productos/:id" element={<ProductoDetalle />} />
          <Route path="/Merch/:id" element={<MerchDetalle />} />

          {/* Administración */}
          <Route path="/Admin" element={<AdminRoute> <Admin /> </AdminRoute>} />
          <Route path="/Admin/Usuarios" element={<AdminRoute> <AdminUsuarios /> </AdminRoute>} />
          <Route path="/Admin/Review" element={<AdminRoute> <AdminReview /> </AdminRoute>} />
          <Route path="/Admin/Recomendacion" element={<AdminRoute> <AdminRecomendacion /> </AdminRoute>} />
          <Route path="/Admin/Productos" element={<AdminRoute> <AdminProductos /> </AdminRoute>} />
          <Route path="/Admin/Merch" element={<AdminRoute> <AdminMerch /> </AdminRoute>} />
          <Route path="*" element={<RutaInexistente pathname={pathname} />} />
        </Routes>
      </Suspense>

      <Footer />
      {esRutaAdmin && cargandoRuta && (
        <Cargando modo="pagina" texto="Cargando página..." retraso={0} />
      )}
    </>
  );
}

function RutaInexistente({ pathname }) {
  return (
    <main className="cargando cargando--pagina error-ruta">
      <span className="error-ruta-codigo">Error 404</span>
      <h1 className="error-ruta-titulo">Crack, rompiste la página</h1>
      <img
        className="error-ruta-gato"
        src="https://media1.tenor.com/m/0Kr4YkG5ZdgAAAAC/shake-my-hand-shake-hand.gif"
        alt="GIF de un gato aplaudiendo"
      />
      <p className="error-ruta-mensaje">
        No pudimos encontrar la página <span className="error-ruta-path">{pathname}</span>.
      </p>
      <audio className="error-ruta-audio" src={audioGato} autoPlay loop controls>
        Tu navegador no puede reproducir el audio.
      </audio>
      <nav className="error-ruta-enlaces" aria-label="Enlaces del meme">
        <a
          className="error-ruta-enlace"
          href="https://tenor.com/es/view/shake-my-hand-shake-hand-shake-hands-ai-cat-clapping-hands-gif-15036103406822974936"
          target="_blank"
          rel="noreferrer"
        >
          Ver GIF del gato
        </a>
      </nav>
      <Link className="error-ruta-enlace" to="/">
        Volver al inicio
      </Link>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ContenidoApp />
    </BrowserRouter>
  );
}
export default App;