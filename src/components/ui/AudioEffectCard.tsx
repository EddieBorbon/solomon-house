import { ReactNode } from 'react';

type AudioEffectCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  glowColor: string;
  isActive?: boolean;
  parameters?: string[];
  className?: string;
  onClick?: () => void;
};

export default function AudioEffectCard({
  title,
  description,
  icon,
  glowColor,
  isActive = false,
  parameters = [],
  className = "h-48",
  onClick
}: AudioEffectCardProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl p-6 ${className} flex flex-col justify-between border border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 cursor-pointer group shadow-2xl hover:shadow-3xl ${isActive ? 'ring-2 ring-cyan-400/50 shadow-cyan-500/20' : ''}`}
      onClick={onClick}
      style={{
        background: isActive 
          ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)',
        boxShadow: isActive 
          ? '0 8px 32px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Efecto de brillo (aura) */}
      <div
        className={`absolute -top-1/2 -left-1/2 h-[200%] w-[200%] 
                   bg-gradient-radial ${glowColor} to-transparent 
                   animate-pulse opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-500`}
      />

      {/* Efecto de borde glassmorphism */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>

      {/* Contenido de la tarjeta */}
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 border border-white/20 shadow-lg"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                 boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 16px rgba(0, 0, 0, 0.2)',
               }}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg group-hover:text-cyan-200 transition-colors duration-300">
              {title}
            </h3>
            <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mt-1 group-hover:w-12 transition-all duration-300"></div>
            {isActive && (
              <div className="mt-2">
                <span className="text-xs bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 px-3 py-1 rounded-full border border-green-400/30 backdrop-blur-sm">
                  ✨ Activo
                </span>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">{description}</p>
      </div>

      <div className="relative z-10">
        {/* Parámetros con efecto glass */}
        {parameters.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-3 font-medium">Parámetros disponibles:</p>
            <div className="flex flex-wrap gap-2">
              {parameters.map((param, index) => (
                <span
                  key={index}
                  className="text-xs bg-white/10 text-white px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm group-hover:bg-white/20 transition-colors duration-300"
                  style={{
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {param}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Estado de la tarjeta con efecto glass */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 shadow-green-400/50' : 'bg-gray-500'} shadow-lg`} />
            <span className="text-xs text-gray-300 font-medium">
              {isActive ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-1 border border-white/10 backdrop-blur-sm">
            <span className="text-xs text-gray-400 font-medium">
              {parameters.length} parámetros
            </span>
          </div>
        </div>
      </div>

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
}
