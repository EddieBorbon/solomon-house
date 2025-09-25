'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { FuturisticSlider } from '../FuturisticSlider';

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
      <div className="mb-6">
        <FuturisticSlider
          label="LFO_FREQUENCY"
          value={zone?.effectParams.chorusFrequency ?? 1}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(value) => onEffectParamChange('chorusFrequency', value)}
          disabled={zone?.isLocked}
          unit="HZ"
          displayValue={(zone?.effectParams.chorusFrequency ?? 1).toFixed(1)}
        />
      </div>

      {/* Delay Time */}
      <div className="mb-6">
        <FuturisticSlider
          label="DELAY_TIME"
          value={zone?.effectParams.chorusDelayTime ?? 0.3}
          min={0.1}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('chorusDelayTime', value)}
          disabled={zone?.isLocked}
          unit="S"
          displayValue={(zone?.effectParams.chorusDelayTime ?? 0.3).toFixed(2)}
        />
      </div>

      {/* Depth */}
      <div className="mb-6">
        <FuturisticSlider
          label="DEPTH"
          value={zone?.effectParams.chorusDepth ?? 0.5}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('chorusDepth', value)}
          disabled={zone?.isLocked}
          unit="%"
          displayValue={Math.round((zone?.effectParams.chorusDepth ?? 0.5) * 100)}
        />
      </div>

      {/* Feedback */}
      <div className="mb-6">
        <FuturisticSlider
          label="FEEDBACK"
          value={zone?.effectParams.feedback ?? 0.2}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('feedback', value)}
          disabled={zone?.isLocked}
          unit="%"
          displayValue={Math.round((zone?.effectParams.feedback ?? 0.2) * 100)}
        />
      </div>

      {/* Spread */}
      <div className="mb-6">
        <FuturisticSlider
          label="SPREAD"
          value={zone?.effectParams.spread ?? 0}
          min={0}
          max={180}
          step={1}
          onChange={(value) => onEffectParamChange('spread', value)}
          disabled={zone?.isLocked}
          unit="°"
          displayValue={zone?.effectParams.spread ?? 0}
        />
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