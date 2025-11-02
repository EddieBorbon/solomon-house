'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';
import { InfoTooltip } from '../../InfoTooltip';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface MonoSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

/**
 * Componente especializado para parámetros específicos de MonoSynth
 * Responsabilidad única: Manejar parámetros específicos del MonoSynth (pyramid)
 */
export function MonoSynthParameters({
  selectedObject,
  onParamChange
}: MonoSynthParametersProps) {
  const { t } = useLanguage();
  
  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        MONO_SYNTH_PARAMETERS
      </h4>

      {/* Filter Base Frequency */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          FILTER_BASE_FREQ
          <InfoTooltip content={t('parameterEditor.tooltips.filterBaseFreq')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="50"
            max="2000"
            step="10"
            value={selectedObject.audioParams.filterBaseFreq || 200}
            onChange={(e) => onParamChange('filterBaseFreq', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {selectedObject.audioParams.filterBaseFreq || 200}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>50 Hz</span>
          <span>2000 Hz</span>
        </div>
      </div>

      {/* Filter Octaves */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          FILTER_OCTAVES
          <InfoTooltip content={t('parameterEditor.tooltips.filterOctaves')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="8"
            step="0.5"
            value={selectedObject.audioParams.filterOctaves || 4}
            onChange={(e) => onParamChange('filterOctaves', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.filterOctaves || 4).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>1</span>
          <span>8</span>
        </div>
      </div>

      {/* Filter Q */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          FILTER_Q
          <InfoTooltip content={t('parameterEditor.tooltips.filterQ')} />
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
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.filterQ || 2).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.1</span>
          <span>10.0</span>
        </div>
      </div>
    </div>
  );
}
