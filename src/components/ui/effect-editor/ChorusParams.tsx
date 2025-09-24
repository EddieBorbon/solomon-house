'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface ChorusParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function ChorusParams({ zone, onEffectParamChange }: ChorusParamsProps) {
  if (zone?.type !== 'chorus') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        CHORUS_PARAMETERS
      </h4>

      {/* LFO Frequency */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          LFO_FREQUENCY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={zone?.effectParams.chorusFrequency ?? 1}
            onChange={(e) => onEffectParamChange('chorusFrequency', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(zone?.effectParams.chorusFrequency ?? 1).toFixed(1)}HZ
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.1HZ</span>
          <span>10.0HZ</span>
        </div>
      </div>

      {/* Delay Time */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          DELAY_TIME
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={zone?.effectParams.chorusDelayTime ?? 0.3}
            onChange={(e) => onEffectParamChange('chorusDelayTime', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(zone?.effectParams.chorusDelayTime ?? 0.3).toFixed(2)}S
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.10S</span>
          <span>1.00S</span>
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
            value={zone?.effectParams.chorusDepth ?? 0.5}
            onChange={(e) => onEffectParamChange('chorusDepth', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Math.round((zone?.effectParams.chorusDepth ?? 0.5) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Feedback */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          FEEDBACK
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.feedback ?? 0.2}
            onChange={(e) => onEffectParamChange('feedback', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Math.round((zone?.effectParams.feedback ?? 0.2) * 100)}%
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
            value={zone?.effectParams.spread ?? 0}
            onChange={(e) => onEffectParamChange('spread', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {zone?.effectParams.spread ?? 0}°
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0°</span>
          <span>180°</span>
        </div>
      </div>

      {/* LFO Type */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          LFO_TYPE
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['sine', 'square', 'triangle', 'sawtooth'].map((type) => (
            <button
              key={type}
              onClick={() => onEffectParamChange('chorusType', type)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                (zone?.effectParams.chorusType ?? 'sine') === type
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