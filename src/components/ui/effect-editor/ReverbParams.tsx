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
    <div className="futuristic-param-container">
      <h4 className="futuristic-label mb-3">REVERB_PARAMETERS</h4>
      
      {/* Decay */}
      <div className="mb-4">
        <label className="futuristic-label block mb-2">
          DECAY ({zone?.effectParams.decay ?? 1.5}S)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={zone?.effectParams.decay ?? 1.5}
            onChange={(e) => onEffectParamChange('decay', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right tracking-wider">
            {zone?.effectParams.decay ?? 1.5}S
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono tracking-wider">
          <span>0.1S</span>
          <span>10.0S</span>
        </div>
        <p className="futuristic-text mt-1">
          DURATION_OF_REVERBERATION
        </p>
      </div>

      {/* PreDelay */}
      <div className="mb-4">
        <label className="futuristic-label block mb-2">
          PRE_DELAY ({zone?.effectParams.preDelay ?? 0.01}S)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.001"
            value={zone?.effectParams.preDelay ?? 0.01}
            onChange={(e) => onEffectParamChange('preDelay', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right tracking-wider">
            {zone?.effectParams.preDelay ?? 0.01}S
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono tracking-wider">
          <span>0.000S</span>
          <span>0.100S</span>
        </div>
        <p className="futuristic-text mt-1">
          TIME_BEFORE_REVERB_ACTIVATION
        </p>
      </div>

      {/* Wet */}
      <div>
        <label className="futuristic-label block mb-2">
          WET_MIX ({Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={zone?.effectParams.wet ?? 0.5}
            onChange={(e) => onEffectParamChange('wet', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right tracking-wider">
            {Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono tracking-wider">
          <span>0%</span>
          <span>100%</span>
        </div>
        <p className="futuristic-text mt-1">
          DRY_SIGNAL_TO_PROCESSED_RATIO
        </p>
      </div>
    </div>
  );
}
