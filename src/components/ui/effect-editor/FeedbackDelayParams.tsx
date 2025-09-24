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
    <>
      {/* Delay Time */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Tiempo de Delay
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={typeof zone?.effectParams.delayTime === 'number' ? zone?.effectParams.delayTime : 0.25}
            onChange={(e) => onEffectParamChange('delayTime', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {typeof zone?.effectParams.delayTime === 'number' ? zone?.effectParams.delayTime : '8n'}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0 s</span>
          <span>1 s</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Retraso en segundos (puedes usar también valores musicales como '8n')
        </p>
      </div>

      {/* Feedback */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Feedback
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="0.95"
            step="0.01"
            value={zone?.effectParams.feedback ?? 0.5}
            onChange={(e) => onEffectParamChange('feedback', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.feedback ?? 0.5}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>0.95</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Proporción de señal realimentada
        </p>
      </div>
    </>
  );
}
