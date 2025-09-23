'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface EffectBasicParametersProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function EffectBasicParameters({
  zone,
  onEffectParamChange
}: EffectBasicParametersProps) {
  return (
    <div className="space-y-4">
      {/* Frecuencia de modulación */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Frecuencia de Modulación (Hz)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={zone?.effectParams.frequency ?? 1}
            onChange={(e) => onEffectParamChange('frequency', Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-sm min-w-[4rem] text-right">
            {zone?.effectParams.frequency ?? 1}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.1 Hz</span>
          <span>10 Hz</span>
        </div>
      </div>

      {/* Octavas */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Octavas
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="8"
            step="0.1"
            value={zone?.effectParams.octaves ?? 2}
            onChange={(e) => onEffectParamChange('octaves', Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-sm min-w-[4rem] text-right">
            {zone?.effectParams.octaves ?? 2}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.1</span>
          <span>8</span>
        </div>
      </div>

      {/* Frecuencia base */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Frecuencia Base (Hz)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="20"
            max="20000"
            step="10"
            value={zone?.effectParams.frequency ?? 200}
            onChange={(e) => onEffectParamChange('frequency', Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-sm min-w-[4rem] text-right">
            {zone?.effectParams.frequency ?? 200}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>20 Hz</span>
          <span>20 kHz</span>
        </div>
      </div>
    </div>
  );
}
