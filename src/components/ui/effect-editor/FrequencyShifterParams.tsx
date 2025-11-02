'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { InfoTooltip } from '../InfoTooltip';
import { useLanguage } from '../../../contexts/LanguageContext';

interface FrequencyShifterParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function FrequencyShifterParams({ zone, onEffectParamChange }: FrequencyShifterParamsProps) {
  const { t } = useLanguage();
  if (zone?.type !== 'frequencyShifter') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        {t('effects.frequencyShifterParameters')}
      </h4>

      {/* Frequency Shift */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.frequencyShift')}
          <InfoTooltip content={t('effects.tooltips.frequency')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="-2000"
            max="2000"
            step="1"
            value={zone?.effectParams.frequency ?? 0}
            onChange={(e) => onEffectParamChange('frequency', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {zone?.effectParams.frequency ?? 0}HZ
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>-2000HZ</span>
          <span>2000HZ</span>
        </div>
      </div>
    </div>
  );
}