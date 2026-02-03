// src/Home.jsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom'; // O Link funciona aqui pq o App.jsx envolveu a Home

import {
  VscHome,
  VscArchive,
  VscAccount,
  VscSettingsGear
} from 'react-icons/vsc';

// VERIFIQUE SE ESSES CAMINHOS ESTÃO CERTOS NO SEU PROJETO
// Se estiverem na pasta styles, mude de "components" para "styles"
import FadeContent from '/src/components/FadeContent';
import DarkVeil from '/src/components/DarkVeil';
import Dock from '/src/components/Dock';
import ClickSpark from '/src/components/ClickSpark';
import FlowingMenu from '/src/components/FlowingMenu';

/* ===================== DADOS ===================== */
// ... (Mantenha seus arrays CONST FLOW_MENU_ITEMS e CARD_ITEMS aqui)
const FLOW_MENU_ITEMS = [
  {
    link: '#agua',
    text: 'Água',
    image: 'https://acinam.com.br/wp-content/uploads/2019/03/acinam-diadaagua-blog-1030x538.png'
  },
  {
    link: '#energia',
    text: 'Energia',
    image: 'https://utilar.net.br/wp-content/uploads/2023/08/energia-renovavel-800x480-1.png'
  },
  {
    link: '#materiais',
    text: 'Materiais',
    image: 'https://folhago.com.br/blogs/horta-jardim-cia/wp-content/uploads/2022/05/Design-sem-nome-2022-05-25T153054.062.jpg'
  },
  {
    link: '#personalizados',
    text: 'Personalizados',
    image: 'https://conceito.de/wp-content/uploads/2024/05/personalizacao-2.jpg'
  }
];

const CARD_ITEMS = [
  {
    id: 'agua',
    title: 'Água',
    highlight: 'Reduza até 30%',
    description: 'Monitore o consumo diário de água.',
    details: ['Consumo diário e mensal', 'Alertas de desperdício', 'Histórico comparativo', 'Metas personalizadas']
  },
  {
    id: 'energia',
    title: 'Energia',
    highlight: 'Economia inteligente',
    description: 'Visualize picos de consumo elétrico.',
    details: ['Gráficos em tempo real', 'Horários de pico', 'Estimativa de custo', 'Sugestões automáticas']
  },
  {
    id: 'materiais',
    title: 'Materiais',
    highlight: 'Sustentabilidade',
    description: 'Controle o uso e descarte de materiais.',
    details: ['Registro de materiais', 'Indicadores de reciclagem', 'Impacto ambiental', 'Relatórios inteligentes']
  },
  {
    id: 'personalizados',
    title: 'Personalizados',
    highlight: 'Customização',
    description: 'Personalização de acordo com o usuario',
    details: ['Materiais personalizados', 'Alta customização', 'Adaptação ao Ambiente', 'Relatórios Personalizados']
  }
];

/* ===================== COMPONENTES ===================== */

const Hero = () => (
  <section className="relative min-h-[70vh] flex flex-col justify-center px-16 pt-24 gap-8">
    <FadeContent blur duration={1000} easing="ease-out" initialOpacity={0}>
      <div className="max-w-3xl space-y-6">
        <h1 className="font-mono text-4xl md:text-5xl leading-tight">
          Consumo inteligente.
          <br />
          <span className="text-white/60">
            Sustentabilidade no dia a dia.
          </span>
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
          Acompanhe e reduza o consumo de
          <strong className="text-white"> água</strong>,
          <strong className="text-white"> energia</strong> e
          <strong className="text-white"> materiais</strong><br />
          com dados claros e decisões conscientes.
        </p>

        <div className="flex gap-4 pt-2">
          <Link
            to="/login"
            className="px-6 py-3 rounded-full bg-white text-black font-medium hover:scale-105 transition"
          >
            Começar agora
          </Link>

          <a
            href="#energia"
            className="px-6 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition"
          >
            Ver recursos
          </a>
        </div>
      </div>
    </FadeContent>
  </section>
);

const Modal = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-black border border-white/20 rounded-2xl p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-mono text-2xl">{item.title}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <p className="text-gray-300 mb-4">{item.description}</p>
        <ul className="space-y-2">
          {item.details.map((detail, i) => (
            <li key={i} className="text-gray-400 flex gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full mt-2" />
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const CardGrid = () => {
  const [activeCard, setActiveCard] = useState(null);
  return (
    <>
      <section className="px-16 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CARD_ITEMS.map((item) => (
            <FadeContent key={item.id} blur duration={900} initialOpacity={0}>
              <button
                onClick={() => setActiveCard(item)}
                className="text-left border border-white/20 rounded-xl p-6 backdrop-blur-sm hover:-translate-y-2 hover:scale-[1.03] transition"
              >
                <span className="text-sm text-white/60 uppercase">{item.highlight}</span>
                <h3 className="font-mono text-2xl mt-2">{item.title}</h3>
                <p className="text-gray-400 mt-2">{item.description}</p>
              </button>
            </FadeContent>
          ))}
        </div>
      </section>
      <Modal item={activeCard} onClose={() => setActiveCard(null)} />
    </>
  );
};

const FloatingDock = () => {
  const dockItems = useMemo(() => [
    { icon: <VscHome size={18} />, label: 'Home' },
    { icon: <VscArchive size={18} />, label: 'Dados' },
    { icon: <VscAccount size={18} />, label: 'Perfil' },
    { icon: <VscSettingsGear size={18} />, label: 'Config' }
  ], []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Dock items={dockItems} panelHeight={64} baseItemSize={48} magnification={68} />
    </div>
  );
};

const FooterNav = () => {
  return (
    <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-10 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="space-y-4 max-w-sm">
            <h3 className="font-mono text-xl">Consumo Sustentável</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Plataforma inteligente para monitorar consumo.</p>
          </div>
          <nav className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div className="space-y-3">
               <h4 className="text-white/70 uppercase tracking-wider">Produto</h4>
               <ul className="space-y-2 text-gray-400">
                  <li><a href="#agua" className="hover:text-white">Água</a></li>
                  <li><a href="#energia" className="hover:text-white">Energia</a></li>
               </ul>
            </div>
            <div className="space-y-3">
               <h4 className="text-white/70 uppercase tracking-wider">Links</h4>
               <ul className="space-y-2 text-gray-400">
                  <li><Link to="/login" className="hover:text-white">Login</Link></li>
                  <li><a href="#contato" className="hover:text-white">Contato</a></li>
               </ul>
            </div>
          </nav>
        </div>
        <div className="border-t border-white/10 my-8" />
        <div className="text-xs text-gray-500">© 2024 Consumo Sustentável.</div>
      </div>
    </footer>
  );
};

/* ===================== COMPONENTE PRINCIPAL (HOME) ===================== */

const Home = () => {
  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DarkVeil speed={1.6} />
      </div>

      <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
        <div className="relative z-10">
          <Hero />
          
          <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />

          <div className="my-20 scale-150 flex justify-center">
            <FlowingMenu
              items={FLOW_MENU_ITEMS}
              speed={14}
              textColor="#ffffff"
              bgColor="#060010"
              marqueeBgColor="#ffffff"
              marqueeTextColor="#060010"
              borderColor="#ffffff"
            />
          </div>

          <CardGrid />

          <section className="py-60 text-center">
            <FadeContent blur duration={1200} initialOpacity={0}>
              <h2 className="font-mono text-3xl">
                Sustentabilidade começa com consciência.
              </h2>
            </FadeContent>
          </section>

          <FloatingDock />
          <FooterNav />
        </div>
      </ClickSpark>
    </div>
  );
};

export default Home;