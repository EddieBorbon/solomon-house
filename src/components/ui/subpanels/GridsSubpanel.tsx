'use client';

import React, { useState } from 'react';
import { useWorldStore } from '../../../state/useWorldStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

export function GridsSubpanel() {
  const {
    activeGridId,
    grids,
    createGrid,
    selectGrid,
    setActiveGrid,
    deleteGrid,
    getGridKey,
    currentGridCoordinates,
    gridSize,
    showGrid,
    setShowGrid,
  } = useWorldStore();

  const { t } = useLanguage();
  const [isGridsExpanded, setIsGridsExpanded] = useState(true);
  const [newGridCoords, setNewGridCoords] = useState<[number, number, number]>([1, 0, 0]);
  const [newGridSize, setNewGridSize] = useState<number>(20);

  const activeGrid = activeGridId ? grids.get(activeGridId) : null;
  const allGrids = Array.from(grids.values());

  const createOrSelectAdjacentGrid = (
    direction: 'north' | 'south' | 'east' | 'west' | 'up' | 'down'
  ) => {
    const baseCoordinates = activeGrid ? activeGrid.coordinates : currentGridCoordinates;
    const [x, y, z] = baseCoordinates;
    let newCoordinates: [number, number, number];

    switch (direction) {
      case 'north':
        newCoordinates = [x, y, z - 1];
        break;
      case 'south':
        newCoordinates = [x, y, z + 1];
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

    const size = activeGrid?.gridSize || gridSize || 20;
    const targetKey = getGridKey(newCoordinates);

    if (grids.has(targetKey)) {
      selectGrid(targetKey);
      setActiveGrid(targetKey);
      return;
    }

    const newPosition: [number, number, number] = [
      newCoordinates[0] * size,
      newCoordinates[1] * size,
      newCoordinates[2] * size,
    ];

    createGrid(newPosition, size);
    selectGrid(targetKey);
    setActiveGrid(targetKey);
  };

  const createGridAtCustomCoords = () => {
    const size = newGridSize || 20;
    const targetKey = getGridKey(newGridCoords);
    if (grids.has(targetKey)) {
      selectGrid(targetKey);
      setActiveGrid(targetKey);
      return;
    }
    createGrid(
      [newGridCoords[0] * size, newGridCoords[1] * size, newGridCoords[2] * size],
      size
    );
    selectGrid(targetKey);
    setActiveGrid(targetKey);
  };

  const activeCoords = activeGrid ? activeGrid.coordinates : currentGridCoordinates;

  return (
    <div className="relative border border-white p-3">
      {/* Decoraciones de esquina */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
          <Squares2X2Icon className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('controls.grids')} ({allGrids.length})</span>
        </h3>
        <button
          onClick={() => setIsGridsExpanded(!isGridsExpanded)}
          className="relative border border-white px-2 py-0.5 text-white hover:bg-white hover:text-black transition-all duration-300 group"
        >
          <span className="relative text-[10px] font-mono tracking-wider">
            {isGridsExpanded ? t('controls.hide') : t('controls.show')}
          </span>
        </button>
      </div>

      {/* Cuadrícula activa y visibilidad */}
      <div className="mb-2 flex items-center justify-between p-2 border border-gray-700 bg-zinc-950 text-xs font-mono">
        <div>
          <span className="text-gray-400">Activa: </span>
          <span className="text-emerald-400 font-bold">
            ({activeCoords[0]}, {activeCoords[1]}, {activeCoords[2]})
          </span>
        </div>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-2 py-0.5 text-[10px] border transition-colors ${
            showGrid
              ? 'border-emerald-400 text-emerald-300 bg-emerald-950/40'
              : 'border-gray-600 text-gray-400'
          }`}
        >
          {showGrid ? 'Visible' : 'Oculta'}
        </button>
      </div>

      {isGridsExpanded && (
        <div className="space-y-3">
          {/* Cruceta para crear o ir a cuadrículas a los lados */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
              + Expandir Cuadrícula a los Lados
            </div>

            <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
              <button
                onClick={() => createOrSelectAdjacentGrid('down')}
                className="border border-gray-700 bg-zinc-900 py-1 text-gray-300 hover:border-white hover:text-white"
                title="Crear/Ir a cuadrícula inferior (Y - 1)"
              >
                ⬇ -Y
              </button>
              <button
                onClick={() => createOrSelectAdjacentGrid('north')}
                className="border border-emerald-500/60 bg-emerald-950/30 py-1 text-emerald-200 hover:bg-emerald-500 hover:text-black font-bold"
                title="Crear cuadrícula al Norte (Z - 1)"
              >
                ↑ +Norte
              </button>
              <button
                onClick={() => createOrSelectAdjacentGrid('up')}
                className="border border-gray-700 bg-zinc-900 py-1 text-gray-300 hover:border-white hover:text-white"
                title="Crear/Ir a cuadrícula superior (Y + 1)"
              >
                ⬆ +Y
              </button>

              <button
                onClick={() => createOrSelectAdjacentGrid('west')}
                className="border border-emerald-500/60 bg-emerald-950/30 py-1.5 text-emerald-200 hover:bg-emerald-500 hover:text-black font-bold"
                title="Crear cuadrícula al Oeste / Izquierda (X - 1)"
              >
                ← +Oeste
              </button>
              <div className="border border-white/40 bg-black py-1.5 text-white font-bold flex items-center justify-center">
                ({activeCoords[0]},{activeCoords[1]},{activeCoords[2]})
              </div>
              <button
                onClick={() => createOrSelectAdjacentGrid('east')}
                className="border border-emerald-500/60 bg-emerald-950/30 py-1.5 text-emerald-200 hover:bg-emerald-500 hover:text-black font-bold"
                title="Crear cuadrícula al Este / Derecha (X + 1)"
              >
                +Este →
              </button>

              <div />
              <button
                onClick={() => createOrSelectAdjacentGrid('south')}
                className="border border-emerald-500/60 bg-emerald-950/30 py-1 text-emerald-200 hover:bg-emerald-500 hover:text-black font-bold"
                title="Crear cuadrícula al Sur (Z + 1)"
              >
                ↓ +Sur
              </button>
              <div />
            </div>
          </div>

          {/* Lista de cuadrículas existentes en el mundo */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold text-gray-300 uppercase tracking-wider">
              Cuadrículas en Escena ({allGrids.length})
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
              {allGrids.map((g) => {
                const isAct = g.id === activeGridId;
                const objCount =
                  (g.objects?.length || 0) +
                  (g.mobileObjects?.length || 0) +
                  (g.effectZones?.length || 0);
                return (
                  <div
                    key={g.id}
                    className={`flex items-center justify-between px-2 py-1 border text-[10px] font-mono ${
                      isAct
                        ? 'border-emerald-400 bg-emerald-950/40 text-white'
                        : 'border-gray-700 bg-zinc-950 text-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => {
                        selectGrid(g.id);
                        setActiveGrid(g.id);
                      }}
                      className="flex-1 text-left hover:text-emerald-300"
                    >
                      <span className="font-bold">
                        [{g.coordinates.join(', ')}]
                      </span>{' '}
                      <span className="text-gray-400">· {objCount} elem.</span>
                    </button>
                    {allGrids.length > 1 && (
                      <button
                        onClick={() => deleteGrid(g.id)}
                        className="ml-2 text-red-400 hover:text-red-200 px-1"
                        title="Eliminar esta cuadrícula"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crear cuadrícula en coordenada personalizada */}
          <div className="space-y-1 pt-1 border-t border-gray-800">
            <div className="text-[10px] font-mono text-gray-400">
              Coordenada personalizada (X, Y, Z) y Tamaño:
            </div>
            <div className="grid grid-cols-4 gap-1">
              <input
                type="number"
                value={newGridCoords[0]}
                onChange={(e) =>
                  setNewGridCoords([
                    parseInt(e.target.value, 10) || 0,
                    newGridCoords[1],
                    newGridCoords[2],
                  ])
                }
                className="w-full px-1 py-0.5 bg-black border border-gray-600 text-white text-[10px] font-mono"
                placeholder="X"
              />
              <input
                type="number"
                value={newGridCoords[1]}
                onChange={(e) =>
                  setNewGridCoords([
                    newGridCoords[0],
                    parseInt(e.target.value, 10) || 0,
                    newGridCoords[2],
                  ])
                }
                className="w-full px-1 py-0.5 bg-black border border-gray-600 text-white text-[10px] font-mono"
                placeholder="Y"
              />
              <input
                type="number"
                value={newGridCoords[2]}
                onChange={(e) =>
                  setNewGridCoords([
                    newGridCoords[0],
                    newGridCoords[1],
                    parseInt(e.target.value, 10) || 0,
                  ])
                }
                className="w-full px-1 py-0.5 bg-black border border-gray-600 text-white text-[10px] font-mono"
                placeholder="Z"
              />
              <input
                type="number"
                value={newGridSize}
                onChange={(e) => setNewGridSize(parseInt(e.target.value, 10) || 20)}
                className="w-full px-1 py-0.5 bg-black border border-gray-600 text-white text-[10px] font-mono"
                min="5"
                max="100"
              />
            </div>
            <button
              onClick={createGridAtCustomCoords}
              className="w-full border border-white py-1 text-[10px] font-mono text-white hover:bg-white hover:text-black transition-colors"
            >
              + Crear / Ir a Cuadrícula ({newGridCoords.join(', ')})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
