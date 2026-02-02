import React from 'react';
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc';

import FadeContent from '/src/styles/FadeContent'
import DarkVeil from '/src/styles/DarkVeil';
import Dock from '/src/styles/Dock'; 
import ClickSpark from '/src/styles/ClickSpark';

const App = () => {
  const items = [
    { icon: <VscHome size={18} color="white"/>, label: 'Home', onClick: () => alert('Home!') },
    { icon: <VscArchive size={18} color="white"/>, label: 'Archive', onClick: () => alert('Archive!') },
    { icon: <VscAccount size={18} color="white"/>, label: 'Profile', onClick: () => alert('Profile!') },
    { icon: <VscSettingsGear size={18} color="white"/>, label: 'Settings', onClick: () => alert('Settings!') },
  ];

  return (
    <div>
      <div style={{ width: '100%', height: '1000px', position: 'relative', background: '#000' }}>
        <ClickSpark
          sparkColor='#fff'
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >  
          {/* Fundo Animado */}
          <DarkVeil
            hueShift={0}
            noiseIntensity={0}
            scanlineIntensity={0}
            speed={1.8}
            scanlineFrequency={0}
            warpAmount={0}
          />
          
          {/* --- CORREÇÃO AQUI --- */}
          <div style={{
            position: 'absolute',          // Tira do fluxo e permite sobrepor
            top: '10%',                    // Posiciona no meio vertical
            left: '35%',                   // Posiciona no meio horizontal
            transform: 'translate(-50%, -50%)', // Centraliza exato
            zIndex: 10,                    // Garante que fique acima do DarkVeil
            color: 'white',                // Garante que o texto seja visível
            textAlign: 'left'            // Centraliza o texto se tiver mais linhas
          }}>
            <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0}>
              <h1 className='font-mono p-10 w-50%'>O Aplicativo de Monitoramento de Consumo Sustentável foi criado para ajudar o usuário a acompanhar, de forma simples e visual, o uso de recursos como água, energia e materiais no dia a dia. Por meio do registro de consumo, metas e gráficos, o aplicativo permite que o consumidor entenda seus hábitos e identifique oportunidades para reduzir desperdícios.</h1>
            </FadeContent>
          </div>

          {/* Wrapper do Dock */}
          <div style={{
            position: 'fixed', 
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            width: 'max-content'
          }}>
            <Dock 
              items={items}
              panelHeight={68}
              baseItemSize={50}
              magnification={70}
            />
          </div>
        </ClickSpark>
      </div>
    </div>
  );
};

export default App;