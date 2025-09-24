'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface ReverbParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function ReverbParams({ zone, onEffectParamChange }: ReverbParamsProps) {
  if (zone?.type !== 'reverb') return null;

  return (
    <>
      {/* Decay */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Decay ({zone?.effectParams.decay ?? 1.5}s)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={zone?.effectParams.decay ?? 1.5}
            onChange={(e) => onEffectParamChange('decay', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.decay ?? 1.5}s
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.1s</span>
          <span>10s</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Duración de la reverberación
        </p>
      </div>

      {/* PreDelay */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          PreDelay ({zone?.effectParams.preDelay ?? 0.01}s)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.001"
            value={zone?.effectParams.preDelay ?? 0.01}
            onChange={(e) => onEffectParamChange('preDelay', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.preDelay ?? 0.01}s
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0s</span>
          <span>0.1s</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Tiempo antes de que la reverberación se active completamente
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
