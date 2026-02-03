// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importe suas páginas
import Home from './components/Home';      // O arquivo grande que você mandou
import Login from './components/login';    // A tela de login que criamos antes
import Cadastro from './components/Cadastro'; // Se tiver a tela de cadastro

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;