'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface ChorusParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function ChorusParams({ zone, onEffectParamChange }: ChorusParamsProps) {
  if (zone?.type !== 'chorus') return null;

  return (
    <>
      {/* Frecuencia del LFO */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Frecuencia del LFO (Hz)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={zone?.effectParams.chorusFrequency ?? 1.5}
            onChange={(e) => onEffectParamChange('chorusFrequency', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.chorusFrequency ?? 1.5}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.1 Hz</span>
          <span>10 Hz</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Velocidad de modulación del efecto
        </p>
      </div>

      {/* Tiempo de Delay */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Tiempo de Delay (ms)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="2"
            max="20"
            step="0.1"
            value={zone?.effectParams.delayTime ?? 3.5}
            onChange={(e) => onEffectParamChange('delayTime', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.delayTime ?? 3.5}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>2 ms</span>
          <span>20 ms</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Tiempo base del delay del chorus
        </p>
      </div>

      {/* Profundidad */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Profundidad
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.chorusDepth ?? 0.7}
            onChange={(e) => onEffectParamChange('chorusDepth', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.chorusDepth ?? 0.7}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>1</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Intensidad de la modulación del delay
        </p>
      </div>

      {/* Feedback */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Feedback
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.01"
            value={zone?.effectParams.feedback ?? 0}
            onChange={(e) => onEffectParamChange('feedback', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.feedback ?? 0}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>0.9</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Cantidad de retroalimentación (0 = chorus, mayor a 0 = flanger)
        </p>
      </div>

      {/* Spread */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Spread Estéreo (grados)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="180"
            step="1"
            value={zone?.effectParams.spread ?? 180}
            onChange={(e) => onEffectParamChange('spread', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.spread ?? 180}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0°</span>
          <span>180°</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          0° = central, 180° = estéreo completo
        </p>
      </div>

      {/* Tipo de LFO */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Tipo de LFO
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((lfoType) => (
            <button
              key={lfoType}
              onClick={() => onEffectParamChange('chorusType', lfoType)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                (zone?.effectParams.chorusType ?? 'sine') === lfoType
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <span className="capitalize">{lfoType}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Forma de onda del LFO para la modulación
        </p>
      </div>
    </>
  );
}
