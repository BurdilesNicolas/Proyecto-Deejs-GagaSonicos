import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Inicio from './paginas/inicio.jsx'
import Login from './paginas/login.jsx'
import {BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
return (
  <>
    <BrowserRouter>
      <Routes>
        <Route path='/inicio' element={<Inicio />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  </>
)
}
export default App;