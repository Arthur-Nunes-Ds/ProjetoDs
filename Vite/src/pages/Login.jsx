import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 

// Importe seus componentes visuais
import FloatingLines from '/src/components/FloatingLines';
import ClickSpark from '/src/components/ClickSpark';

const Login = () => {
  // 1. Estados para capturar o input do usuário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const navigate = useNavigate();

  // 2. Função de Login conectada ao FastAPI
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    // --- PREPARAÇÃO DOS DADOS (Crucial para FastAPI) ---
    const formData = new URLSearchParams();
    
    // A sua API exige o campo 'username', mesmo que o usuário digite um email.
    // A sua API exige o campo 'password'.
    formData.append('username', email); 
    formData.append('password', senha);

    try {
      // 3. Envio para a rota específica mostrada no seu Swagger
      const response = await axios.post('http://localhost:8080/public/Logar_Conta', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('Login realizado com sucesso:', response.data);
      
      // 4. Salvar Token e Redirecionar
      // Verifica se o token veio (pode vir como access_token ou token, garantimos os dois)
      const token = response.data.access_token || response.data.token;

      if (token) {
        localStorage.setItem('token', token);
        navigate('/dashboard'); // Manda para a tela interna
      } else {
        setErro('Login autorizado, mas nenhum token foi recebido.');
      }

    } catch (error) {
      console.error('Erro detalhado:', error);
      
      if (error.response) {
        // Tratamento de erros específicos baseados no status HTTP
        if (error.response.status === 401) {
           setErro('Senha incorreta.');
        } else if (error.response.status === 404) {
           setErro('Este e-mail não está cadastrado.');
        } else if (error.response.status === 422) {
           setErro('Erro de formato. O sistema espera "username" e "password".');
        } else {
           setErro(`Erro no servidor: ${error.response.status}`);
        }
      } else {
        setErro('Não foi possível conectar ao servidor. Verifique se o Python está rodando.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden relative">
      
      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <FloatingLines 
            enabledWaves={["top","middle","bottom"]}
            lineCount={5}
            lineDistance={5}
            bendRadius={5}
            bendStrength={-0.5}
            interactive={true}
            parallax={true}
          />
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-mono font-bold mb-2">Bem-vindo</h2>
              <p className="text-gray-400 text-sm">Acesse seus dados de consumo</p>
            </div>
            
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-zinc-700 focus:border-white focus:ring-1 focus:ring-white focus:outline-none transition text-white placeholder-gray-600"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-400">Senha</label>
                  <a href="#" className="text-xs text-gray-400 hover:text-white transition">Esqueceu?</a>
                </div>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-zinc-700 focus:border-white focus:ring-1 focus:ring-white focus:outline-none transition text-white placeholder-gray-600"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              {/* Mensagem de Erro Visual */}
              {erro && (
                <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm text-center animate-pulse">
                  {erro}
                </div>
              )}

              <button 
                type="submit"
                disabled={carregando}
                className="w-full py-3.5 mt-2 rounded-full bg-white text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carregando ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-500 text-sm">
              Não tem conta?{' '}
              <Link to="/cadastro" className="text-white font-medium hover:underline">
                Cadastrar
              </Link>
            </p>

            <div className="mt-6 text-center">
                <Link to="/" className="text-xs text-zinc-600 hover:text-zinc-400">← Voltar para o site</Link>
            </div>
          </div>
        </div>
      </ClickSpark>
    </div>
  );
};

export default Login;