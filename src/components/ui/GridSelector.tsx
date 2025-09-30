'use client';

import React, { useState } from 'react';
import { useGridStore } from '../../stores/useGridStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Squares2X2Icon
} from '@heroicons/react/24/outline';

export function GridSelector() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newGridPosition, setNewGridPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [newGridSize, setNewGridSize] = useState<number>(20);
  
  const { 
    activeGridId, 
    grids, 
    createGrid, 
    setActiveGrid,
    currentGridCoordinates, 
    gridSize 
  } = useGridStore();
  
  useLanguage();

  // Obtener información de la cuadrícula activa
  const activeGrid = activeGridId ? grids.get(activeGridId) : null;

  // Crear nueva cuadrícula en una dirección específica
  const createGridAtPosition = (direction: 'north' | 'south' | 'east' | 'west' | 'up' | 'down') => {
    const baseCoordinates = activeGrid ? activeGrid.coordinates : currentGridCoordinates;
    const [x, y, z] = baseCoordinates;
    let newCoordinates: [number, number, number];
    
    switch (direction) {
      case 'north':
        newCoordinates = [x, y, z + 1];
        break;
      case 'south':
        newCoordinates = [x, y, z - 1];
        break;
      case 'east':
        newCoordinates = [x + 1, y, z];
        break;
      case 'west':
        newCoordinates = [x - 1, y, z];
        break;
      case 'up':
        newCoordinates = [x, y + 1, z];
        break;
      case 'down':
        newCoordinates = [x, y - 1, z];
        break;
      default:
        newCoordinates = [x, y, z];
    }
    
    const newPosition: [number, number, number] = [
      newCoordinates[0] * gridSize,
      newCoordinates[1] * gridSize,
      newCoordinates[2] * gridSize
    ];
    
    createGrid(newPosition, gridSize);
  };

  // Crear cuadrícula en posición personalizada
  const createGridAtCustomPosition = () => {
    createGrid(newGridPosition, newGridSize);
  };

  // Cambiar a cuadrícula específica
  const switchToGrid = (gridId: string) => {
    setActiveGrid(gridId);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/90 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <Squares2X2Icon className="w-4 h-4" />
              CUADRÍCULAS
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>

          {/* Estado actual */}
          <div className="text-xs text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <span>Activa:</span>
              <span className={`px-2 py-1 rounded text-xs font-mono ${
                activeGridId === 'global-world' 
                  ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                  : 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
              }`}>
                {activeGridId === 'global-world' ? '🌐 GLOBAL' : activeGridId || 'Ninguna'}
              </span>
            </div>
            {activeGrid && (
              <div className="mt-1 space-y-1">
                <div>Objetos: <span className="text-white">{activeGrid.objects?.length || 0}</span></div>
                <div>Móviles: <span className="text-white">{activeGrid.mobileObjects?.length || 0}</span></div>
                <div>Efectos: <span className="text-white">{activeGrid.effectZones?.length || 0}</span></div>
              </div>
            )}
          </div>

          {/* Panel expandible */}
          {isExpanded && (
            <div className="space-y-3">
              {/* Lista de cuadrículas disponibles */}
              <div>
                <h4 className="text-xs font-medium text-white mb-2">Cambiar Cuadrícula:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {/* Botón para mundo global */}
                  <button
                    onClick={() => switchToGrid('global-world')}
                    className={`w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors ${
                      activeGridId === 'global-world'
                        ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    🌐 Mundo Global
                  </button>
                  
                  {/* Cuadrículas locales */}
                  {Array.from(grids.entries())
                    .filter(([id]) => id !== 'global-world')
                    .map(([id, grid]) => (
                      <button
                        key={id}
                        onClick={() => switchToGrid(id)}
                        className={`w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors ${
                          activeGridId === id
                            ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                        }`}
                      >
                        📍 {grid.coordinates.join(',')} ({grid.objects?.length || 0} objetos)
                      </button>
                    ))}
                </div>
              </div>

              {/* Crear nuevas cuadrículas */}
              <div>
                <h4 className="text-xs font-medium text-white mb-2">Crear Cuadrícula:</h4>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <button
                    onClick={() => createGridAtPosition('north')}
                    className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                  >
                    ↑ Norte
                  </button>
                  <button
                    onClick={() => createGridAtPosition('south')}
                    className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                  >
                    ↓ Sur
                  </button>
                  <button
                    onClick={() => createGridAtPosition('east')}
                    className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                  >
                    → Este
                  </button>
                  <button
                    onClick={() => createGridAtPosition('west')}
                    className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                  >
                    ← Oeste
                  </button>
                  <button
                    onClick={() => createGridAtPosition('up')}
                    className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                  >
                    ⬆ Arriba
                  </button>
                  <button
                    onClick={() => createGridAtPosition('down')}
                    className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                  >
                    ⬇ Abajo
                  </button>
                </div>
              </div>

              {/* Crear cuadrícula personalizada */}
              <div>
                <h4 className="text-xs font-medium text-white mb-2">Posición Personalizada:</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Posición (X, Y, Z):</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={newGridPosition[0]}
                        onChange={(e) => setNewGridPosition([Number(e.target.value), newGridPosition[1], newGridPosition[2]])}
                        className="w-16 px-1 py-1 text-xs bg-gray-800 text-white border border-gray-600 rounded"
                        placeholder="X"
                      />
                      <input
                        type="number"
                        value={newGridPosition[1]}
                        onChange={(e) => setNewGridPosition([newGridPosition[0], Number(e.target.value), newGridPosition[2]])}
                        className="w-16 px-1 py-1 text-xs bg-gray-800 text-white border border-gray-600 rounded"
                        placeholder="Y"
                      />
                      <input
                        type="number"
                        value={newGridPosition[2]}
                        onChange={(e) => setNewGridPosition([newGridPosition[0], newGridPosition[1], Number(e.target.value)])}
                        className="w-16 px-1 py-1 text-xs bg-gray-800 text-white border border-gray-600 rounded"
                        placeholder="Z"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Tamaño:</label>
                    <input
                      type="number"
                      value={newGridSize}
                      onChange={(e) => setNewGridSize(Number(e.target.value))}
                      className="w-full px-1 py-1 text-xs bg-gray-800 text-white border border-gray-600 rounded"
                      min="5"
                      max="50"
                    />
                  </div>
                  <button
                    onClick={createGridAtCustomPosition}
                    className="w-full px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Crear Cuadrícula
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
