'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { FuturisticSlider } from '../FuturisticSlider';

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
      <div className="mb-6">
        <FuturisticSlider
          label="DECAY"
          value={zone?.effectParams.decay ?? 1.5}
          min={0}
          max={20}
          step={0.1}
          onChange={(value) => onEffectParamChange('decay', value)}
          disabled={zone?.isLocked}
          unit="S"
          displayValue={Number(zone?.effectParams.decay ?? 1.5).toFixed(1)}
        />
      </div>

      {/* Pre Delay */}
      <div className="mb-6">
        <FuturisticSlider
          label="PRE_DELAY"
          value={zone?.effectParams.preDelay ?? 0.01}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('preDelay', value)}
          disabled={zone?.isLocked}
          unit="S"
          displayValue={Number(zone?.effectParams.preDelay ?? 0.01).toFixed(2)}
        />
      </div>
    </div>
  );
}