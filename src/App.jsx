import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./paginas/Inicio";
import Login from "./paginas/Login";
import Navbar from "./componentes/Navbar";
import Productos from "./paginas/productos";
import Registro from "./paginas/Registro";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Inicio" element={<Inicio />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Productos" element={<Productos />} />
        <Route path="/Registro" element={<Registro/>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;