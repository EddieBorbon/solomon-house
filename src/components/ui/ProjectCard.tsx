import { ReactNode } from "react";

// Definimos los tipos de las props para que sea reutilizable
type ProjectCardProps = {
  title: string;
  lastUpdated: string;
  members: string[];
  icon: ReactNode;
  glowColor?: string; // Ej: "from-purple-500"
  className?: string; // Para personalizar el tamaño de la tarjeta
};

export default function ProjectCard({ 
  title, 
  lastUpdated, 
  members, 
  icon, 
  glowColor = "from-gray-500",
  className = "h-40"
}: ProjectCardProps) {
  return (
    // Contenedor principal de la tarjeta: relativo y con overflow-hidden para contener el brillo
    <div className={`relative overflow-hidden rounded-2xl p-5 ${className} flex flex-col justify-between border border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group shadow-2xl hover:shadow-3xl`}
         style={{
           background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)',
           boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
         }}>
      
      {/* EL EFECTO DE BRILLO (AURA) */}
      <div
        className={`absolute -top-1/2 -left-1/2 h-[200%] w-[200%] 
                   bg-gradient-radial ${glowColor} to-transparent 
                   animate-pulse opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-500`}
      />

      {/* Efecto de borde glassmorphism */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>

      {/* Contenido de la tarjeta (relativo para que esté por encima del brillo) */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 border border-white/20 shadow-lg"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                 boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 16px rgba(0, 0, 0, 0.2)',
               }}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg group-hover:text-cyan-200 transition-colors duration-300">
              {title}
            </h3>
            <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mt-1 group-hover:w-12 transition-all duration-300"></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-end justify-between">
        {/* Avatares de miembros con efecto glass */}
        <div className="flex -space-x-2">
          {members.map((member, index) => (
            <div
              key={index}
              className="h-8 w-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300"
              style={{
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              {member}
            </div>
          ))}
        </div>
        
        {/* Timestamp con efecto glass */}
        <div className="bg-white/5 rounded-lg px-3 py-1 border border-white/10 backdrop-blur-sm">
          <p className="text-xs text-gray-300 font-medium">{lastUpdated}</p>
        </div>
      </div>

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
}
