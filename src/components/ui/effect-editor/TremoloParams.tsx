'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface TremoloParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function TremoloParams({ zone, onEffectParamChange }: TremoloParamsProps) {
  if (zone?.type !== 'tremolo') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        TREMOLO_PARAMETERS
      </h4>

      {/* Frequency */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          FREQUENCY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="20"
            step="0.1"
            value={zone?.effectParams.tremoloFrequency ?? 4}
            onChange={(e) => onEffectParamChange('tremoloFrequency', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(zone?.effectParams.tremoloFrequency ?? 4).toFixed(1)}HZ
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.1HZ</span>
          <span>20.0HZ</span>
        </div>
      </div>

      {/* Depth */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          DEPTH
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.tremoloDepth ?? 0.5}
            onChange={(e) => onEffectParamChange('tremoloDepth', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Math.round((zone?.effectParams.tremoloDepth ?? 0.5) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Spread */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          SPREAD
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="180"
            step="1"
            value={zone?.effectParams.tremoloSpread ?? 0}
            onChange={(e) => onEffectParamChange('tremoloSpread', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {zone?.effectParams.tremoloSpread ?? 0}°
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0°</span>
          <span>180°</span>
        </div>
      </div>

      {/* Wave Type */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          WAVE_TYPE
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['sine', 'square', 'triangle', 'sawtooth'].map((type) => (
            <button
              key={type}
              onClick={() => onEffectParamChange('tremoloType', type)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                (zone?.effectParams.tremoloType ?? 'sine') === type
                  ? 'bg-white text-black'
                  : 'bg-black text-white border border-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <span className="uppercase">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Wet Mix */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          WET_MIX
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.wet ?? 0.5}
            onChange={(e) => onEffectParamChange('wet', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%
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