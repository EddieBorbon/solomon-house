'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';
import { FuturisticSlider } from '../FuturisticSlider';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MonoSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function MonoSynthParameters({
  selectedObject,
  onParamChange
}: MonoSynthParametersProps) {
  const { t } = useLanguage();
  if (selectedObject.type !== 'pyramid') return null;

  return (
    <>
      {/* Sección: Envolvente de Amplitud */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
        <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
          🔺 {t('effects.amplitudeEnvelope')}
        </h4>
        
        {/* Amp Attack */}
        <div className="mb-6">
          <FuturisticSlider
            label={t('parameterEditor.attack')}
            value={selectedObject.audioParams.ampAttack || 0.01}
            min={0.001}
            max={2}
            step={0.001}
            onChange={(value) => onParamChange('ampAttack', value)}
            unit="s"
            displayValue={(selectedObject.audioParams.ampAttack || 0.01).toFixed(3)}
            tooltip={t('parameterEditor.tooltips.attack')}
          />
        </div>

        {/* Amp Decay */}
        <div className="mb-6">
          <FuturisticSlider
            label={t('parameterEditor.decay')}
            value={selectedObject.audioParams.ampDecay || 0.2}
            min={0.01}
            max={2}
            step={0.01}
            onChange={(value) => onParamChange('ampDecay', value)}
            unit="s"
            displayValue={(selectedObject.audioParams.ampDecay || 0.2).toFixed(2)}
            tooltip={t('parameterEditor.tooltips.decay')}
          />
        </div>

        {/* Amp Sustain */}
        <div className="mb-6">
          <FuturisticSlider
            label={t('parameterEditor.sustain')}
            value={selectedObject.audioParams.ampSustain || 0.1}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => onParamChange('ampSustain', value)}
            unit="%"
            displayValue={Math.round((selectedObject.audioParams.ampSustain || 0.1) * 100)}
            tooltip={t('parameterEditor.tooltips.sustain')}
          />
        </div>

        {/* Amp Release */}
        <div className="mb-6">
          <FuturisticSlider
            label={t('parameterEditor.release')}
            value={selectedObject.audioParams.ampRelease || 0.5}
            min={0.01}
            max={4}
            step={0.01}
            onChange={(value) => onParamChange('ampRelease', value)}
            unit="s"
            displayValue={(selectedObject.audioParams.ampRelease || 0.5).toFixed(2)}
            tooltip={t('parameterEditor.tooltips.release')}
          />
        </div>
      </div>

      {/* Sección: Envolvente de Filtro */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
        <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
          🎛️ {t('effects.filterEnvelope')}
        </h4>
        
        {/* Filter Attack */}
        <div className="mb-6">
          <FuturisticSlider
            label={t('effects.filterAttack')}
            value={selectedObject.audioParams.filterAttack || 0.005}
            min={0.001}
            max={1}
            step={0.001}
            onChange={(value) => onParamChange('filterAttack', value)}
            unit="s"
            displayValue={(selectedObject.audioParams.filterAttack || 0.005).toFixed(3)}
            tooltip={t('parameterEditor.tooltips.attack')}
          />
        </div>

        {/* Filter Decay */}
        <div className="mb-6">
          <FuturisticSlider
            label={t('effects.filterDecay')}
            value={selectedObject.audioParams.filterDecay || 0.1}
            min={0.01}
            max={2}
            step={0.01}
            onChange={(value) => onParamChange('filterDecay', value)}
            unit="s"
            displayValue={(selectedObject.audioParams.filterDecay || 0.1).toFixed(2)}
            tooltip={t('parameterEditor.tooltips.decay')}
          />
        </div>

        {/* Filter Sustain */}
        <div className="mb-6">
          <FuturisticSlider
            label={t('effects.filterSustain')}
            value={selectedObject.audioParams.filterSustain || 0.05}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => onParamChange('filterSustain', value)}
            unit="%"
            displayValue={Math.round((selectedObject.audioParams.filterSustain || 0.05) * 100)}
            tooltip={t('parameterEditor.tooltips.sustain')}
          />
        </div>

        {/* Filter Release */}
        <div className="mb-6">
          <FuturisticSlider
            label={t('effects.filterRelease')}
            value={selectedObject.audioParams.filterRelease || 0.2}
            min={0.01}
            max={2}
            step={0.01}
            onChange={(value) => onParamChange('filterRelease', value)}
            unit="s"
            displayValue={(selectedObject.audioParams.filterRelease || 0.2).toFixed(2)}
            tooltip={t('parameterEditor.tooltips.release')}
          />
        </div>

        {/* Filter Base Frequency */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {t('effects.filterBaseFrequency')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="20"
              max="2000"
              step="1"
              value={selectedObject.audioParams.filterBaseFreq || 200}
              onChange={(e) => onParamChange('filterBaseFreq', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {selectedObject.audioParams.filterBaseFreq || 200}Hz
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>20 Hz</span>
            <span>2000 Hz</span>
          </div>
        </div>

        {/* Filter Octaves */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {t('effects.filterOctaves')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.1"
              value={selectedObject.audioParams.filterOctaves || 4}
              onChange={(e) => onParamChange('filterOctaves', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.filterOctaves || 4).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5</span>
            <span>8</span>
          </div>
        </div>

        {/* Filter Q (Resonancia) */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {t('effects.resonanceQ')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={selectedObject.audioParams.filterQ || 2}
              onChange={(e) => onParamChange('filterQ', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.filterQ || 2).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1</span>
            <span>10</span>
          </div>
        </div>
      </div>
    </>
  );
}
