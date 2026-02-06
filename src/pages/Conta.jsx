import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Save, Edit2, LogOut, Shield } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

// Seus componentes visuais
import FloatingLines from '/src/components/FloatingLines';
import ClickSpark from '/src/components/ClickSpark';
import CardNav from '/src/components/CardNav';
import logo from '/src/assets/senai.png'; // Verifique o caminho

// O COMPONENTE NOVO (Certifique-se que o caminho está certo)
import Lanyard from '../components/Lanyard.jsx'; // Ajuste o caminho se necessário

const Conta = () => {
  const navigate = useNavigate();

  // --- MOCK DATA ---
  const [usuario, setUsuario] = useState({
    nome: 'Aluno SENAI',
    email: 'aluno@estudante.senai.br',
    cargo: 'Desenvolvedor Front-end',
  });

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ ...usuario, novaSenha: '', confirmarSenha: '' });
  const [mensagem, setMensagem] = useState('');

  const items = [
    {
      label: "Ações",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Dashboard", ariaLabel: "Voltar", href: "/dashboard" },
        { label: "Registrar Consumo", ariaLabel: "Novo", href: "/cadastrar_consumo" }
      ]
    },
    {
      label: "Conta",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Meu Perfil", ariaLabel: "Perfil", href:"/perfil" },
        { label: "Sair (Logout)", ariaLabel: "Sair", href: "/" }
      ]
    },
    {
      label: "Suporte",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Ajuda", ariaLabel: "Ajuda", href:"/ajuda"},
      ]
    }
  ];

  const handleSalvar = (e) => {
    e.preventDefault();
    if (form.novaSenha && form.novaSenha !== form.confirmarSenha) {
      setMensagem('As senhas não coincidem!');
      return;
    }
    setUsuario({ ...usuario, nome: form.nome, email: form.email });
    setEditando(false);
    setMensagem('Dados atualizados com sucesso!');
    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden relative font-sans selection:bg-purple-500/30">

      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <FloatingLines
            enabledWaves={["top", "middle", "bottom"]}
            lineCount={5}
            lineDistance={5}
            bendRadius={5}
            bendStrength={-0.5}
            interactive={true}
            parallax={true}
            enableTilt={true}
          />
        </div>
      </div>

      <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
        <div className="relative z-10 min-h-screen flex flex-col items-center p-4 pb-20 gap-6">

          {/* 1. MENU DE NAVEGAÇÃO */}
          <div className='w-full max-w-5xl flex justify-center mt-4 mb-2'>
            <CardNav
              logo={logo}
              logoAlt="Logo"
              items={items}
              baseColor="#18181b"
              menuColor="#000"
              buttonBgColor="#27272a"
              buttonTextColor="#fff"
              ease="elastic.out(1, 0.8)"
              theme="dark"
            />
          </div>
          <br/><br/><br/><br/><br/><br/><br/>

          {/* 2. CONTEÚDO PRINCIPAL */}
          <div className="w-full max-w-5xl h-[400px] grid grid-cols-1 md:grid-cols-3 gap-9">
            
            {/* COLUNA ESQUERDA - ÁREA DO CRACHÁ INTERATIVO (LANYARD) */}
            <div className="col-span-1 bg-zinc-900/80 border border-zinc-800 rounded-3xl backdrop-blur-xl flex flex-col items-center relative overflow-hidden h-[600px] md:h-auto">
              
              {/* Título do Card */}
              <div className="absolute top-6 left-0 w-full text-center z-20 pointer-events-none">
                 <h2 className="text-xl font-bold">{usuario.nome}</h2>
                 <p className="text-zinc-400 text-sm">{usuario.cargo}</p>
              </div>

              {/* CANVAS 3D DO CRACHÁ */}
              <div className="w-full h-full absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
                <Canvas 
                    camera={{ position: [-1, 0, 15], fov: 25 }} 
                    gl={{ alpha: true }}
                    onCreated={(state) => state.gl.setClearColor(0x000000, 0)}
                >
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.5} />
                        <Environment preset="city" />
                        
                        {/* AQUI: Mudei o position Y de 0 para 1.5 */}
                        <Lanyard position={[0, 2.5, 0]} gravity={[0, -40, 0]} />
                        
                    </Suspense>
                </Canvas>
              </div>

              {/* Status Footer (Fica embaixo do Canvas) */}
              <div className="absolute bottom-6 w-full px-8 z-20 pointer-events-none">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 backdrop-blur-md">
                   <Shield size={18} className="text-green-400"/>
                   <div className="text-left">
                     <p className="text-xs text-zinc-500">Credencial</p>
                     <p className="text-sm font-medium text-green-400">Ativa • Acesso Total</p>
                   </div>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA - FORMULÁRIO */}
            <div className="col-span-1 md:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl z-20">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                 <h1 className="text-2xl font-bold flex items-center gap-2">
                   <User size={24} className="text-purple-400"/> Meus Dados
                 </h1>
                 {!editando ? (
                   <button 
                     onClick={() => setEditando(true)}
                     className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-full transition flex items-center gap-2 border border-zinc-700"
                   >
                     <Edit2 size={14}/> Editar
                   </button>
                 ) : (
                   <button 
                     onClick={() => setEditando(false)}
                     className="px-4 py-2 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full transition border border-red-500/20"
                   >
                     Cancelar
                   </button>
                 )}
              </div>

              {mensagem && (
                <div className={`p-4 mb-6 rounded-lg text-center text-sm ${mensagem.includes('sucesso') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                  {mensagem}
                </div>
              )}

              <form onSubmit={handleSalvar} className="space-y-6">
                
                {/* DADOS PESSOAIS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <User size={14}/> Nome Completo
                      </label>
                      <input 
                        type="text" 
                        disabled={!editando}
                        value={editando ? form.nome : usuario.nome}
                        onChange={(e) => setForm({...form, nome: e.target.value})}
                        className={`w-full p-3 rounded-xl bg-black/40 border ${editando ? 'border-purple-500/50 focus:border-purple-500' : 'border-zinc-800 text-zinc-500'} outline-none transition`}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm text-zinc-400 flex items-center gap-2">
                        <Mail size={14}/> E-mail
                      </label>
                      <input 
                        type="email" 
                        disabled={!editando}
                        value={editando ? form.email : usuario.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                        className={`w-full p-3 rounded-xl bg-black/40 border ${editando ? 'border-purple-500/50 focus:border-purple-500' : 'border-zinc-800 text-zinc-500'} outline-none transition`}
                      />
                   </div>
                </div>

                {/* SEGURANÇA */}
                {editando && (
                  <div className="pt-6 border-t border-white/10 animate-pulse-once">
                    <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                      <Lock size={18} className="text-yellow-400"/> Alterar Senha
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Nova Senha</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={form.novaSenha}
                          onChange={(e) => setForm({...form, novaSenha: e.target.value})}
                          className="w-full p-3 rounded-xl bg-black/40 border border-zinc-700 focus:border-white outline-none transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Confirmar Senha</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={form.confirmarSenha}
                          onChange={(e) => setForm({...form, confirmarSenha: e.target.value})}
                          className="w-full p-3 rounded-xl bg-black/40 border border-zinc-700 focus:border-white outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* AÇÕES */}
                <div className="pt-4 flex gap-4">
                  {editando && (
                    <button 
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-white text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                      <Save size={18}/> Salvar Alterações
                    </button>
                  )}
                  
                  {!editando && (
                    <button 
                      type="button"
                      onClick={() => navigate('/')}
                      className="w-full py-3 rounded-xl bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition flex items-center justify-center gap-2"
                    >
                      <LogOut size={18}/> Sair da Conta
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </ClickSpark>
    </div>
  );
};

export default Conta;