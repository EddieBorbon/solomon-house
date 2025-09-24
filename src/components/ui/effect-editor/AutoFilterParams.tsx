'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface AutoFilterParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function AutoFilterParams({ zone, onEffectParamChange }: AutoFilterParamsProps) {
  if (zone?.type !== 'autoFilter') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        AUTO_FILTER_PARAMETERS
      </h4>
      
      {/* Depth */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          MODULATION_DEPTH
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.depth ?? 0.5}
            onChange={(e) => onEffectParamChange('depth', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((zone?.effectParams.depth ?? 0.5) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Filter Type */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          FILTER_TYPE
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['lowpass', 'highpass', 'bandpass', 'notch'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => onEffectParamChange('filterType', filterType)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors font-mono tracking-wider ${
                (zone?.effectParams.filterType ?? 'lowpass') === filterType
                  ? 'bg-white text-black'
                  : 'bg-black text-white border border-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {filterType.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Q */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          RESONANCE_Q
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={zone?.effectParams.filterQ ?? 1}
            onChange={(e) => onEffectParamChange('filterQ', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(zone?.effectParams.filterQ ?? 1).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.1</span>
          <span>10.0</span>
        </div>
      </div>

      {/* LFO Type */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          LFO_TYPE
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((lfoType) => (
            <button
              key={lfoType}
              onClick={() => onEffectParamChange('lfoType', lfoType)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors font-mono tracking-wider ${
                (zone?.effectParams.lfoType ?? 'sine') === lfoType
                  ? 'bg-white text-black'
                  : 'bg-black text-white border border-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {lfoType.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
