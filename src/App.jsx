import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./paginas/Inicio";
import Navbar from "./componentes/Navbar";
import Footer from "./componentes/Footer";
import Productos from "./paginas/Productos";
import Perfil from "./paginas/Perfil";
import Locales from "./paginas/Locales";
import Comunidad from "./paginas/Comunidad";
import ProductoDetalle from "./paginas/ProductoDetalle";
import ProductoSpotifyDetalle from "./paginas/ProductoSpotifyDetalle";
import Nosotros from "./paginas/Nosotros";
import Admin from "./paginas/Admin";
import AdminRoute from "./componentes/AdminRoute";
import AdminUsuarios from "./paginas/admin/AdminUsuarios";
import Politicas from "./paginas/Politicas";


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Inicio" element={<Inicio />} />
        <Route path="/Productos" element={<Productos />} />
        <Route path="/Perfil" element={<Perfil />} />
        <Route path="/Locales" element={<Locales />} />
        <Route path="/Comunidad" element={<Comunidad />} />
        <Route path="/Nosotros" element={<Nosotros />} />

        {/*Spotify*/}
        <Route path="/Productos/spotify/:spotifyAlbumId" element={<ProductoSpotifyDetalle />} />
        <Route path="/Productos/:id" element={<ProductoDetalle />} />

        {/* Administración */}
        <Route path="/Admin" element={<AdminRoute> <Admin /> </AdminRoute>} />
        <Route path="/Admin/Usuarios" element={<AdminRoute> <AdminUsuarios /> </AdminRoute>} />

        <Route path="/Politicas" element={<Politicas />} />
        { /* =======Rutas futuras de administración=========
        <Route path="/Admin/Review" element={<AdminRoute> <AdminReview /> </AdminRoute>} />
        <Route path="/Admin/Productos" element={<AdminRoute> <AdminProductos /> </AdminRoute>} />
        */}

      </Routes>

      <Footer />
    </BrowserRouter>
  );
}
export default App;