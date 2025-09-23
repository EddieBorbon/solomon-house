'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';

interface NoiseSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function NoiseSynthParameters({
  selectedObject,
  onParamChange
}: NoiseSynthParametersProps) {
  if (selectedObject.type !== 'plane') return null;

  return (
    <>
      {/* Sección: Parámetros del NoiseSynth */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
        <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
          🟦 Parámetros del NoiseSynth
        </h4>
        
        {/* Tipo de Ruido */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Tipo de Ruido
          </label>
          <select
            value={selectedObject.audioParams.noiseType || 'white'}
            onChange={(e) => onParamChange('noiseType', e.target.value as 'white' | 'pink' | 'brown')}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
          >
            <option value="white">Blanco (Ruido completo)</option>
            <option value="pink">Rosa (Ruido suave)</option>
            <option value="brown">Marrón (Ruido bajo)</option>
          </select>
        </div>

        {/* Duración del Golpe */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Duración del Golpe (segundos)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.01"
              max="1"
              step="0.01"
              value={selectedObject.audioParams.duration || 0.1}
              onChange={(e) => onParamChange('duration', Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.duration || 0.1).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.01s</span>
            <span>1s</span>
          </div>
        </div>

        {/* Attack */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Attack (Ataque)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.001"
              max="1"
              step="0.001"
              value={selectedObject.audioParams.attack || 0.01}
              onChange={(e) => onParamChange('attack', Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.attack || 0.01).toFixed(3)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.001s</span>
            <span>1s</span>
          </div>
        </div>

        {/* Decay */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Decay (Caída)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.01"
              max="1"
              step="0.01"
              value={selectedObject.audioParams.decay || 0.1}
              onChange={(e) => onParamChange('decay', Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.decay || 0.1).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.01s</span>
            <span>1s</span>
          </div>
        </div>

        {/* Sustain */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Sustain (Sostenido)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedObject.audioParams.sustain || 0.1}
              onChange={(e) => onParamChange('sustain', Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {Math.round((selectedObject.audioParams.sustain || 0.1) * 100)}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Release */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Release (Liberación)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.01"
              max="2"
              step="0.01"
              value={selectedObject.audioParams.release || 0.2}
              onChange={(e) => onParamChange('release', Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.release || 0.2).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.01s</span>
            <span>2s</span>
          </div>
        </div>
      </div>
    </>
  );
}
