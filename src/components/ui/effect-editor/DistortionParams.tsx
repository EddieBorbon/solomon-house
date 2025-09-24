'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface DistortionParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function DistortionParams({ zone, onEffectParamChange }: DistortionParamsProps) {
  if (zone?.type !== 'distortion') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        DISTORTION_PARAMETERS
      </h4>

      {/* Distortion Amount */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          DISTORTION_AMOUNT
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.distortion ?? 0.4}
            onChange={(e) => onEffectParamChange('distortion', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Math.round((zone?.effectParams.distortion ?? 0.4) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Oversampling */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          OVERSAMPLING
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['none', '2x', '4x'].map((type) => (
            <button
              key={type}
              onClick={() => onEffectParamChange('distortionOversample', type)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                (zone?.effectParams.distortionOversample ?? 'none') === type
                  ? 'bg-white text-black'
                  : 'bg-black text-white border border-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <span className="uppercase">{type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}