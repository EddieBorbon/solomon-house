'use client';

import { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';

export function WorldInfo() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { objects, selectedEntityId } = useWorldStore();

  // Contar objetos por tipo
  const objectCounts = objects.reduce((acc, obj) => {
    acc[obj.type] = (acc[obj.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calcular estadísticas
  const totalObjects = objects.length;
  const hasSelection = selectedEntityId !== null;
  const selectedObject = objects.find(obj => obj.id === selectedEntityId);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
        {/* Efecto de brillo interior */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
        
        {/* Header con botón de toggle */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 relative z-10">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            Información del Mundo
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-cyan-500/20"
            title={isExpanded ? "Ocultar detalles" : "Mostrar detalles"}
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Contenido expandible */}
        {isExpanded && (
          <div className="p-4 relative z-10">
            {/* Estadísticas generales */}
            <div className="space-y-3 mb-4">
              <div className="glass-container p-3 flex justify-between items-center">
                <span className="text-cyan-300 text-sm font-medium">Total de objetos:</span>
                <span className="text-white font-bold bg-black/60 px-2 py-1 rounded border border-cyan-500/30">{totalObjects}</span>
              </div>
              
              {objectCounts.cube && (
                <div className="glass-container p-3 flex justify-between items-center">
                  <span className="text-blue-400 text-sm font-medium">Cubos:</span>
                  <span className="text-white font-bold bg-black/60 px-2 py-1 rounded border border-blue-500/30">{objectCounts.cube}</span>
                </div>
              )}
              
              {objectCounts.sphere && (
                <div className="glass-container p-3 flex justify-between items-center">
                  <span className="text-purple-400 text-sm font-medium">Esferas:</span>
                  <span className="text-white font-bold bg-black/60 px-2 py-1 rounded border border-purple-500/30">{objectCounts.sphere}</span>
                </div>
              )}
            </div>

            {/* Estado de selección */}
            <div className={`glass-container p-4 border ${
              hasSelection 
                ? 'border-green-500/50 bg-green-900/20' 
                : 'border-gray-500/30 bg-gray-900/20'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  hasSelection ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-400'
                }`} />
                <span className="text-sm font-bold neon-text">
                  {hasSelection ? 'Objeto Seleccionado' : 'Sin Selección'}
                </span>
              </div>
              
              {hasSelection && selectedObject && (
                <div className="space-y-2">
                  <div className="bg-black/60 px-2 py-1 rounded border border-cyan-500/30">
                    <span className="text-cyan-300 text-xs">Tipo:</span> <span className="text-white font-mono text-xs">{selectedObject.type}</span>
                  </div>
                  <div className="bg-black/60 px-2 py-1 rounded border border-purple-500/30">
                    <span className="text-purple-300 text-xs">Posición:</span> <span className="text-white font-mono text-xs">
                      [{selectedObject.position.map(p => p.toFixed(1)).join(', ')}]
                    </span>
                  </div>
                  <div className="bg-black/60 px-2 py-1 rounded border border-pink-500/30">
                    <span className="text-pink-300 text-xs">Frecuencia:</span> <span className="text-white font-mono text-xs">{selectedObject.audioParams.frequency} Hz</span>
                  </div>
                </div>
              )}
              
              {!hasSelection && (
                <p className="text-xs text-cyan-300 bg-black/40 px-2 py-1 rounded border border-cyan-500/20">
                  Haz clic en un objeto para seleccionarlo
                </p>
              )}
            </div>

            {/* Información adicional */}
            <div className="mt-4 pt-3 border-t border-cyan-500/30">
              <p className="text-xs text-cyan-300 text-center mb-3 bg-black/40 px-2 py-1 rounded border border-cyan-500/20">
                Mundo sonoro interactivo
              </p>
              
              {/* Atajos de teclado */}
              <div className="glass-container p-4">
                <h4 className="text-xs font-bold neon-text mb-3 flex items-center gap-2">
                  <span className="text-lg">⌨️</span>
                  Atajos de Teclado
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-black/60 px-2 py-1 rounded border border-cyan-500/30">
                    <span className="text-cyan-300 font-mono">G:</span>
                    <span className="text-white">Mover</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/60 px-2 py-1 rounded border border-purple-500/30">
                    <span className="text-purple-300 font-mono">R:</span>
                    <span className="text-white">Rotar</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/60 px-2 py-1 rounded border border-pink-500/30">
                    <span className="text-pink-300 font-mono">S:</span>
                    <span className="text-white">Escalar</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/60 px-2 py-1 rounded border border-yellow-500/30">
                    <span className="text-yellow-300 font-mono">ESC:</span>
                    <span className="text-white">Salir edición</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/60 px-2 py-1 rounded border border-red-500/30">
                    <span className="text-red-300 font-mono">DEL:</span>
                    <span className="text-white">Eliminar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
