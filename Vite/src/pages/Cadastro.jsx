import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Seus imports de estilo
import FloatingLines from '/src/components/FloatingLines';
import ClickSpark from '/src/components/ClickSpark';

const Cadastro = () => {
  // 1. Estados para guardar o que o usuário digita
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // 2. Estados para controlar mensagens e carregamento
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault(); // Não deixa a tela recarregar
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      // 3. Montando o JSON para enviar
      // IMPORTANTE: Confira no Swagger se os nomes são "nome", "email", "senha" mesmo.
      const dadosUsuario = {
        nome: nome,
        email: email,
        senha: senha
      };

      // 4. Enviando para o Back-end (JSON é o padrão do axios)
      // Ajuste a URL '/public/Criar_Conta' conforme o seu Swagger
      const response = await axios.post('http://127.0.0.1:8000/public/Criar_Conta', dadosUsuario);

      console.log('Cadastro feito:', response.data);
      setSucesso('Conta criada com sucesso! Redirecionando...');

      // Espera 2 segundos e manda pro login
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Erro:', error);
      if (error.response) {
        // Erros vindos do Python
        if (error.response.status === 400) {
           setErro('Dados inválidos ou e-mail já existe.');
        } else if (error.response.status === 422) {
           setErro('Preencha os campos corretamente (verifique o formato).');
        } else {
           setErro('Erro no servidor: ' + error.response.status);
        }
      } else {
        setErro('Erro de conexão. O servidor está ligado?');
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
              <h2 className="text-3xl font-mono font-bold mb-2">Criar Conta</h2>
              <p className="text-gray-400 text-sm">Comece sua jornada sustentável hoje.</p>
            </div>
            
            <form className="space-y-4" onSubmit={handleCadastro}>
              
              {/* Campo Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-zinc-700 focus:border-white focus:ring-1 focus:ring-white focus:outline-none transition text-white placeholder-gray-600"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-zinc-700 focus:border-white focus:ring-1 focus:ring-white focus:outline-none transition text-white placeholder-gray-600"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Campo Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Senha</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-zinc-700 focus:border-white focus:ring-1 focus:ring-white focus:outline-none transition text-white placeholder-gray-600"
                  placeholder="Crie uma senha forte"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              {/* MENSAGENS DE ERRO OU SUCESSO */}
              {erro && (
                <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm text-center">
                  {erro}
                </div>
              )}
              
              {sucesso && (
                <div className="p-3 bg-green-900/30 border border-green-800 rounded text-green-200 text-sm text-center">
                  {sucesso}
                </div>
              )}

              <button 
                type="submit"
                disabled={carregando}
                className="w-full py-3.5 mt-2 rounded-full bg-white text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-white/10 disabled:opacity-50"
              >
                {carregando ? 'Cadastrando...' : 'Cadastrar-se'}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-500 text-sm">
              Já tem uma conta?{' '}
              <Link to="/" className="text-white font-medium hover:underline">
                Fazer Login
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

export default Cadastro;