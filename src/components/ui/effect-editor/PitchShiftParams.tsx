'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface PitchShiftParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function PitchShiftParams({ zone, onEffectParamChange }: PitchShiftParamsProps) {
  if (zone?.type !== 'pitchShift') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        PITCH_SHIFT_PARAMETERS
      </h4>

      {/* Pitch Shift */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          PITCH_SHIFT
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="-12"
            max="12"
            step="0.1"
            value={zone?.effectParams.pitchShift ?? 0}
            onChange={(e) => onEffectParamChange('pitchShift', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(zone?.effectParams.pitchShift ?? 0).toFixed(1)}ST
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>-12.0ST</span>
          <span>12.0ST</span>
        </div>
      </div>

      {/* Window Size */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          WINDOW_SIZE
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.01"
            max="0.1"
            step="0.001"
            value={zone?.effectParams.windowSize ?? 0.02}
            onChange={(e) => onEffectParamChange('windowSize', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(zone?.effectParams.windowSize ?? 0.02).toFixed(3)}S
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.010S</span>
          <span>0.100S</span>
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
            min="0"
            max="0.1"
            step="0.001"
            value={zone?.effectParams.delayTime ?? 0}
            onChange={(e) => onEffectParamChange('delayTime', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(Number(zone?.effectParams.delayTime) || 0).toFixed(3)}S
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.000S</span>
          <span>0.100S</span>
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
            value={zone?.effectParams.feedback ?? 0}
            onChange={(e) => onEffectParamChange('feedback', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Math.round((zone?.effectParams.feedback ?? 0) * 100)}%
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