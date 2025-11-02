'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { InfoTooltip } from '../InfoTooltip';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ChebyshevParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function ChebyshevParams({ zone, onEffectParamChange }: ChebyshevParamsProps) {
  const { t } = useLanguage();
  if (zone?.type !== 'chebyshev') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        {t('effects.chebyshevParameters')}
      </h4>

      {/* Order */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.polynomialOrder')}
          <InfoTooltip content={t('effects.tooltips.polynomialOrder')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={zone?.effectParams.order ?? 2}
            onChange={(e) => onEffectParamChange('order', Number(e.target.value))}
            className="futuristic-slider flex-1"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {zone?.effectParams.order ?? 2}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>1</span>
          <span>50</span>
        </div>
      </div>

      {/* Oversample */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.oversampling')}
          <InfoTooltip content={t('effects.tooltips.oversampling')} />
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['none', '2x', '4x'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onEffectParamChange('oversample', type)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                (zone?.effectParams.oversample ?? 'none') === type
                  ? 'bg-white text-black'
                  : 'bg-black text-white border border-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <span className="uppercase">{t(`effects.${type}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}