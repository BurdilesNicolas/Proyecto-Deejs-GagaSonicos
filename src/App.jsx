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
        <Route path="/Productos/spotify/:spotifyAlbumId" element={<ProductoSpotifyDetalle />} />
        <Route path="/Productos/:id" element={<ProductoDetalle />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
export default App;