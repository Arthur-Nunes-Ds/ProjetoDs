import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Droplet, Box, CheckCircle, BarChart2, LogOut, Edit3, ArrowRight, ArrowLeft, Calendar, DollarSign } from 'lucide-react';

// Seus Componentes
import Particles from '../components/Particles';
import SpotlightCard from '../components/SpotlightCard';
import Stepper, { Step } from '../components/Stepper'; 
import CardNav from '../components/CardNav';
import logo from '../assets/senai.png'; 

const CadastrarConsumo = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    tipo: '',               
    nome_personalizado: '', 
    valor: '',              
    data: new Date().toISOString().split('T')[0]
  });

  const selecionarTipo = (tipo) => {
    setFormData(prev => ({ ...prev, tipo: tipo, nome_personalizado: '' }));
  };

  const handleFinalizar = async () => {
    // Simulação de envio
    await new Promise(resolve => setTimeout(resolve, 1500));
    navigate('/'); 
  };

  const items = [
    {
      label: "Navegação",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Dashboard", href: "/dashboard", icon: <BarChart2 size={18}/> },
        { label: "Registrar", href: "/cadastrar_consumo", icon: <Zap size={18}/> }
      ]
    },
    {
      label: "Sistema",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Sair", href: "/", icon: <LogOut size={18}/> }
      ]
    }
  ];

  return (
    <div className="bg-[#050505] text-white min-h-screen overflow-x-hidden relative font-sans selection:bg-purple-500/30">
      
      {/* --- CSS ESTILIZADO (A MÁGICA VISUAL) --- */}
      <style>{`
        /* Container dos botões do Stepper */
        #stepper-container nav {
            display: flex;
            justify-content: space-between;
            margin-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 1.5rem;
        }

        /* Botões Gerais */
        #stepper-container button {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            font-weight: 600 !important;
            letter-spacing: 0.5px !important;
            border-radius: 9999px !important; /* Totalmente arredondado */
            padding: 12px 30px !important;
            font-size: 0.95rem !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            position: relative !important;
            z-index: 50 !important;
        }

        /* Botão "Próximo" (O segundo botão) */
        #stepper-container button:last-child {
            background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%) !important;
            color: white !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3) !important;
        }
        #stepper-container button:last-child:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(124, 58, 237, 0.5) !important;
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%) !important;
        }

        /* Botão "Voltar" (O primeiro botão, se houver dois) */
        #stepper-container button:first-child:not(:last-child) {
            background: transparent !important;
            color: #a1a1aa !important;
            border: 1px solid #3f3f46 !important;
        }
        #stepper-container button:first-child:not(:last-child):hover {
            background: rgba(255,255,255,0.05) !important;
            color: white !important;
            border-color: #71717a !important;
        }
      `}</style>

      {/* 1. BACKGROUND PARTICLES */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles
            particleColors={["#ffffff", "#a855f7"]} 
            particleCount={80}
            particleSpread={10}
            speed={0.2}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={true}
            disableRotation={false}
            pixelRatio={1}
        />
      </div>

      {/* 2. MENU */}
      <div className="relative z-50 w-full flex justify-center pt-8 pb-4">
        <CardNav
            logo={logo}
            logoAlt="Logo SENAI"
            items={items}
            baseColor="#18181b"
            menuColor="#000"
            buttonBgColor="#27272a"
            buttonTextColor="#fff"
            theme="dark"
        />
      </div><br/><br/><br/><br/><br/>

      {/* 3. ÁREA DO FORMULÁRIO */}
      <div className="relative z-60 flex flex-col items-center justify-center min-h-[75vh] px-4 pb-12">
        
        {/* Título com brilho */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-zinc-500 drop-shadow-sm">
                Novo Registro
            </h1>
            <p className="text-zinc-400 mt-3 text-sm font-medium tracking-wide">
                GERENCIAMENTO DE RECURSOS
            </p>
        </div>

        <SpotlightCard 
            className="w-full max-w-5xl bg-[#0f0f11]/80 border border-white/10 rounded-[2rem] backdrop-blur-2xl shadow-2xl relative overflow-hidden" 
            spotlightColor="rgba(168, 85, 247, 0.15)"
        >
            {/* Decoração de fundo do card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div id="stepper-container" className="p-8 md:p-12 w-full">
                <Stepper
                    initialStep={1}
                    onStepChange={(step) => console.log("Passo:", step)}
                    onFinalStepCompleted={handleFinalizar}
                    backButtonText="Voltar"
                    nextButtonText="Continuar"
                >
                    
                    {/* --- PASSO 1: TIPO --- */}
                    <Step>
                        <div className="space-y-8 py-4">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-white">O que você deseja registrar?</h2>
                                <p className="text-zinc-500 text-sm">Selecione uma categoria abaixo</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {[
                                    { id: 'energia', label: 'Energia', icon: Zap, color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10' },
                                    { id: 'agua', label: 'Água', icon: Droplet, color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10' },
                                    { id: 'personalizado', label: 'Outro', icon: Box, color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10' }
                                ].map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => selecionarTipo(item.id)}
                                        className={`
                                            group relative p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 cursor-pointer overflow-hidden
                                            ${formData.tipo === item.id 
                                                ? `${item.bg} ${item.border} shadow-[0_0_30px_rgba(0,0,0,0.3)] scale-[1.02]` 
                                                : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:bg-zinc-800/60'}
                                        `}
                                    >
                                        <div className={`p-4 rounded-full bg-black/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 ${formData.tipo === item.id ? item.color : 'text-zinc-600 group-hover:text-zinc-300'}`}>
                                            <item.icon size={32} strokeWidth={1.5} />
                                        </div>
                                        <span className={`font-bold tracking-wide ${formData.tipo === item.id ? 'text-white' : 'text-zinc-400'}`}>
                                            {item.label}
                                        </span>
                                        
                                        {/* Indicador de Seleção */}
                                        {formData.tipo === item.id && (
                                            <div className="absolute top-3 right-3 text-purple-500 animate-in zoom-in">
                                                <CheckCircle size={18} fill="currentColor" className="text-black" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Step>

                    {/* --- PASSO 2: DADOS --- */}
                    <Step>
                        <div className="space-y-6 max-w-md mx-auto py-4">
                            <div className="text-center space-y-2 mb-8">
                                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                    Detalhes do Consumo
                                </h2>
                            </div>

                            <div className="space-y-5">
                                {/* Input Nome Personalizado */}
                                {formData.tipo === 'personalizado' && (
                                    <div className="group animate-in slide-in-from-top-2">
                                        <label className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Nome do Recurso</label>
                                        <div className="relative">
                                            <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                            <input 
                                                type="text" 
                                                className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:border-purple-500 focus:bg-zinc-900 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                                placeholder="Ex: Internet..." 
                                                value={formData.nome_personalizado}
                                                onChange={(e) => setFormData({...formData, nome_personalizado: e.target.value})}
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Input Valor */}
                                <div className="group">
                                    <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Valor / Leitura</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
                                        <input 
                                            type="number" 
                                            className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white text-lg placeholder:text-zinc-600 focus:border-white focus:bg-zinc-900 outline-none transition-all"
                                            placeholder="0.00" 
                                            value={formData.valor}
                                            onChange={(e) => setFormData({...formData, valor: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* Input Data */}
                                <div className="group">
                                    <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Data do Registro</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
                                        <input 
                                            type="date" 
                                            className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white outline-none focus:border-white focus:bg-zinc-900 transition-all [color-scheme:dark]"
                                            value={formData.data}
                                            onChange={(e) => setFormData({...formData, data: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Step>

                    {/* --- PASSO 3: CONFIRMAÇÃO --- */}
                    <Step>
                         <div className="flex flex-col justify-center items-center py-6">
                            <h2 className="text-2xl font-bold mb-6">Revisão</h2>
                            
                            <div className="w-full max-w-sm bg-gradient-to-b from-zinc-800 to-zinc-900 p-1 rounded-2xl shadow-xl">
                                <div className="bg-[#0f0f11] rounded-xl p-6 space-y-6 relative overflow-hidden">
                                    {/* Linha decorativa no topo */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

                                    <div className="flex items-center justify-between border-b border-dashed border-zinc-800 pb-4">
                                        <span className="text-zinc-500 text-sm">Categoria</span>
                                        <div className="flex items-center gap-2 text-purple-400 font-bold capitalize">
                                            {formData.tipo === 'energia' && <Zap size={16} />}
                                            {formData.tipo === 'agua' && <Droplet size={16} />}
                                            {formData.tipo === 'personalizado' ? formData.nome_personalizado : formData.tipo}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-dashed border-zinc-800 pb-4">
                                        <span className="text-zinc-500 text-sm">Valor Registrado</span>
                                        <span className="text-white font-mono text-xl">{formData.valor}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500 text-sm">Data</span>
                                        <span className="text-zinc-300 text-sm">{formData.data}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Step>
                    
                    {/* --- PASSO 4: SUCESSO --- */}
                    <Step>
                        <div className="flex flex-col justify-center items-center text-center py-10 animate-in zoom-in duration-500">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full"></div>
                                <CheckCircle size={100} className="text-green-400 relative z-10" weight="fill" />
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-2">Registrado!</h2>
                            <p className="text-zinc-400">Os dados foram salvos com sucesso.</p>
                        </div>
                    </Step>

                </Stepper>
            </div>
        </SpotlightCard>
      </div>
    </div>
  );
};

export default CadastrarConsumo;