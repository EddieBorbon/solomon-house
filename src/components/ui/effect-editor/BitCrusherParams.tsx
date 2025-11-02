'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { InfoTooltip } from '../InfoTooltip';
import { useLanguage } from '../../../contexts/LanguageContext';

interface BitCrusherParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function BitCrusherParams({ zone, onEffectParamChange }: BitCrusherParamsProps) {
  const { t } = useLanguage();
  if (zone?.type !== 'bitCrusher') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        {t('effects.bitCrusherParameters')}
      </h4>
      
      {/* Bits */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.bits')}
          <InfoTooltip content={t('effects.tooltips.bits')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="16"
            step="1"
            value={zone?.effectParams.bits ?? 4}
            onChange={(e) => onEffectParamChange('bits', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {zone?.effectParams.bits ?? 4}BIT
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>1BIT</span>
          <span>16BIT</span>
        </div>
      </div>

      {/* NormFreq */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.frecuenciaNormalizada')}
          <InfoTooltip content={t('effects.tooltips.frecuenciaNormalizada')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.normFreq ?? 0.5}
            onChange={(e) => onEffectParamChange('normFreq', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((zone?.effectParams.normFreq ?? 0.5) * 100).toFixed(0)}%
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
