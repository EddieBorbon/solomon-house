'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface FreeverbParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function FreeverbParams({ zone, onEffectParamChange }: FreeverbParamsProps) {
  if (zone?.type !== 'freeverb') return null;

  return (
    <>
      {/* Room Size */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Room Size
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.roomSize ?? 0.7}
            onChange={(e) => onEffectParamChange('roomSize', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.roomSize ?? 0.7}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>1</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          0 = sala pequeña, 1 = sala grande (más decay)
        </p>
      </div>

      {/* Dampening */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Dampening (Hz)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="500"
            max="8000"
            step="10"
            value={zone?.effectParams.dampening ?? 3000}
            onChange={(e) => onEffectParamChange('dampening', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.dampening ?? 3000}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>500 Hz</span>
          <span>8 kHz</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Filtro lowpass interno del reverb
        </p>
      </div>
    </>
  );
}
