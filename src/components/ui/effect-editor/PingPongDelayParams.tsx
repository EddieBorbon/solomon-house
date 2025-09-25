'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { FuturisticSlider } from '../FuturisticSlider';

interface PingPongDelayParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function PingPongDelayParams({ zone, onEffectParamChange }: PingPongDelayParamsProps) {
  if (zone?.type !== 'pingPongDelay') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        PING_PONG_DELAY_PARAMETERS
      </h4>

      {/* Delay Time */}
      <div className="mb-6">
        <FuturisticSlider
          label="DELAY_TIME"
          value={Number(zone?.effectParams.pingPongDelayTime) || 0.3}
          min={0.1}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('pingPongDelayTime', value)}
          disabled={zone?.isLocked}
          unit="S"
          displayValue={Number(zone?.effectParams.pingPongDelayTime ?? 0.3).toFixed(2)}
        />
      </div>

      {/* Feedback */}
      <div className="mb-6">
        <FuturisticSlider
          label="FEEDBACK"
          value={Number(zone?.effectParams.pingPongFeedback) || 0.2}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('pingPongFeedback', value)}
          disabled={zone?.isLocked}
          unit="%"
          displayValue={Math.round((zone?.effectParams.pingPongFeedback ?? 0.2) * 100)}
        />
      </div>

      {/* Max Delay */}
      <div className="mb-6">
        <FuturisticSlider
          label="MAX_DELAY"
          value={Number(zone?.effectParams.maxDelay) || 1}
          min={0.1}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('maxDelay', value)}
          disabled={zone?.isLocked}
          unit="S"
          displayValue={Number(zone?.effectParams.maxDelay ?? 1).toFixed(2)}
        />
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
            value={zone?.effectParams.wet ?? 0.3}
            onChange={(e) => onEffectParamChange('wet', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Math.round((zone?.effectParams.wet ?? 0.3) * 100)}%
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