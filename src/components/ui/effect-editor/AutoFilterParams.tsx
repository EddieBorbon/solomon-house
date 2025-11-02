'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { FuturisticSlider } from '../FuturisticSlider';
import { InfoTooltip } from '../InfoTooltip';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AutoFilterParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function AutoFilterParams({ zone, onEffectParamChange }: AutoFilterParamsProps) {
  const { t } = useLanguage();
  if (zone?.type !== 'autoFilter') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        {t('effects.autoFilterParameters')}
      </h4>
      
      {/* Depth */}
      <div className="mb-6">
        <FuturisticSlider
          label={t('effects.modulationDepth')}
          value={zone?.effectParams.depth ?? 0.5}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('depth', value)}
          disabled={zone?.isLocked}
          unit="%"
          displayValue={((zone?.effectParams.depth ?? 0.5) * 100).toFixed(0)}
          tooltip={t('effects.tooltips.modulationDepth')}
        />
      </div>

      {/* Filter Type */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.filterType')}
          <InfoTooltip content={t('effects.tooltips.filterType')} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['lowpass', 'highpass', 'bandpass', 'notch'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => onEffectParamChange('filterType', filterType)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors font-mono tracking-wider ${
                (zone?.effectParams.filterType ?? 'lowpass') === filterType
                  ? 'bg-white text-black'
                  : 'bg-black text-white border border-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {t(`effects.${filterType}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Q */}
      <div className="mb-6">
        <FuturisticSlider
          label={t('effects.resonanceQ')}
          value={zone?.effectParams.filterQ ?? 1}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(value) => onEffectParamChange('filterQ', value)}
          disabled={zone?.isLocked}
          displayValue={(zone?.effectParams.filterQ ?? 1).toFixed(1)}
          tooltip={t('effects.tooltips.resonanceQ')}
        />
      </div>

      {/* LFO Type */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.lfoType')}
          <InfoTooltip content={t('effects.tooltips.lfoType')} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((lfoType) => (
            <button
              key={lfoType}
              onClick={() => onEffectParamChange('lfoType', lfoType)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors font-mono tracking-wider ${
                (zone?.effectParams.lfoType ?? 'sine') === lfoType
                  ? 'bg-white text-black'
                  : 'bg-black text-white border border-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {t(`effects.${lfoType}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
