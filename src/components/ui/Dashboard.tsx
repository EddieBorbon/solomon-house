import ProjectCard from './ProjectCard';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Solomon House Dashboard</h1>
        <p className="text-gray-400">Sistema de audio espacial 3D con efectos avanzados</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Tarjeta principal - Ocupa 2 columnas */}
        <div className="lg:col-span-2">
          <ProjectCard
            title="Control Panel"
            lastUpdated="Activo"
            members={["🎛️"]}
            icon={<span className="text-lg">🎛️</span>}
            glowColor="from-cyan-500"
            className="h-48"
          />
        </div>

        {/* Tarjeta de efectos de audio */}
        <ProjectCard
          title="Efectos de Audio"
          lastUpdated="15 efectos"
          members={["🎵", "🔊"]}
          icon={<span className="text-lg">🎵</span>}
          glowColor="from-purple-500"
          className="h-48"
        />

        {/* Tarjeta de información del mundo */}
        <ProjectCard
          title="Mundo 3D"
          lastUpdated="12 objetos"
          members={["🌍", "🎯"]}
          icon={<span className="text-lg">🌍</span>}
          glowColor="from-green-500"
          className="h-48"
        />

        {/* Tarjeta de parámetros */}
        <ProjectCard
          title="Editor de Parámetros"
          lastUpdated="En tiempo real"
          members={["⚙️"]}
          icon={<span className="text-lg">⚙️</span>}
          glowColor="from-orange-500"
          className="h-48"
        />

        {/* Tarjeta de StereoWidener - Nueva */}
        <ProjectCard
          title="StereoWidener"
          lastUpdated="Nuevo efecto"
          members={["🎧"]}
          icon={<span className="text-lg">🎧</span>}
          glowColor="from-blue-500"
          className="h-48"
        />

        {/* Tarjeta de Phaser */}
        <ProjectCard
          title="Phaser"
          lastUpdated="Efecto activo"
          members={["🌀"]}
          icon={<span className="text-lg">🌀</span>}
          glowColor="from-pink-500"
          className="h-48"
        />

        {/* Tarjeta de AutoFilter */}
        <ProjectCard
          title="AutoFilter"
          lastUpdated="Filtro dinámico"
          members={["🔍"]}
          icon={<span className="text-lg">🔍</span>}
          glowColor="from-teal-500"
          className="h-48"
        />

        {/* Tarjeta de Reverb */}
        <ProjectCard
          title="Reverb"
          lastUpdated="Espacialización"
          members={["🏛️"]}
          icon={<span className="text-lg">🏛️</span>}
          glowColor="from-indigo-500"
          className="h-48"
        />

        {/* Tarjeta de estadísticas - Ocupa 2 columnas */}
        <div className="lg:col-span-2">
          <ProjectCard
            title="Estadísticas del Sistema"
            lastUpdated="Tiempo real"
            members={["📊", "📈", "📉"]}
            icon={<span className="text-lg">📊</span>}
            glowColor="from-yellow-500"
            className="h-48"
          />
        </div>

        {/* Tarjeta de configuración */}
        <ProjectCard
          title="Configuración"
          lastUpdated="Personalizable"
          members={["⚙️", "🎛️"]}
          icon={<span className="text-lg">⚙️</span>}
          glowColor="from-red-500"
          className="h-48"
        />

        {/* Tarjeta de ayuda */}
        <ProjectCard
          title="Ayuda y Documentación"
          lastUpdated="Actualizada"
          members={["❓", "📚"]}
          icon={<span className="text-lg">❓</span>}
          glowColor="from-gray-500"
          className="h-48"
        />
      </div>
    </div>
  );
}

