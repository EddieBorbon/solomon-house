'use client';

import React, { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';

export function GridCreator() {
  const { createGrid, currentGridCoordinates, gridSize, activeGridId, grids } = useWorldStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [newGridPosition, setNewGridPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [newGridSize, setNewGridSize] = useState<number>(20);

  // Obtener la cuadrícula activa o usar la central como fallback
  const activeGrid = activeGridId ? grids.get(activeGridId) : null;
  const baseCoordinates = activeGrid ? activeGrid.coordinates : currentGridCoordinates;

  const createGridAtPosition = (direction: 'north' | 'south' | 'east' | 'west' | 'up' | 'down') => {
    const [x, y, z] = baseCoordinates;
    let newCoordinates: [number, number, number];
    
    console.log(`📐 Creando cuadrícula adyacente desde cuadrícula activa: ${baseCoordinates}`);
    
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
    }
    
    // Calcular la posición 3D basada en las coordenadas de la cuadrícula
    const newPosition: [number, number, number] = [
      newCoordinates[0] * gridSize,
      newCoordinates[1] * gridSize,
      newCoordinates[2] * gridSize
    ];
    
    createGrid(newPosition, gridSize);
    console.log(`📐 Creando cuadrícula en coordenadas: ${newCoordinates}, posición 3D: ${newPosition}`);
  };

  const createGridAtCustomPosition = () => {
    createGrid(newGridPosition, newGridSize);
    console.log(`📐 Creando cuadrícula personalizada en: ${newGridPosition} con tamaño ${newGridSize}`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-3 min-w-[260px] max-w-[300px]">
        {/* Efecto de brillo interior */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span className="text-lg">➕</span>
            Creador de Cuadrículas
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-cyan-500/20"
            title={isExpanded ? "Ocultar creador" : "Mostrar creador"}
          >
            {isExpanded ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Posición actual - más compacta */}
        <div className="mb-2 p-2 bg-cyan-900/20 border border-cyan-700/50 rounded-lg">
          <div className="text-xs text-cyan-300">Posición Actual</div>
          <div className="text-white font-medium text-sm">
            ({baseCoordinates[0]}, {baseCoordinates[1]}, {baseCoordinates[2]})
          </div>
          {activeGrid && (
            <div className="text-xs text-cyan-400 mt-1">
              Cuadrícula Activa: {activeGrid.id.slice(0, 8)}...
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-2">
            {/* Crear cuadrículas adyacentes - más compacto */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-300">Crear Adyacentes</div>
              
              {/* Grid 2x3 más compacto */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => createGridAtPosition('west')}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                  title="Oeste"
                >
                  ← Oeste
                </button>
                <button
                  onClick={() => createGridAtPosition('east')}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                  title="Este"
                >
                  Este →
                </button>
                <button
                  onClick={() => createGridAtPosition('south')}
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                  title="Sur"
                >
                  ↓ Sur
                </button>
                <button
                  onClick={() => createGridAtPosition('north')}
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                  title="Norte"
                >
                  Norte ↑
                </button>
                <button
                  onClick={() => createGridAtPosition('down')}
                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                  title="Abajo"
                >
                  ⬇ Abajo
                </button>
                <button
                  onClick={() => createGridAtPosition('up')}
                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                  title="Arriba"
                >
                  ⬆ Arriba
                </button>
              </div>
            </div>

            {/* Crear cuadrícula personalizada - más compacta */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-300">Posición Personalizada</div>
              
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="text-xs text-gray-400 block">X</label>
                  <input
                    type="number"
                    value={newGridPosition[0]}
                    onChange={(e) => setNewGridPosition([parseInt(e.target.value) || 0, newGridPosition[1], newGridPosition[2]])}
                    className="w-full px-1 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block">Y</label>
                  <input
                    type="number"
                    value={newGridPosition[1]}
                    onChange={(e) => setNewGridPosition([newGridPosition[0], parseInt(e.target.value) || 0, newGridPosition[2]])}
                    className="w-full px-1 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block">Z</label>
                  <input
                    type="number"
                    value={newGridPosition[2]}
                    onChange={(e) => setNewGridPosition([newGridPosition[0], newGridPosition[1], parseInt(e.target.value) || 0])}
                    className="w-full px-1 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block">Tamaño</label>
                  <input
                    type="number"
                    value={newGridSize}
                    onChange={(e) => setNewGridSize(parseInt(e.target.value) || 20)}
                    className="w-full px-1 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                    placeholder="20"
                    min="5"
                    max="100"
                  />
                </div>
              </div>
              
              <button
                onClick={createGridAtCustomPosition}
                className="w-full px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-xs transition-colors"
                title="Crear cuadrícula en la posición especificada"
              >
                🎯 Crear
              </button>
            </div>

            {/* Instrucciones - más compactas */}
            <div className="p-2 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-400">
                <span className="font-semibold">Crear:</span> Botones de dirección • 
                <span className="font-semibold"> Personalizada:</span> Coordenadas exactas
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
