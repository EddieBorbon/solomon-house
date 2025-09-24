'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

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
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          FREQUENCY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={zone?.effectParams.frequency ?? 0.5}
            onChange={(e) => onEffectParamChange('frequency', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(zone?.effectParams.frequency ?? 0.5).toFixed(1)}HZ
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.1HZ</span>
          <span>10.0HZ</span>
        </div>
      </div>

      {/* Octaves */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          OCTAVES
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={zone?.effectParams.octaves ?? 3}
            onChange={(e) => onEffectParamChange('octaves', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(zone?.effectParams.octaves ?? 3).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>1.0</span>
          <span>10.0</span>
        </div>
      </div>

      {/* Stages */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          STAGES
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={zone?.effectParams.stages ?? 10}
            onChange={(e) => onEffectParamChange('stages', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {zone?.effectParams.stages ?? 10}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>1</span>
          <span>20</span>
        </div>
      </div>

      {/* Q Factor */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          Q_FACTOR
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="30"
            step="0.1"
            value={zone?.effectParams.Q ?? 10}
            onChange={(e) => onEffectParamChange('Q', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(zone?.effectParams.Q ?? 10).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.1</span>
          <span>30.0</span>
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
