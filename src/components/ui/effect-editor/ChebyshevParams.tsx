'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface ChebyshevParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function ChebyshevParams({ zone, onEffectParamChange }: ChebyshevParamsProps) {
  if (zone?.type !== 'chebyshev') return null;

  return (
    <>
      {/* Order */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Orden del Polinomio
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={zone?.effectParams.order ?? 50}
            onChange={(e) => onEffectParamChange('order', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.order ?? 50}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>100</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Orden impar = distorsión armónica, Orden par = distorsión suave
        </p>
      </div>

      {/* Oversample */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Oversampling
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['none', '2x', '4x'] as const).map((oversampleType) => (
            <button
              key={oversampleType}
              onClick={() => onEffectParamChange('oversample', oversampleType)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                (zone?.effectParams.oversample ?? 'none') === oversampleType
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <span className="capitalize">{oversampleType}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Mayor oversampling = mejor calidad, más CPU
        </p>
      </div>
    </>
  );
}
