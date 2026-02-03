import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from 'react-icons/fa'; 

// Verifique se os caminhos batem com a sua estrutura de pastas atual
import FloatingLines from '/src/components/FloatingLines';
import ClickSpark from '/src/components/ClickSpark';

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Nunes Dev',
    role: 'Desenvolvedor Back-End',
    image: 'https://avatars.githubusercontent.com/u/151405360?v=4', 
    bio: 'Especialista em API em python e apaixonado dificultar o trabalho.',
    // ADICIONEI OS LINKS AQUI:
    githubUrl: 'https://github.com/NunesDevelloper', 
    linkedinUrl: 'www.linkedin.com/in/arthur-nunes-de-carvalho-9ba20328a' 
  },
  {
    id: 2,
    name: 'Guimcv1',
    role: 'UI/UX Designer',
    image: 'https://avatars.githubusercontent.com/u/209834548?v=4',
    bio: 'Focado na experiência do usuário e design futurista.',
    // LINKS INDIVIDUAIS:
    githubUrl: 'https://github.com/Guimcv1',
    linkedinUrl: 'https://www.linkedin.com/in/guilherme-martins-75542928a/'
  },
  {
    id: 3,
    name: 'Joaovitor-afk',
    role: 'Gerente de Dados/DBA',
    image: 'https://avatars.githubusercontent.com/u/223855002?v=4',
    bio: 'Gerenciador de banco de dados com as boas praticas de Segurança.',
    // LINKS INDIVIDUAIS:
    githubUrl: 'https://github.com/Joaovitor-afk',
    linkedinUrl: 'https://www.linkedin.com/in/seu-usuario-joao'
  },
  {
    id: 4,
    name: '1Bertoo0',
    role: 'Gerente de Projeto',
    image: 'https://avatars.githubusercontent.com/u/219711146?v=4',
    bio: 'Garante que o projeto siga o cronograma e a visão sustentável.',
    // LINKS INDIVIDUAIS:
    githubUrl: 'https://github.com/1Bertoo0',
    linkedinUrl: 'https://www.linkedin.com/in/seu-usuario-berto'
  }
];

const QuemSomos = () => {
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
          <div className="text-center max-w-2xl mb-16">
            <h1 className="text-4xl md:text-5xl font-mono font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              Quem Somos
            </h1>
            <p className="text-gray-400 text-lg">
              Conheça as mentes por trás da plataforma que está transformando o consumo sustentável.
            </p>
          </div>

          {/* Grid de Membros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
            {TEAM_MEMBERS.map((member) => (
              <div 
                key={member.id} 
                className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm hover:bg-zinc-800/80 hover:border-zinc-600 transition duration-300 flex flex-col items-center text-center transform hover:-translate-y-2"
              >
                {/* Foto */}
                <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-2 border-zinc-700 group-hover:border-white transition-colors duration-300 shadow-xl">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Informações */}
                <h3 className="text-xl font-bold font-mono mb-1 text-white">{member.name}</h3>
                <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-3">
                  {member.role}
                </span>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  {member.bio}
                </p>

                {/* --- BOTÕES SOCIAIS ATUALIZADOS --- */}
                <div className="mt-auto flex gap-4">
                  {/* Botão Github Dinâmico */}
                  <a 
                    href={member.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-zinc-500 hover:text-white transition hover:scale-110"
                    title={`GitHub de ${member.name}`}
                  >
                    <FaGithub size={24} />
                  </a>

                  {/* Botão LinkedIn Dinâmico */}
                  <a 
                    href={member.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-zinc-500 hover:text-blue-500 transition hover:scale-110"
                    title={`LinkedIn de ${member.name}`}
                  >
                    <FaLinkedin size={24} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Voltar */}
          <div className="mt-20">
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