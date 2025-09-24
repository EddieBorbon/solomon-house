'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface TremoloParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function TremoloParams({ zone, onEffectParamChange }: TremoloParamsProps) {
  if (zone?.type !== 'tremolo') return null;

  return (
    <>
      {/* Frequency */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Frecuencia: {zone?.effectParams.tremoloFrequency ?? 10} Hz
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="20"
            step="0.1"
            value={zone?.effectParams.tremoloFrequency ?? 10}
            onChange={(e) => onEffectParamChange('tremoloFrequency', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.tremoloFrequency ?? 10} Hz
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.1 Hz</span>
          <span>20 Hz</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Velocidad de modulación del tremolo
        </p>
      </div>

      {/* Depth */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Profundidad: {Math.round((zone?.effectParams.tremoloDepth ?? 0.5) * 100)}%
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={zone?.effectParams.tremoloDepth ?? 0.5}
            onChange={(e) => onEffectParamChange('tremoloDepth', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {Math.round((zone?.effectParams.tremoloDepth ?? 0.5) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Intensidad de la modulación de amplitud
        </p>
      </div>

      {/* Spread */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Spread: {zone?.effectParams.tremoloSpread ?? 180}°
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="180"
            step="1"
            value={zone?.effectParams.tremoloSpread ?? 180}
            onChange={(e) => onEffectParamChange('tremoloSpread', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.tremoloSpread ?? 180}°
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0°</span>
          <span>180°</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Separación estéreo entre canales LFO
        </p>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Tipo de Onda
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((waveType) => (
            <button
              key={waveType}
              onClick={() => onEffectParamChange('tremoloType', waveType)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                zone?.effectParams.tremoloType === waveType
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {waveType}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Forma de onda del LFO
        </p>
      </div>

      {/* Wet */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Wet (Mezcla) ({Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={zone?.effectParams.wet ?? 0.5}
            onChange={(e) => onEffectParamChange('wet', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Mezcla entre señal seca y procesada
        </p>
      </div>
    </>
  );
}
