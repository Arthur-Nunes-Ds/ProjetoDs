import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userToken, setUserToken] = useState('');

  useEffect(() => {
    // 1. Verifica se tem token salvo
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Se não tiver token, chuta o usuário de volta pro login
      alert("Você não está logado!");
      navigate('/');
    } else {
      setUserToken(token);
    }
  }, [navigate]);

  const handleLogout = () => {
    // Limpa o token e volta pro login
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div style={{ padding: '50px', backgroundColor: '#111', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#0f0' }}>✅ LOGIN DEU CERTO!</h1>
      <p>Bem-vindo ao sistema.</p>
      
      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #333', borderRadius: '8px' }}>
        <strong>Seu Token de acesso (prova que veio da API):</strong>
        <p style={{ wordBreak: 'break-all', color: '#aaa', fontSize: '12px' }}>
          {userToken}
        </p>
      </div>

      <button 
        onClick={handleLogout}
        style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Sair / Logout
      </button>
    </div>
  );
};

export default Dashboard;