import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./paginas/Inicio";
import Login from "./paginas/Login";
import Navbar from "./componentes/Navbar";
import Productos from "./paginas/productos";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/paginas/Inicio" element={<Inicio />} />
        <Route path="/paginas/Login" element={<Login />} />
        <Route path="/paginas/Productos" element={<Productos />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;