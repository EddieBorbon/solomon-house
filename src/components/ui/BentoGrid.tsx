import { ReactNode } from 'react';
import ProjectCard from './ProjectCard';

// Definimos los tipos para las tarjetas del Bento Grid
type BentoCard = {
  id: string;
  title: string;
  lastUpdated: string;
  members: string[];
  icon: ReactNode;
  glowColor: string;
  size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
  className?: string;
};

// Configuración de tamaños para el Bento Grid
const sizeClasses = {
  small: 'h-32',
  medium: 'h-40',
  large: 'h-48',
  wide: 'h-40 lg:col-span-2',
  tall: 'h-48 lg:row-span-2',
};

export default function BentoGrid() {
  // Datos de las tarjetas del dashboard
  const cards: BentoCard[] = [
    {
      id: 'control-panel',
      title: 'Control Panel',
      lastUpdated: 'Activo',
      members: ['🎛️'],
      icon: <span className="text-lg">🎛️</span>,
      glowColor: 'from-cyan-500',
      size: 'wide',
    },
    {
      id: 'audio-effects',
      title: 'Efectos de Audio',
      lastUpdated: '15 efectos',
      members: ['🎵', '🔊'],
      icon: <span className="text-lg">🎵</span>,
      glowColor: 'from-purple-500',
      size: 'medium',
    },
    {
      id: 'world-3d',
      title: 'Mundo 3D',
      lastUpdated: '12 objetos',
      members: ['🌍', '🎯'],
      icon: <span className="text-lg">🌍</span>,
      glowColor: 'from-green-500',
      size: 'medium',
    },
    {
      id: 'parameter-editor',
      title: 'Editor de Parámetros',
      lastUpdated: 'En tiempo real',
      members: ['⚙️'],
      icon: <span className="text-lg">⚙️</span>,
      glowColor: 'from-orange-500',
      size: 'medium',
    },
    {
      id: 'stereo-widener',
      title: 'StereoWidener',
      lastUpdated: 'Nuevo efecto',
      members: ['🎧'],
      icon: <span className="text-lg">🎧</span>,
      glowColor: 'from-blue-500',
      size: 'medium',
    },
    {
      id: 'phaser',
      title: 'Phaser',
      lastUpdated: 'Efecto activo',
      members: ['🌀'],
      icon: <span className="text-lg">🌀</span>,
      glowColor: 'from-pink-500',
      size: 'medium',
    },
    {
      id: 'auto-filter',
      title: 'AutoFilter',
      lastUpdated: 'Filtro dinámico',
      members: ['🔍'],
      icon: <span className="text-lg">🔍</span>,
      glowColor: 'from-teal-500',
      size: 'medium',
    },
    {
      id: 'reverb',
      title: 'Reverb',
      lastUpdated: 'Espacialización',
      members: ['🏛️'],
      icon: <span className="text-lg">🏛️</span>,
      glowColor: 'from-indigo-500',
      size: 'medium',
    },
    {
      id: 'statistics',
      title: 'Estadísticas del Sistema',
      lastUpdated: 'Tiempo real',
      members: ['📊', '📈', '📉'],
      icon: <span className="text-lg">📊</span>,
      glowColor: 'from-yellow-500',
      size: 'wide',
    },
    {
      id: 'configuration',
      title: 'Configuración',
      lastUpdated: 'Personalizable',
      members: ['⚙️', '🎛️'],
      icon: <span className="text-lg">⚙️</span>,
      glowColor: 'from-red-500',
      size: 'medium',
    },
    {
      id: 'help',
      title: 'Ayuda y Documentación',
      lastUpdated: 'Actualizada',
      members: ['❓', '📚'],
      icon: <span className="text-lg">❓</span>,
      glowColor: 'from-gray-500',
      size: 'medium',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 relative overflow-hidden">
      {/* Efecto de fondo glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
      
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header con efecto glass */}
      <div className="mb-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-white/20">
              <span className="text-3xl">🎵</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                Solomon House Dashboard
              </h1>
              <p className="text-gray-300 text-lg">Sistema de audio espacial 3D con efectos avanzados</p>
            </div>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-cyan-400">15</div>
              <div className="text-sm text-gray-400">Efectos Disponibles</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-purple-400">12</div>
              <div className="text-sm text-gray-400">Objetos 3D</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-pink-400">100%</div>
              <div className="text-sm text-gray-400">Tiempo Real</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout con efectos glass mejorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        {cards.map((card) => (
          <div key={card.id} className={sizeClasses[card.size]} 
               style={{
                 filter: 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.3))',
               }}>
            <ProjectCard
              title={card.title}
              lastUpdated={card.lastUpdated}
              members={card.members}
              icon={card.icon}
              glowColor={card.glowColor}
              className="h-full"
            />
          </div>
        ))}
      </div>

      {/* Efectos de partículas flotantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
