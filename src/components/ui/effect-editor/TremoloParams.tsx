'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { FuturisticSlider } from '../FuturisticSlider';
import { InfoTooltip } from '../InfoTooltip';
import { useLanguage } from '../../../contexts/LanguageContext';

interface TremoloParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function TremoloParams({ zone, onEffectParamChange }: TremoloParamsProps) {
  const { t } = useLanguage();
  if (zone?.type !== 'tremolo') return null;

  return (
    <div className="relative border border-white p-4 mb-8">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        {t('effects.tremoloParameters')}
      </h4>

      {/* Frequency */}
      <div className="mb-6">
        <FuturisticSlider
          label={t('effects.frequency')}
          value={Number(zone?.effectParams.tremoloFrequency) || 4}
          min={0.1}
          max={20}
          step={0.1}
          onChange={(value) => onEffectParamChange('tremoloFrequency', value)}
          disabled={zone?.isLocked}
          unit="HZ"
          displayValue={Number(zone?.effectParams.tremoloFrequency ?? 4).toFixed(1)}
          tooltip={t('effects.tooltips.frequency')}
        />
      </div>

      {/* Depth */}
      <div className="mb-6">
        <FuturisticSlider
          label={t('effects.depth')}
          value={Number(zone?.effectParams.tremoloDepth) || 0.5}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => onEffectParamChange('tremoloDepth', value)}
          disabled={zone?.isLocked}
          unit="%"
          displayValue={Math.round((zone?.effectParams.tremoloDepth ?? 0.5) * 100)}
          tooltip={t('effects.tooltips.depth')}
        />
      </div>

      {/* Spread */}
      <div className="mb-6">
        <FuturisticSlider
          label={t('effects.spread')}
          value={Number(zone?.effectParams.tremoloSpread) || 0}
          min={0}
          max={180}
          step={1}
          onChange={(value) => onEffectParamChange('tremoloSpread', value)}
          disabled={zone?.isLocked}
          unit="°"
          displayValue={zone?.effectParams.tremoloSpread ?? 0}
          tooltip={t('effects.tooltips.spread')}
        />
      </div>

      {/* Wave Type */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.waveType')}
          <InfoTooltip content={t('effects.tooltips.waveType')} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['sine', 'square', 'triangle', 'sawtooth'].map((type) => (
            <button
              key={type}
              onClick={() => onEffectParamChange('tremoloType', type)}
              disabled={zone?.isLocked}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                (zone?.effectParams.tremoloType ?? 'sine') === type
                  ? 'bg-white text-black'
                  : 'bg-black text-white border border-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <span className="uppercase">{t(`effects.${type}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Wet Mix */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          {t('effects.wetMix')}
          <InfoTooltip content={t('effects.tooltips.wetMix')} />
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