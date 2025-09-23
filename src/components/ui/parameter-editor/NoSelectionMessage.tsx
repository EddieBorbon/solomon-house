'use client';

import React from 'react';

/**
 * Componente que muestra un mensaje cuando no hay entidad seleccionada
 * Responsabilidad única: Mostrar estado de "no selección"
 */
export function NoSelectionMessage() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-xs max-h-[75vh] overflow-y-auto">
        {/* Efecto de brillo interior */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
        
        <div className="text-center relative z-10">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-cyan-500/20 to-black/40 rounded-full flex items-center justify-center border border-cyan-400/30">
            <span className="text-lg">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No hay entidad seleccionada
          </h3>
          <p className="text-cyan-300 text-sm">
            Haz clic en un objeto sonoro o zona de efecto en el mundo 3D para seleccionarlo y editar sus parámetros.
          </p>
        </div>
      </div>
    </div>
  );
}
