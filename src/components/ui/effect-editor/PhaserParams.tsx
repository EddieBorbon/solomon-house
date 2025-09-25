'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { FuturisticSlider } from '../FuturisticSlider';

interface PhaserParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function PhaserParams({ zone, onEffectParamChange }: PhaserParamsProps) {
  if (zone?.type !== 'phaser') return null;

  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        PHASER_PARAMETERS
      </h4>

      {/* Frequency */}
      <div className="mb-6">
        <FuturisticSlider
          label="FREQUENCY"
          value={zone?.effectParams.frequency ?? 0.5}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(value) => onEffectParamChange('frequency', value)}
          disabled={zone?.isLocked}
          unit="HZ"
          displayValue={Number(zone?.effectParams.frequency ?? 0.5).toFixed(1)}
        />
      </div>

      {/* Octaves */}
      <div className="mb-6">
        <FuturisticSlider
          label="OCTAVES"
          value={zone?.effectParams.octaves ?? 3}
          min={1}
          max={10}
          step={0.5}
          onChange={(value) => onEffectParamChange('octaves', value)}
          disabled={zone?.isLocked}
          displayValue={Number(zone?.effectParams.octaves ?? 3).toFixed(1)}
        />
      </div>

      {/* Stages */}
      <div className="mb-6">
        <FuturisticSlider
          label="STAGES"
          value={zone?.effectParams.stages ?? 10}
          min={1}
          max={20}
          step={1}
          onChange={(value) => onEffectParamChange('stages', value)}
          disabled={zone?.isLocked}
          displayValue={zone?.effectParams.stages ?? 10}
        />
      </div>

      {/* Q Factor */}
      <div className="mb-6">
        <FuturisticSlider
          label="Q_FACTOR"
          value={zone?.effectParams.Q ?? 10}
          min={0.1}
          max={30}
          step={0.1}
          onChange={(value) => onEffectParamChange('Q', value)}
          disabled={zone?.isLocked}
          displayValue={Number(zone?.effectParams.Q ?? 10).toFixed(1)}
        />
      </div>

      {/* Wet Mix */}
      <div className="mb-6">
        <FuturisticSlider
          label="WET_MIX"
          value={zone?.effectParams.wet ?? 0.5}
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
