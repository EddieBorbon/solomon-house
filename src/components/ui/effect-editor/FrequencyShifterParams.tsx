'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface FrequencyShifterParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function FrequencyShifterParams({ zone, onEffectParamChange }: FrequencyShifterParamsProps) {
  if (zone?.type !== 'frequencyShifter') return null;

  return (
    <>
      {/* Frequency Shift */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Frecuencia de Shift (Hz)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="-2000"
            max="2000"
            step="1"
            value={zone?.effectParams.frequency ?? 0}
            onChange={(e) => onEffectParamChange('frequency', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.frequency ?? 0}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>-2000 Hz</span>
          <span>2000 Hz</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Desplaza todas las frecuencias por un valor fijo
        </p>
      </div>
    </>
  );
}
