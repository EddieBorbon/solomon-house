'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';
import { InfoTooltip } from '../../InfoTooltip';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface PluckSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

/**
 * Componente especializado para parámetros específicos de PluckSynth
 * Responsabilidad única: Manejar parámetros específicos del PluckSynth (torus)
 */
export function PluckSynthParameters({
  selectedObject,
  onParamChange
}: PluckSynthParametersProps) {
  const { t } = useLanguage();
  
  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        PLUCK_SYNTH_PARAMETERS
      </h4>

      {/* Attack Noise */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          ATTACK_NOISE
          <InfoTooltip content={t('parameterEditor.tooltips.attackNoise')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="20"
            step="0.1"
            value={selectedObject.audioParams.attackNoise || 1}
            onChange={(e) => onParamChange('attackNoise', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.attackNoise || 1).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.1</span>
          <span>20</span>
        </div>
      </div>

      {/* Dampening */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          DAMPENING
          <InfoTooltip content={t('parameterEditor.tooltips.dampening')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="7000"
            step="100"
            value={selectedObject.audioParams.dampening || 4000}
            onChange={(e) => onParamChange('dampening', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {selectedObject.audioParams.dampening || 4000}Hz
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0 Hz</span>
          <span>7000 Hz</span>
        </div>
      </div>

      {/* Resonance */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          RESONANCE
          <InfoTooltip content={t('parameterEditor.tooltips.resonance')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={selectedObject.audioParams.resonance || 0.7}
            onChange={(e) => onParamChange('resonance', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.resonance || 0.7).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0</span>
          <span>1.0</span>
        </div>
      </div>

      {/* Release */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          RELEASE
          <InfoTooltip content={t('parameterEditor.tooltips.release')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.01"
            max="2"
            step="0.01"
            value={selectedObject.audioParams.release || 1}
            onChange={(e) => onParamChange('release', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.release || 1).toFixed(2)}s
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.01s</span>
          <span>2s</span>
        </div>
      </div>
    </div>
  );
}
