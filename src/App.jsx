import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./componentes/Navbar";
import Footer from "./componentes/Footer";
import AdminRoute from "./componentes/AdminRoute";
import Cargando from "./componentes/Cargando";

// Recorrido principal de compra: se descarga junto con la app.
import Inicio from "./paginas/Inicio";
import Productos from "./paginas/Productos";
import ProductoDetalle from "./paginas/ProductoDetalle";
import Carrito from "./paginas/Carrito";
import Wishlist from "./paginas/Wishlist";

// Páginas secundarias y de administración: el navegador las descarga recién cuando alguien entra,
// así el primer arranque es más liviano. Cada una tiene que seguir teniendo "export default".
const Perfil = lazy(() => import("./paginas/Perfil"));
const Locales = lazy(() => import("./paginas/Locales"));
const Comunidad = lazy(() => import("./paginas/Comunidad"));
const Nosotros = lazy(() => import("./paginas/Nosotros"));
const Politicas = lazy(() => import("./paginas/Politicas"));
const ProductoSpotifyDetalle = lazy(() => import("./paginas/ProductoSpotifyDetalle"));
const Admin = lazy(() => import("./paginas/Admin"));
const AdminUsuarios = lazy(() => import("./paginas/admin/AdminUsuarios"));
const AdminReview = lazy(() => import("./paginas/admin/AdminReview"));
const AdminProductos = lazy(() => import("./paginas/admin/AdminProductos"));


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      {/* Mientras se descarga una página, la pantalla de carga ocupa solo el área de contenido:
          el navbar y el footer siguen visibles. */}
      <Suspense fallback={<Cargando modo="pagina" />}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/Inicio" element={<Inicio />} />
          <Route path="/Productos" element={<Productos />} />
          <Route path="/Perfil" element={<Perfil />} />
          <Route path="/Locales" element={<Locales />} />
          <Route path="/Comunidad" element={<Comunidad />} />
          <Route path="/Nosotros" element={<Nosotros />} />
          <Route path="Carrito" element={<Carrito />} />
          <Route path="Wishlist" element={<Wishlist />} />
          <Route path="/Politicas" element={<Politicas />} />

          {/*Spotify*/}
          <Route path="/Productos/spotify/:spotifyAlbumId" element={<ProductoSpotifyDetalle />} />
          <Route path="/Productos/:id" element={<ProductoDetalle />} />

          {/* Administración */}
          <Route path="/Admin" element={<AdminRoute> <Admin /> </AdminRoute>} />
          <Route path="/Admin/Usuarios" element={<AdminRoute> <AdminUsuarios /> </AdminRoute>} />
          <Route path="/Admin/Review" element={<AdminRoute> <AdminReview /> </AdminRoute>} />
          <Route path="/Admin/Productos" element={<AdminRoute> <AdminProductos /> </AdminRoute>} />
        </Routes>
      </Suspense>

      <Footer />
    </BrowserRouter>
  );
}
export default App;