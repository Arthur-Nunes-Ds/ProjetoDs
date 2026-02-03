// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importe suas páginas
import QuemSomos from './pages/QuemSomos'; // Importe o arquivo
import Home from './pages/Home';      // O arquivo grande que você mandou
import Login from './pages/Login';    // A tela de login que criamos antes
import Cadastro from './pages/Cadastro'; // Se tiver a tela de cadastro

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/quemsomos" element={<QuemSomos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;