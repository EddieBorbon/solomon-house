'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface FeedbackDelayParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function FeedbackDelayParams({ zone, onEffectParamChange }: FeedbackDelayParamsProps) {
  if (zone?.type !== 'feedbackDelay') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        FEEDBACK_DELAY_PARAMETERS
      </h4>

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
            value={zone?.effectParams.delayTime ?? 0.3}
            onChange={(e) => onEffectParamChange('delayTime', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(Number(zone?.effectParams.delayTime) || 0.3).toFixed(2)}S
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.10S</span>
          <span>1.00S</span>
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
    </div>
  );
}