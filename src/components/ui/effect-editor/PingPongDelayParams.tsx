'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface PingPongDelayParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function PingPongDelayParams({ zone, onEffectParamChange }: PingPongDelayParamsProps) {
  if (zone?.type !== 'pingPongDelay') return null;

  return (
    <>
      {/* Delay Time */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Tiempo de Delay
        </label>
        <div className="flex items-center gap-3">
          <select
            value={zone?.effectParams.pingPongDelayTime ?? '4n'}
            onChange={(e) => onEffectParamChange('pingPongDelayTime', e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-violet-500 focus:outline-none"
            disabled={zone?.isLocked}
          >
            <option value="1n">Nota completa (1n)</option>
            <option value="2n">Media nota (2n)</option>
            <option value="4n">Cuarto de nota (4n)</option>
            <option value="8n">Octavo de nota (8n)</option>
            <option value="16n">Dieciseisavo de nota (16n)</option>
            <option value="32n">Treinta y dosavo de nota (32n)</option>
          </select>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Tiempo entre ecos consecutivos
        </p>
      </div>

      {/* Feedback */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Feedback ({(zone?.effectParams.pingPongFeedback ?? 0.2) * 100}%)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.05"
            value={zone?.effectParams.pingPongFeedback ?? 0.2}
            onChange={(e) => onEffectParamChange('pingPongFeedback', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {Math.round((zone?.effectParams.pingPongFeedback ?? 0.2) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>90%</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Cantidad de señal que se retroalimenta
        </p>
      </div>

      {/* Max Delay */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Max Delay ({zone?.effectParams.maxDelay ?? 1.0}s)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={zone?.effectParams.maxDelay ?? 1.0}
            onChange={(e) => onEffectParamChange('maxDelay', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.maxDelay ?? 1.0}s
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.1s</span>
          <span>2.0s</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Tiempo máximo de delay en segundos
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
