'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface StereoWidenerParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function StereoWidenerParams({ zone, onEffectParamChange }: StereoWidenerParamsProps) {
  if (zone?.type !== 'stereoWidener') return null;

  return (
    <>
      {/* Width */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Width (Ancho Estéreo): {Math.round((zone?.effectParams.width ?? 0.5) * 100)}%
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={zone?.effectParams.width ?? 0.5}
            onChange={(e) => onEffectParamChange('width', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {Math.round((zone?.effectParams.width ?? 0.5) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0% (Mono)</span>
          <span>100% (Estéreo)</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Ancho del campo estéreo (0 = mono, 0.5 = sin cambio, 1 = estéreo máximo)
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
