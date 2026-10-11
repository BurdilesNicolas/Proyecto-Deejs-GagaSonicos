import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./paginas/Inicio";
import Navbar from "./componentes/Navbar";
import Footer from "./componentes/Footer";
import Productos from "./paginas/productos";
import Perfil from "./paginas/Perfil";
import Locales from "./paginas/Locales";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Inicio" element={<Inicio />} />
        <Route path="/Productos" element={<Productos />} />
        <Route path="/Perfil" element={<Perfil />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
export default App;