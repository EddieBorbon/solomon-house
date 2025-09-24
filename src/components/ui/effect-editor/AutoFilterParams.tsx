'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface AutoFilterParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function AutoFilterParams({ zone, onEffectParamChange }: AutoFilterParamsProps) {
  if (zone?.type !== 'autoFilter') return null;

  return (
    <>
      {/* Depth */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Profundidad de Modulación
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.depth ?? 0.5}
            onChange={(e) => onEffectParamChange('depth', Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-sm min-w-[4rem] text-right">
            {zone?.effectParams.depth ?? 0.5}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>1</span>
        </div>
      </div>

      {/* Filter Type */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Tipo de Filtro
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['lowpass', 'highpass', 'bandpass', 'notch'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => onEffectParamChange('filterType', filterType)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                (zone?.effectParams.filterType ?? 'lowpass') === filterType
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <span className="capitalize">{filterType}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Q */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Resonancia (Q)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={zone?.effectParams.filterQ ?? 1}
            onChange={(e) => onEffectParamChange('filterQ', Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-sm min-w-[4rem] text-right">
            {zone?.effectParams.filterQ ?? 1}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.1</span>
          <span>10</span>
        </div>
      </div>

      {/* LFO Type */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Tipo de LFO
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((lfoType) => (
            <button
              key={lfoType}
              onClick={() => onEffectParamChange('lfoType', lfoType)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                (zone?.effectParams.lfoType ?? 'sine') === lfoType
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <span className="capitalize">{lfoType}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
