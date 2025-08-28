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
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl">
        {/* Header con botón de toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🌍 Información del Mundo
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
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
          <div className="p-4">
            {/* Estadísticas generales */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Total de objetos:</span>
                <span className="text-white font-semibold">{totalObjects}</span>
              </div>
              
              {objectCounts.cube && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-400 text-sm">Cubos:</span>
                  <span className="text-white font-semibold">{objectCounts.cube}</span>
                </div>
              )}
              
              {objectCounts.sphere && (
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 text-sm">Esferas:</span>
                  <span className="text-white font-semibold">{objectCounts.sphere}</span>
                </div>
              )}
            </div>

            {/* Estado de selección */}
            <div className={`p-3 rounded-lg border ${
              hasSelection 
                ? 'bg-green-900/30 border-green-600/50' 
                : 'bg-gray-800/50 border-gray-600/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${
                  hasSelection ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <span className="text-sm font-medium text-gray-300">
                  {hasSelection ? 'Objeto Seleccionado' : 'Sin Selección'}
                </span>
              </div>
              
              {hasSelection && selectedObject && (
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Tipo: <span className="text-white">{selectedObject.type}</span></p>
                  <p>Posición: <span className="text-white font-mono">
                    [{selectedObject.position.map(p => p.toFixed(1)).join(', ')}]
                  </span></p>
                  <p>Frecuencia: <span className="text-white">{selectedObject.audioParams.frequency} Hz</span></p>
                </div>
              )}
              
              {!hasSelection && (
                <p className="text-xs text-gray-500">
                  Haz clic en un objeto para seleccionarlo
                </p>
              )}
            </div>

            {/* Información adicional */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400 text-center mb-3">
                Mundo sonoro interactivo
              </p>
              
              {/* Atajos de teclado */}
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/50">
                <h4 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                  ⌨️ Atajos de Teclado
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">G:</span>
                    <span className="text-white">Mover</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">R:</span>
                    <span className="text-white">Rotar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">S:</span>
                    <span className="text-white">Escalar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ESC:</span>
                    <span className="text-white">Salir edición</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">DEL:</span>
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
