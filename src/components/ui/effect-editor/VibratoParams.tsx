'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface VibratoParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function VibratoParams({ zone, onEffectParamChange }: VibratoParamsProps) {
  if (zone?.type !== 'vibrato') return null;

  return (
    <>
      {/* Frequency */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Frecuencia: {zone?.effectParams.vibratoFrequency ?? 5} Hz
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="20"
            step="0.1"
            value={zone?.effectParams.vibratoFrequency ?? 5}
            onChange={(e) => onEffectParamChange('vibratoFrequency', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.vibratoFrequency ?? 5} Hz
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.1 Hz</span>
          <span>20 Hz</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Velocidad de modulación del vibrato
        </p>
      </div>

      {/* Depth */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Profundidad: {Math.round((zone?.effectParams.vibratoDepth ?? 0.1) * 100)}%
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.vibratoDepth ?? 0.1}
            onChange={(e) => onEffectParamChange('vibratoDepth', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {Math.round((zone?.effectParams.vibratoDepth ?? 0.1) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Intensidad de la modulación de pitch
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
              onClick={() => onEffectParamChange('vibratoType', waveType)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                zone?.effectParams.vibratoType === waveType
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

      {/* Max Delay */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Max Delay: {(zone?.effectParams.vibratoMaxDelay ?? 0.005) * 1000} ms
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.001"
            max="0.02"
            step="0.001"
            value={zone?.effectParams.vibratoMaxDelay ?? 0.005}
            onChange={(e) => onEffectParamChange('vibratoMaxDelay', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {Math.round((zone?.effectParams.vibratoMaxDelay ?? 0.005) * 1000)} ms
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 ms</span>
          <span>20 ms</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Tiempo máximo de delay para el vibrato
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
