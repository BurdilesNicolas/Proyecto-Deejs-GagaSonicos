import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./paginas/Inicio.jsx";
import Login from "./paginas/Login.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/paginas/inicio" element={<Inicio />} />
        <Route path="/paginas/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;