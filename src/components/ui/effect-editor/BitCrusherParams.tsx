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
    <div className="futuristic-param-container">
      <h4 className="futuristic-label mb-3">BIT_CRUSHER_PARAMETERS</h4>
      
      {/* Bits */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          BITS
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="16"
            step="1"
            value={zone?.effectParams.bits ?? 4}
            onChange={(e) => onEffectParamChange('bits', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {zone?.effectParams.bits ?? 4}BIT
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>1BIT</span>
          <span>16BIT</span>
        </div>
      </div>

      {/* NormFreq */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          NORM_FREQUENCY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.normFreq ?? 0.5}
            onChange={(e) => onEffectParamChange('normFreq', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((zone?.effectParams.normFreq ?? 0.5) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
