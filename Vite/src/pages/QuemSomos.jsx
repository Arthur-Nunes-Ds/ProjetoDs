import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from 'react-icons/fa'; 

// Verifique seus caminhos
import FloatingLines from '/src/components/FloatingLines';
import ClickSpark from '/src/components/ClickSpark';
import ProfileCard from '/src/components/ProfileCard';

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Nunes Dev',
    role: 'Desenvolvedor Back-End',
    image: 'https://avatars.githubusercontent.com/u/151405360?v=4', 
    bio: 'Especialista em API em python e apaixonado dificultar o trabalho.',
    githubUrl: 'https://github.com/NunesDevelloper', 
    linkedinUrl: 'www.linkedin.com/in/arthur-nunes-de-carvalho-9ba20328a' 
  },
  {
    id: 2,
    name: 'Guimcv1',
    role: 'UI/UX Designer',
    image: 'https://avatars.githubusercontent.com/u/209834548?v=4',
    bio: 'Focado na experiência do usuário e design futurista.',
    githubUrl: 'https://github.com/Guimcv1',
    linkedinUrl: 'https://www.linkedin.com/in/guilherme-martins-75542928a/'
  },
  {
    id: 3,
    name: 'Joaovitor-afk',
    role: 'Gerente de Dados/DBA',
    image: 'https://avatars.githubusercontent.com/u/223855002?v=4',
    bio: 'Gerenciador de banco de dados com as boas praticas de Segurança.',
    githubUrl: 'https://github.com/Joaovitor-afk',
    linkedinUrl: 'https://www.linkedin.com/in/seu-usuario-joao'
  },
  {
    id: 4,
    name: '1Bertoo0',
    role: 'Gerente de Projeto',
    image: 'https://avatars.githubusercontent.com/u/219711146?v=4',
    bio: 'Garante que o projeto siga o cronograma e a visão sustentável.',
    githubUrl: 'https://github.com/1Bertoo0',
    linkedinUrl: 'https://www.linkedin.com/in/seu-usuario-berto'
  }
];

const QuemSomos = () => {
  
  const handleOpenGithub = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden relative">
      
      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <FloatingLines 
            enabledWaves={["top","middle","bottom"]}
            lineCount={6}
            lineDistance={4}
            bendRadius={4}
            bendStrength={-0.3}
            interactive={true}
            parallax={true}
          />
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
        
        <div className="relative z-10 container mx-auto px-6 py-20 min-h-screen flex flex-col items-center">
          
          {/* Cabeçalho */}
          <div className="text-center max-w-2xl mb-20">
            <h1 className="text-4xl md:text-5xl font-mono font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              Quem Somos
            </h1>
            <p className="text-gray-400 text-lg">
              Conheça as mentes por trás da plataforma que está transformando o consumo sustentável.
            </p>
          </div>

          {/* MUDANÇA NO GRID:
             - Usei 'md:grid-cols-2' para garantir 2 colunas (2x2) em telas maiores.
             - Removi configurações de 4 colunas.
             - Limitei a largura com 'max-w-5xl' para ficarem mais agrupados.
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 w-full max-w-5xl">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.id} className="flex justify-center">
                <ProfileCard
                  name={member.name}
                  title={member.role}
                  handle={`@${member.name.replace(/\s+/g, '')}`} 
                  status="Dev Team"
                  contactText="GitHub"
                  avatarUrl={member.image}
                  showUserInfo
                  enableTilt={true}
                  enableMobileTilt={false}
                  onContactClick={() => handleOpenGithub(member.githubUrl)}
                  showIcon
                  showBehindGlow
                  
                  // --- MUDANÇA: Glow neutro (branco transparente) para não tintar de azul ---
                  behindGlowColor="rgba(255, 255, 255, 0.1)" 
                  
                  // --- MUDANÇA: Gradiente puramente cinza/preto para manter a foto original ---
                  customInnerGradient="linear-gradient(145deg, #27272a 0%, #09090b 100%)"
                />
              </div>
            ))}
          </div>

          {/* Botão de Voltar */}
          <div className="mt-24">
             <Link 
                to="/" 
                className="px-8 py-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition duration-300 font-medium"
             >
                Voltar para Home
             </Link>
          </div>

        </div>
      </ClickSpark>
    </div>
  );
};

export default QuemSomos;