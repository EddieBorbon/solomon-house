'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { FuturisticSlider } from '../FuturisticSlider';

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
      <div className="mb-6">
        <FuturisticSlider
          label="DELAY_TIME"
          value={Number(zone?.effectParams.delayTime) ?? 0.3}
          min={0.1}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('delayTime', value)}
          disabled={zone?.isLocked}
          unit="S"
          displayValue={(Number(zone?.effectParams.delayTime) || 0.3).toFixed(2)}
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
    </div>
  );
}