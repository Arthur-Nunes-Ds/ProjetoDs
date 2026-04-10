import React, { useState } from 'react';
// Importações de bibliotecas externas (MUI Charts)
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';

// Importações dos seus componentes
import FloatingLines from '/src/components/FloatingLines';
import ClickSpark from '/src/components/ClickSpark';
import MagicBento from '/src/components/MagicBento';
import CardNav from '/src/components/CardNav';
import logo from '/src/assets/senai.png'; // Verifique se o caminho está correto

const Dashboard = () => {

  // --- MOCK DATA (RF04 - Simulação para Desenvolvimento) ---
  // Isso permite que você desenvolva o front sem o python estar rodando
  const [dados] = useState({
    energia: 145, // kWh
    agua: 12,     // m³
    residuos: 5,  // kg
    metaEnergia: 80, // %
    dica: "Desligue o monitor quando não estiver usando. Isso economiza até 20% de energia."
  });

  // Configuração do Menu (Atualizado para o Contexto do Projeto)
  const items = [
    {
      label: "Ações",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Registrar Consumo", ariaLabel: "Novo Registro", href: "/cadastrar_consumo" },
        { label: "Definir Metas", ariaLabel: "Metas", href: "/metas" }
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
      label: "Ajuda",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Dicas de Economia", ariaLabel: "Dicas", href:"/dicas"},
      ]
    }
  ];

  // Configuração visual dos gráficos (Tema Escuro)
  const chartSetting = {
    grid: { horizontal: true },
    sx: {
      '.MuiChartsGrid-line': { stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 },
      '.MuiChartsAxis-tickLabel': { fill: '#ffffff !important' },
      '.MuiChartsAxis-line': { stroke: '#ffffff !important' },
      '.MuiChartsAxis-tick': { stroke: '#ffffff !important' },
      '.MuiChartsLegend-series text': { fill: '#ffffff !important' } // Legenda branca
    }
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden relative selection:bg-purple-500/30 font-sans">

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

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
        
        {/* Container Flex Vertical */}
        <div className="relative z-10 min-h-screen flex flex-col items-center p-4 pb-20 gap-6">
          
          {/* 1. MENU DE NAVEGAÇÃO */}
          <div className='w-full max-w-5xl flex justify-center mt-4 mb-2'>
            <CardNav
              logo={logo}
              logoAlt="Logo EcoMonitor"
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

          {/* 2. AREA DE INFO RÁPIDA (CARDS DE RESUMO) */}
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Card Energia */}
             <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center">
                <span className="text-zinc-400 text-sm">Energia (Mês)</span>
                <strong className="text-3xl text-yellow-400 font-bold mt-2">{dados.energia} kWh</strong>
                <span className="text-xs text-green-400 mt-1">▼ 5% vs mês passado</span>
             </div>
             {/* Card Água */}
             <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center">
                <span className="text-zinc-400 text-sm">Água (Mês)</span>
                <strong className="text-3xl text-blue-400 font-bold mt-2">{dados.agua} m³</strong>
                <span className="text-xs text-red-400 mt-1">▲ 2% vs mês passado</span>
             </div>
             {/* Card Resíduos */}
             <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center">
                <span className="text-zinc-400 text-sm">Resíduos</span>
                <strong className="text-3xl text-green-400 font-bold mt-2">{dados.residuos} kg</strong>
                <span className="text-xs text-zinc-500 mt-1">Coleta: Terça-feira</span>
             </div>
          </div>

          {/* 3. DASHBOARD GRÁFICO (CENTRAL) */}
          <div className="w-full max-w-5xl relative">
            {/* O MagicBento fica atrás como um 'Glow' decorativo */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <MagicBento 
                    textAutoHide={true} 
                    enableStars={false} 
                    enableSpotlight={true} 
                    enableBorderGlow={true} 
                    glowColor="132, 0, 255" 
                />
            </div>

            <div className="relative z-10 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
              
              <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Monitoramento de Consumo</h1>
                    <p className="text-zinc-400 text-sm mt-1">Visão geral dos recursos naturais (RF07)</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">
                      Tempo Real
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start justify-items-center">
                  
                  {/* GRÁFICO 1: Barras (Comparativo de Consumo) - RF06 */}
                  <div className="flex flex-col items-center w-full">
                      <h2 className="text-zinc-300 mb-4 font-semibold flex items-center gap-2">
                        📊 Consumo por Categoria
                      </h2>
                      <BarChart
                        xAxis={[{ 
                            id: 'barCategories', 
                            data: ['Energia (kWh)', 'Água (m³)', 'Mat. (kg)'], 
                            scaleType: 'band',
                            tickLabelStyle: { fill: 'white' }
                        }]}
                        series={[
                            { 
                                data: [dados.energia, dados.agua * 10, dados.residuos * 10], // Multiplicado para visualização
                                color: '#a855f7', 
                                label: 'Consumo Atual' 
                            }
                        ]}
                        width={350} 
                        height={300}
                        {...chartSetting} 
                      />
                  </div>

                  {/* GRÁFICO 2: Linha (Evolução Histórica) - RF06 */}
                  <div className="flex flex-col items-center w-full">
                      <h2 className="text-zinc-300 mb-4 font-semibold flex items-center gap-2">
                        📈 Histórico (Semestral)
                      </h2>
                      <LineChart
                        xAxis={[{ data: [1, 2, 3, 4, 5, 6], label: 'Meses' }]}
                        series={[
                            { 
                                data: [120, 132, 101, 134, 90, 230], 
                                color: '#22d3ee', 
                                area: true,
                                label: 'Evolução'
                            }
                        ]}
                        width={350}
                        height={300}
                        {...chartSetting}
                      />
                  </div>
              </div>
            </div>
          </div>

          {/* 4. RODAPÉ DE DICAS E METAS (RF05 e RF08) */}
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Card de Metas */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                  <h3 className="text-lg font-bold mb-2 text-white">🎯 Metas do Mês (RF05)</h3>
                  <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1 text-zinc-400">
                          <span>Economia de Energia</span>
                          <span>{dados.metaEnergia}% Atingido</span>
                      </div>
                      <div className="w-full bg-zinc-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full" style={{width: `${dados.metaEnergia}%`}}></div>
                      </div>
                  </div>
              </div>

              {/* Card de Dicas */}
              <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-2 text-indigo-300">💡 Dica Sustentável (RF08)</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                      "{dados.dica}"
                  </p>
              </div>

          </div>

        </div>
      </ClickSpark>
    </div>
  );
};

export default Dashboard;