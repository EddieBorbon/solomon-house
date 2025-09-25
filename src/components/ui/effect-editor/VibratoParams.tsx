'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { FuturisticSlider } from '../FuturisticSlider';

interface VibratoParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function VibratoParams({ zone, onEffectParamChange }: VibratoParamsProps) {
  if (zone?.type !== 'vibrato') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        VIBRATO_PARAMETERS
      </h4>

      {/* Frequency */}
      <div className="mb-6">
        <FuturisticSlider
          label="FREQUENCY"
          value={Number(zone?.effectParams.vibratoFrequency) || 4}
          min={0.1}
          max={20}
          step={0.1}
          onChange={(value) => onEffectParamChange('vibratoFrequency', value)}
          disabled={zone?.isLocked}
          unit="HZ"
          displayValue={Number(zone?.effectParams.vibratoFrequency ?? 4).toFixed(1)}
        />
      </div>

      {/* Depth */}
      <div className="mb-6">
        <FuturisticSlider
          label="DEPTH"
          value={Number(zone?.effectParams.vibratoDepth) || 0.5}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('vibratoDepth', value)}
          disabled={zone?.isLocked}
          unit="%"
          displayValue={Math.round((zone?.effectParams.vibratoDepth ?? 0.5) * 100)}
        />
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
              onClick={() => onEffectParamChange('vibratoType', type)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                (zone?.effectParams.vibratoType ?? 'sine') === type
                  ? 'bg-white text-black'
                  : 'bg-black text-white border border-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <span className="uppercase">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Max Delay */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          MAX_DELAY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.005"
            max="0.1"
            step="0.001"
            value={zone?.effectParams.vibratoMaxDelay ?? 0.01}
            onChange={(e) => onEffectParamChange('vibratoMaxDelay', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Number(zone?.effectParams.vibratoMaxDelay ?? 0.01).toFixed(3)}S
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.005S</span>
          <span>0.100S</span>
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