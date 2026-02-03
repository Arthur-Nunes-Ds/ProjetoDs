import React from 'react';
import { Link } from 'react-router-dom';

// Seus imports de estilo (verifique se o caminho está correto na sua pasta)
import FloatingLines from '/src/components/FloatingLines';
import ClickSpark from '/src/components/ClickSpark';

const Cadastro = () => {
  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden relative">
      
      {/* --- BACKGROUND (IGUAL AO LOGIN) --- */}
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
        
        {/* 'relative z-10' garante que o formulário fique ACIMA das linhas */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          
          <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-mono font-bold mb-2">Criar Conta</h2>
              <p className="text-gray-400 text-sm">Comece sua jornada sustentável hoje.</p>
            </div>
            
            <form className="space-y-4">
              
              {/* Campo Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-zinc-700 focus:border-white focus:ring-1 focus:ring-white focus:outline-none transition text-white placeholder-gray-600"
                  placeholder="Seu nome"
                />
              </div>

              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-zinc-700 focus:border-white focus:ring-1 focus:ring-white focus:outline-none transition text-white placeholder-gray-600"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Campo Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Senha</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-zinc-700 focus:border-white focus:ring-1 focus:ring-white focus:outline-none transition text-white placeholder-gray-600"
                  placeholder="Crie uma senha forte"
                />
              </div>

              <button 
                type="button"
                className="w-full py-3.5 mt-2 rounded-full bg-white text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-white/10"
              >
                Cadastrar-se
              </button>
            </form>

            <p className="mt-8 text-center text-gray-500 text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-white font-medium hover:underline">
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