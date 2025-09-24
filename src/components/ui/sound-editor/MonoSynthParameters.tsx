'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';

interface MonoSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function MonoSynthParameters({
  selectedObject,
  onParamChange
}: MonoSynthParametersProps) {
  if (selectedObject.type !== 'pyramid') return null;

  return (
    <>
      {/* Sección: Envolvente de Amplitud */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
        <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
          🔺 Envolvente de Amplitud
        </h4>
        
        {/* Amp Attack */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Attack (Ataque)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.001"
              max="2"
              step="0.001"
              value={selectedObject.audioParams.ampAttack || 0.01}
              onChange={(e) => onParamChange('ampAttack', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.ampAttack || 0.01).toFixed(3)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.001s</span>
            <span>2s</span>
          </div>
        </div>

        {/* Amp Decay */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Decay (Caída)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.01"
              max="2"
              step="0.01"
              value={selectedObject.audioParams.ampDecay || 0.2}
              onChange={(e) => onParamChange('ampDecay', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.ampDecay || 0.2).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.01s</span>
            <span>2s</span>
          </div>
        </div>

        {/* Amp Sustain */}
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
              value={selectedObject.audioParams.ampSustain || 0.1}
              onChange={(e) => onParamChange('ampSustain', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {Math.round((selectedObject.audioParams.ampSustain || 0.1) * 100)}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Amp Release */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Release (Liberación)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.01"
              max="4"
              step="0.01"
              value={selectedObject.audioParams.ampRelease || 0.5}
              onChange={(e) => onParamChange('ampRelease', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.ampRelease || 0.5).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.01s</span>
            <span>4s</span>
          </div>
        </div>
      </div>

      {/* Sección: Envolvente de Filtro */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
        <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
          🎛️ Envolvente de Filtro
        </h4>
        
        {/* Filter Attack */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Filter Attack
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.001"
              max="1"
              step="0.001"
              value={selectedObject.audioParams.filterAttack || 0.005}
              onChange={(e) => onParamChange('filterAttack', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.filterAttack || 0.005).toFixed(3)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.001s</span>
            <span>1s</span>
          </div>
        </div>

        {/* Filter Decay */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Filter Decay
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.01"
              max="2"
              step="0.01"
              value={selectedObject.audioParams.filterDecay || 0.1}
              onChange={(e) => onParamChange('filterDecay', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.filterDecay || 0.1).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.01s</span>
            <span>2s</span>
          </div>
        </div>

        {/* Filter Sustain */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Filter Sustain
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedObject.audioParams.filterSustain || 0.05}
              onChange={(e) => onParamChange('filterSustain', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {Math.round((selectedObject.audioParams.filterSustain || 0.05) * 100)}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Filter Release */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Filter Release
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.01"
              max="2"
              step="0.01"
              value={selectedObject.audioParams.filterRelease || 0.2}
              onChange={(e) => onParamChange('filterRelease', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.filterRelease || 0.2).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.01s</span>
            <span>2s</span>
          </div>
        </div>

        {/* Filter Base Frequency */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Frec. Base del Filtro
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="20"
              max="2000"
              step="1"
              value={selectedObject.audioParams.filterBaseFreq || 200}
              onChange={(e) => onParamChange('filterBaseFreq', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {selectedObject.audioParams.filterBaseFreq || 200}Hz
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>20 Hz</span>
            <span>2000 Hz</span>
          </div>
        </div>

        {/* Filter Octaves */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Octavas del Filtro
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.1"
              value={selectedObject.audioParams.filterOctaves || 4}
              onChange={(e) => onParamChange('filterOctaves', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.filterOctaves || 4).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5</span>
            <span>8</span>
          </div>
        </div>

        {/* Filter Q (Resonancia) */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Resonancia (Q)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={selectedObject.audioParams.filterQ || 2}
              onChange={(e) => onParamChange('filterQ', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.filterQ || 2).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1</span>
            <span>10</span>
          </div>
        </div>
      </div>
    </>
  );
}
