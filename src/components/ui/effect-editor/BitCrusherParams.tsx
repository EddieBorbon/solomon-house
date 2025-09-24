'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface BitCrusherParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function BitCrusherParams({ zone, onEffectParamChange }: BitCrusherParamsProps) {
  if (zone?.type !== 'bitCrusher') return null;

  return (
    <>
      {/* Bits */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Bits
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="16"
            step="1"
            value={zone?.effectParams.bits ?? 4}
            onChange={(e) => onEffectParamChange('bits', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.bits ?? 4}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>16</span>
        </div>
      </div>

      {/* NormFreq */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Frecuencia Normalizada
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.normFreq ?? 0.5}
            onChange={(e) => onEffectParamChange('normFreq', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.normFreq ?? 0.5}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>1</span>
        </div>
      </div>
    </>
  );
}
