'use client';

import React, { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';

import { type MobileObjectParams } from '../sound-objects/MobileObject';

interface MobileObjectEditorProps {
  mobileObject: {
    id: string;
    position: [number, number, number];
    mobileParams: MobileObjectParams;
  };
}

export function MobileObjectEditor({ mobileObject }: MobileObjectEditorProps) {
  const { updateMobileObject } = useWorldStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleParamChange = (param: string, value: string | number | boolean) => {
    updateMobileObject(mobileObject.id, {
      mobileParams: {
        ...mobileObject.mobileParams,
        [param]: value,
      },
    });
  };

  const handleNestedParamChange = (param: string, value: [number, number, number]) => {
    updateMobileObject(mobileObject.id, {
      mobileParams: {
        ...mobileObject.mobileParams,
        [param]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-semibold text-white flex items-center gap-2">
          <span className="text-lg">🚀</span>
          Parámetros de Movimiento
        </h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-cyan-500/20"
        >
          {isExpanded ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Movimiento
            </label>
            <select
              value={mobileObject.mobileParams.movementType}
              onChange={(e) => handleParamChange('movementType', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="linear">Lineal</option>
              <option value="circular">Circular</option>
              <option value="polar">Polar</option>
              <option value="random">Aleatorio</option>
              <option value="figure8">Figura 8</option>
              <option value="spiral">Espiral</option>
            </select>
          </div>

          {/* Radio de desplazamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Radio de Desplazamiento: {mobileObject.mobileParams.radius.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              value={mobileObject.mobileParams.radius}
              onChange={(e) => handleParamChange('radius', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Velocidad */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Velocidad: {mobileObject.mobileParams.speed.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={mobileObject.mobileParams.speed}
              onChange={(e) => handleParamChange('speed', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Umbral de proximidad */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Umbral de Proximidad: {mobileObject.mobileParams.proximityThreshold.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={mobileObject.mobileParams.proximityThreshold}
              onChange={(e) => handleParamChange('proximityThreshold', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Estado activo */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Objeto Activo
            </label>
            <button
              onClick={() => handleParamChange('isActive', !mobileObject.mobileParams.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                mobileObject.mobileParams.isActive ? 'bg-cyan-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  mobileObject.mobileParams.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Controles de visibilidad de indicadores */}
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">👁️ Indicadores Visuales</h4>
            
            {/* Mostrar indicador de radio */}
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                Mostrar Radio de Desplazamiento
              </label>
              <button
                onClick={() => handleParamChange('showRadiusIndicator', !(mobileObject.mobileParams.showRadiusIndicator ?? false))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  (mobileObject.mobileParams.showRadiusIndicator ?? false) ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    (mobileObject.mobileParams.showRadiusIndicator ?? false) ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Mostrar indicador de proximidad */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Mostrar Umbral de Proximidad
              </label>
              <button
                onClick={() => handleParamChange('showProximityIndicator', !(mobileObject.mobileParams.showProximityIndicator ?? false))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  (mobileObject.mobileParams.showProximityIndicator ?? false) ? 'bg-red-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    (mobileObject.mobileParams.showProximityIndicator ?? false) ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Parámetros específicos según el tipo de movimiento */}
          {mobileObject.mobileParams.movementType === 'linear' && (
            <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300">Dirección del Movimiento</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">X</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mobileObject.mobileParams.direction[0]}
                    onChange={(e) => handleNestedParamChange('direction', [
                      parseFloat(e.target.value),
                      mobileObject.mobileParams.direction[1],
                      mobileObject.mobileParams.direction[2]
                    ])}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Y</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mobileObject.mobileParams.direction[1]}
                    onChange={(e) => handleNestedParamChange('direction', [
                      mobileObject.mobileParams.direction[0],
                      parseFloat(e.target.value),
                      mobileObject.mobileParams.direction[2]
                    ])}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Z</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mobileObject.mobileParams.direction[2]}
                    onChange={(e) => handleNestedParamChange('direction', [
                      mobileObject.mobileParams.direction[0],
                      mobileObject.mobileParams.direction[1],
                      parseFloat(e.target.value)
                    ])}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {mobileObject.mobileParams.movementType === 'polar' && (
            <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300">Parámetros Polares</h4>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amplitud: {mobileObject.mobileParams.amplitude.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={mobileObject.mobileParams.amplitude}
                  onChange={(e) => handleParamChange('amplitude', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Frecuencia: {mobileObject.mobileParams.frequency.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={mobileObject.mobileParams.frequency}
                  onChange={(e) => handleParamChange('frequency', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          )}

          {mobileObject.mobileParams.movementType === 'random' && (
            <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300">Parámetros Aleatorios</h4>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Semilla Aleatoria: {mobileObject.mobileParams.randomSeed.toFixed(0)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="1"
                  value={mobileObject.mobileParams.randomSeed}
                  onChange={(e) => handleParamChange('randomSeed', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          )}

          {/* Información de estado */}
          <div className="p-3 bg-cyan-900/20 border border-cyan-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-cyan-300 mb-2">Estado del Objeto</h4>
            <div className="space-y-1 text-xs text-cyan-200">
              <p>• <strong>Posición:</strong> [{mobileObject.position.map(p => p.toFixed(1)).join(', ')}]</p>
              <p>• <strong>Movimiento:</strong> {mobileObject.mobileParams.movementType}</p>
              <p>• <strong>Activo:</strong> {mobileObject.mobileParams.isActive ? 'Sí' : 'No'}</p>
              <p>• <strong>Proximidad:</strong> {mobileObject.mobileParams.proximityThreshold.toFixed(1)} unidades</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
