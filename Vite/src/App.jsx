// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importe suas páginas
import QuemSomos from './pages/QuemSomos'; // Importe o arquivo
import Home from './pages/Home';      // O arquivo grande que você mandou
import Login from './pages/Login';    // A tela de login que criamos antes
import Cadastro from './pages/Cadastro'; // Se tiver a tela de cadastro
import Dashboard from './pages/Dashboard'; // A página que criamos acima
import Conta from './pages/Conta';
import CadastrarConsumo from './pages/CadastrarConsumo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quemsomos" element={<QuemSomos />} />
        <Route path="/perfil" element={<Conta />} />
        <Route path="/cadastrar_consumo" element={<CadastrarConsumo />} />
        <Route path="*" element={<h1 style={{color:'black'}}>Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;