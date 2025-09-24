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
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        REVERB_PARAMETERS
      </h4>

      {/* Decay */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          DECAY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={zone?.effectParams.decay ?? 1.5}
            onChange={(e) => onEffectParamChange('decay', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(zone?.effectParams.decay ?? 1.5).toFixed(1)}S
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.0S</span>
          <span>20.0S</span>
        </div>
      </div>

      {/* Pre Delay */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          PRE_DELAY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.preDelay ?? 0.01}
            onChange={(e) => onEffectParamChange('preDelay', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(zone?.effectParams.preDelay ?? 0.01).toFixed(2)}S
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.00S</span>
          <span>1.00S</span>
        </div>
      </div>
    </div>
  );
}