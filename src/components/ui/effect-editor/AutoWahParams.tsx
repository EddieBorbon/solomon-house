'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface AutoWahParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function AutoWahParams({ zone, onEffectParamChange }: AutoWahParamsProps) {
  if (zone?.type !== 'autoWah') return null;

  return (
    <>
      {/* Sensitivity */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Sensibilidad
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.sensitivity ?? 0.5}
            onChange={(e) => onEffectParamChange('sensitivity', Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.sensitivity ?? 0.5}
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
