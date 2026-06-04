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
    currentGridCoordinates,
    gridSize,
    showGrid,
    setShowGrid
  } = useWorldStore();

  const { t } = useLanguage();
  const [isGridsExpanded, setIsGridsExpanded] = useState(false);
  const [newGridPosition, setNewGridPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [newGridSize, setNewGridSize] = useState<number>(20);

  const activeGrid = activeGridId ? grids.get(activeGridId) : null;

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
    }

    const newPosition: [number, number, number] = [
      newCoordinates[0] * gridSize,
      newCoordinates[1] * gridSize,
      newCoordinates[2] * gridSize
    ];

    createGrid(newPosition, gridSize);
  };

  const createGridAtCustomPosition = () => {
    createGrid(newGridPosition, newGridSize);
  };

  return (
    <div className="relative border border-white p-3">
      {/* Decoraciones de esquina */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
          <Squares2X2Icon className="w-3 h-3" />
          {t('controls.grids')}
        </h3>
        <button
          onClick={() => setIsGridsExpanded(!isGridsExpanded)}
          className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
          title={isGridsExpanded ? t('effects.hideGrids') : t('effects.showGrids')}
        >
          <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
          <span className="relative text-xs font-mono tracking-wider">
            {isGridsExpanded ? t('controls.hide') : t('controls.show')}
          </span>
        </button>
      </div>

      {/* Posición actual */}
      <div className="mb-2 p-2 border border-gray-600 text-xs text-gray-300 font-mono">
        <div className="space-y-1">
          <p><span className="text-white">{t('controls.pos')}</span> ({activeGrid ? activeGrid.coordinates[0] : currentGridCoordinates[0]}, {activeGrid ? activeGrid.coordinates[1] : currentGridCoordinates[1]}, {activeGrid ? activeGrid.coordinates[2] : currentGridCoordinates[2]})</p>
          {activeGrid && (
            <p><span className="text-white">{t('controls.active')}</span> {activeGrid.id.slice(0, 6)}...</p>
          )}
        </div>
      </div>

      {/* Control de visibilidad de cuadrícula */}
      {activeGrid && (
        <div className="mb-2 p-2 border border-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white tracking-wider">{t('controls.showGrid')}</span>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${showGrid ? 'bg-cyan-500' : 'bg-gray-600'}`}
              title={showGrid ? t('controls.hideGrid') : t('controls.showGrid')}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${showGrid ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>
      )}

      {isGridsExpanded && (
        <div className="space-y-2">
          {/* Crear cuadrículas adyacentes */}
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-white tracking-wider">{t('controls.adjacentGrids')}</div>

            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => createGridAtPosition('west')}
                className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                title={t('effects.west')}
              >
                <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                <span className="relative text-xs font-mono tracking-wider">{t('controls.west')}</span>
              </button>
              <button
                onClick={() => createGridAtPosition('east')}
                className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                title={t('effects.east')}
              >
                <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                <span className="relative text-xs font-mono tracking-wider">{t('controls.east')}</span>
              </button>
              <button
                onClick={() => createGridAtPosition('south')}
                className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                title={t('effects.south')}
              >
                <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                <span className="relative text-xs font-mono tracking-wider">{t('controls.south')}</span>
              </button>
              <button
                onClick={() => createGridAtPosition('north')}
                className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                title={t('effects.north')}
              >
                <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                <span className="relative text-xs font-mono tracking-wider">{t('controls.north')}</span>
              </button>
              <button
                onClick={() => createGridAtPosition('down')}
                className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                title={t('effects.down')}
              >
                <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                <span className="relative text-xs font-mono tracking-wider">{t('controls.down')}</span>
              </button>
              <button
                onClick={() => createGridAtPosition('up')}
                className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                title={t('effects.up')}
              >
                <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                <span className="relative text-xs font-mono tracking-wider">{t('controls.up')}</span>
              </button>
            </div>
          </div>

          {/* Crear cuadrícula personalizada */}
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-white tracking-wider">{t('controls.customGrid')}</div>

            <div className="grid grid-cols-4 gap-1">
              <div>
                <label className="text-xs text-gray-400 block font-mono tracking-wider">X</label>
                <input
                  type="number"
                  value={newGridPosition[0]}
                  onChange={(e) => setNewGridPosition([parseInt(e.target.value) || 0, newGridPosition[1], newGridPosition[2]])}
                  className="w-full px-1 py-1 bg-black border border-gray-600 text-white text-xs font-mono focus:border-white focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block font-mono tracking-wider">Y</label>
                <input
                  type="number"
                  value={newGridPosition[1]}
                  onChange={(e) => setNewGridPosition([newGridPosition[0], parseInt(e.target.value) || 0, newGridPosition[2]])}
                  className="w-full px-1 py-1 bg-black border border-gray-600 text-white text-xs font-mono focus:border-white focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block font-mono tracking-wider">Z</label>
                <input
                  type="number"
                  value={newGridPosition[2]}
                  onChange={(e) => setNewGridPosition([newGridPosition[0], newGridPosition[1], parseInt(e.target.value) || 0])}
                  className="w-full px-1 py-1 bg-black border border-gray-600 text-white text-xs font-mono focus:border-white focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block font-mono tracking-wider">{t('controls.size')}</label>
                <input
                  type="number"
                  value={newGridSize}
                  onChange={(e) => setNewGridSize(parseInt(e.target.value) || 20)}
                  className="w-full px-1 py-1 bg-black border border-gray-600 text-white text-xs font-mono focus:border-white focus:outline-none"
                  placeholder="20"
                  min="5"
                  max="100"
                />
              </div>
            </div>

            <button
              onClick={createGridAtCustomPosition}
              className="relative w-full border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
              title={t('effects.createGridAtPosition')}
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider flex items-center justify-center space-x-1">
                <span>🎯</span>
                <span>{t('controls.createGridButton')}</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
