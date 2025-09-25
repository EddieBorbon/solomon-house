'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { FuturisticSlider } from '../FuturisticSlider';

interface StereoWidenerParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function StereoWidenerParams({ zone, onEffectParamChange }: StereoWidenerParamsProps) {
  if (zone?.type !== 'stereoWidener') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        STEREO_WIDENER_PARAMETERS
      </h4>

      {/* Width */}
      <div className="mb-6">
        <FuturisticSlider
          label="STEREO_WIDTH"
          value={Number(zone?.effectParams.width) || 1}
          min={0}
          max={2}
          step={0.01}
          onChange={(value) => onEffectParamChange('width', value)}
          disabled={zone?.isLocked}
          displayValue={Number(zone?.effectParams.width ?? 1).toFixed(2)}
        />
      </div>

      {/* Wet Mix */}
      <div className="mb-6">
        <FuturisticSlider
          label="WET_MIX"
          value={Number(zone?.effectParams.wet) || 0.5}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('wet', value)}
          disabled={zone?.isLocked}
          unit="%"
          displayValue={Math.round((zone?.effectParams.wet ?? 0.5) * 100)}
        />
      </div>
    </div>
  );
}