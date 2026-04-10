import React from 'react';
// Importações de bibliotecas externas
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';

// Importações dos componentes
import FloatingLines from '/src/components/FloatingLines';
import ClickSpark from '/src/components/ClickSpark';
import MagicBento from '/src/components/MagicBento';
import CardNav from '/src/components/CardNav';
import logo from '/public/senai.png'; // Verifique se o caminho está correto

const Dashboard = () => {

  const items = [
    {
      label: "Cadastra Consumo",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Cadastrar", ariaLabel: "About Company", href: "/cadastrar_consumo" }
      ]
    },
    {
      label: "Perfil",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Configurações", ariaLabel: "Featured Projects", href:"/conta" },
        { label: "Inicio", ariaLabel: "Inicio", href: "/" }
      ]
    },
    {
      label: "Suporte",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Github", ariaLabel: "Github", href:"/quemsomos"},

      ]
    }
  ];

  // Configuração para deixar a grade e textos do gráfico brancos
  const chartSetting = {
    grid: { horizontal: true },
    sx: {
      '.MuiChartsGrid-line': { stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 },
      '.MuiChartsAxis-tickLabel': { fill: '#ffffff !important' },
      '.MuiChartsAxis-line': { stroke: '#ffffff !important' },
      '.MuiChartsAxis-tick': { stroke: '#ffffff !important' }
    }
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden relative selection:bg-purple-500/30">

      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
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
        
        {/* Container Flex Centralizado */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 gap-8">
          
          {/* --- MENU (RESTAURADO PARA O FLUXO NORMAL) --- */}
          {/* Adicionei z-50 para garantir que o menu fique sobre o Bento se necessário */}
          <div className='p-30'>
            <CardNav
              logo={logo}
              logoAlt="Company Logo"
              items={items}
              baseColor="#333"
              menuColor="#000"
              buttonBgColor="#111"
              buttonTextColor="#fff"
              ease="elastic.out(1, 0.8)"
              theme="dark"
            />
          </div>

          {/* Magic Bento e Conteúdo */}
          <MagicBento 
            textAutoHide={true} 
            enableStars 
            enableSpotlight 
            enableBorderGlow={true} 
            glowColor="132, 0, 255" 
          />

          {/* CARD DE GRÁFICOS */}
          <div className="w-full max-w-5xl bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
            
            <h1 className="text-2xl font-bold mb-8 text-center">Dashboard SENAI - Produção</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center">
                
                {/* GRÁFICO 1 */}
                <div className="flex flex-col items-center w-full">
                    <h2 className="text-zinc-400 mb-2 font-semibold">Volume por Setor</h2>
                    <BarChart
                      xAxis={[{ id: 'barCategories', data: ['Setor A', 'Setor B', 'Setor C'], scaleType: 'band' }]}
                      series={[{ data: [25, 50, 30], color: '#9333ea', label: 'Unidades' }]}
                      width={350} 
                      height={300}
                      slotProps={{ legend: { hidden: true } }}
                      {...chartSetting} 
                    />
                </div>

                {/* GRÁFICO 2 */}
                <div className="flex flex-col items-center w-full">
                    <h2 className="text-zinc-400 mb-2 font-semibold">Eficiência Mensal</h2>
                    <LineChart
                      xAxis={[{ data: [0, 4, 8, 12, 16, 20], label: 'Meses' }]}
                      series={[{ data: [5, 5.5, 3, 8.5, 6, 9], color: '#22d3ee', area: true }]}
                      width={350}
                      height={300}
                      {...chartSetting}
                    />
                </div>
            </div>
             
             <div className="mt-8 pt-4 border-t border-white/10 text-center">
                 <p className="text-zinc-400 text-sm">Atualização em tempo real via CLP/Supervisório.</p>
             </div>
          </div>

        </div>
      </ClickSpark>
    </div>
  );
};

export default Dashboard;