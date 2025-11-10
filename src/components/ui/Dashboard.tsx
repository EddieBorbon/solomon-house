'use client';

import ProjectCard from './ProjectCard';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{t('dashboard.headerTitle')}</h1>
        <p className="text-gray-400">{t('dashboard.headerSubtitle')}</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Tarjeta principal - Ocupa 2 columnas */}
        <div className="lg:col-span-2">
          <ProjectCard
            title={t('dashboard.cards.controlPanel.title')}
            lastUpdated={t('dashboard.cards.controlPanel.lastUpdated')}
            members={["🎛️"]}
            icon={<span className="text-lg">🎛️</span>}
            glowColor="from-cyan-500"
            className="h-48"
          />
        </div>

        {/* Tarjeta de efectos de audio */}
        <ProjectCard
          title={t('dashboard.cards.audioEffects.title')}
          lastUpdated={t('dashboard.cards.audioEffects.lastUpdated')}
          members={["🎵", "🔊"]}
          icon={<span className="text-lg">🎵</span>}
          glowColor="from-purple-500"
          className="h-48"
        />

        {/* Tarjeta de información del mundo */}
        <ProjectCard
          title={t('dashboard.cards.world3D.title')}
          lastUpdated={t('dashboard.cards.world3D.lastUpdated')}
          members={["🌍", "🎯"]}
          icon={<span className="text-lg">🌍</span>}
          glowColor="from-green-500"
          className="h-48"
        />

        {/* Tarjeta de parámetros */}
        <ProjectCard
          title={t('dashboard.cards.parameterEditor.title')}
          lastUpdated={t('dashboard.cards.parameterEditor.lastUpdated')}
          members={["⚙️"]}
          icon={<span className="text-lg">⚙️</span>}
          glowColor="from-orange-500"
          className="h-48"
        />

        {/* Tarjeta de StereoWidener - Nueva */}
        <ProjectCard
          title={t('dashboard.cards.stereoWidener.title')}
          lastUpdated={t('dashboard.cards.stereoWidener.lastUpdated')}
          members={["🎧"]}
          icon={<span className="text-lg">🎧</span>}
          glowColor="from-blue-500"
          className="h-48"
        />

        {/* Tarjeta de Phaser */}
        <ProjectCard
          title={t('dashboard.cards.phaser.title')}
          lastUpdated={t('dashboard.cards.phaser.lastUpdated')}
          members={["🌀"]}
          icon={<span className="text-lg">🌀</span>}
          glowColor="from-pink-500"
          className="h-48"
        />

        {/* Tarjeta de AutoFilter */}
        <ProjectCard
          title={t('dashboard.cards.autoFilter.title')}
          lastUpdated={t('dashboard.cards.autoFilter.lastUpdated')}
          members={["🔍"]}
          icon={<span className="text-lg">🔍</span>}
          glowColor="from-teal-500"
          className="h-48"
        />

        {/* Tarjeta de Reverb */}
        <ProjectCard
          title={t('dashboard.cards.reverb.title')}
          lastUpdated={t('dashboard.cards.reverb.lastUpdated')}
          members={["🏛️"]}
          icon={<span className="text-lg">🏛️</span>}
          glowColor="from-indigo-500"
          className="h-48"
        />

        {/* Tarjeta de estadísticas - Ocupa 2 columnas */}
        <div className="lg:col-span-2">
          <ProjectCard
            title={t('dashboard.cards.systemStats.title')}
            lastUpdated={t('dashboard.cards.systemStats.lastUpdated')}
            members={["📊", "📈", "📉"]}
            icon={<span className="text-lg">📊</span>}
            glowColor="from-yellow-500"
            className="h-48"
          />
        </div>

        {/* Tarjeta de configuración */}
        <ProjectCard
          title={t('dashboard.cards.settings.title')}
          lastUpdated={t('dashboard.cards.settings.lastUpdated')}
          members={["⚙️", "🎛️"]}
          icon={<span className="text-lg">⚙️</span>}
          glowColor="from-red-500"
          className="h-48"
        />

        {/* Tarjeta de ayuda */}
        <ProjectCard
          title={t('dashboard.cards.help.title')}
          lastUpdated={t('dashboard.cards.help.lastUpdated')}
          members={["❓", "📚"]}
          icon={<span className="text-lg">❓</span>}
          glowColor="from-gray-500"
          className="h-48"
        />
      </div>
    </div>
  );
}

