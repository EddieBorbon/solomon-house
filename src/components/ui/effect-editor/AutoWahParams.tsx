'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { InfoTooltip } from '../InfoTooltip';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AutoWahParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function AutoWahParams({ zone, onEffectParamChange }: AutoWahParamsProps) {
  const { t } = useLanguage();
  if (zone?.type !== 'autoWah') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        {t('effects.autoWahParameters')}
      </h4>

      {/* Sensitivity */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.sensitivity')}
          <InfoTooltip content={t('effects.tooltips.sensitivity')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.sensitivity ?? 0.5}
            onChange={(e) => onEffectParamChange('sensitivity', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Math.round((zone?.effectParams.sensitivity ?? 0.5) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Base Frequency */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.baseFrequency')}
          <InfoTooltip content={t('effects.tooltips.baseFrequency')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="20"
            max="20000"
            step="10"
            value={zone?.effectParams.frequency ?? 200}
            onChange={(e) => onEffectParamChange('frequency', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {zone?.effectParams.frequency ?? 200}HZ
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>20HZ</span>
          <span>20000HZ</span>
        </div>
      </div>

      {/* Octaves */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.octaves')}
          <InfoTooltip content={t('effects.tooltips.octaves')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="8"
            step="0.1"
            value={zone?.effectParams.octaves ?? 2}
            onChange={(e) => onEffectParamChange('octaves', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Number(zone?.effectParams.octaves ?? 2).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.1</span>
          <span>8.0</span>
        </div>
      </div>
    </div>
  );
}