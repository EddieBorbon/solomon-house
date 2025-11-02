'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';
import { InfoTooltip } from '../../InfoTooltip';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface DuoSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

/**
 * Componente especializado para parámetros específicos de DuoSynth
 * Responsabilidad única: Manejar parámetros específicos del DuoSynth (cylinder)
 */
export function DuoSynthParameters({
  selectedObject,
  onParamChange
}: DuoSynthParametersProps) {
  const { t } = useLanguage();
  
  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        DUO_SYNTH_PARAMETERS
      </h4>

      {/* Harmonicity */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          HARMONICITY
          <InfoTooltip content={t('parameterEditor.tooltips.harmonicity')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.01"
            value={selectedObject.audioParams.harmonicity || 1.5}
            onChange={(e) => onParamChange('harmonicity', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {selectedObject.audioParams.harmonicity || 1.5}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.5</span>
          <span>4</span>
        </div>
      </div>

      {/* Velocidad de Vibrato */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          VIBRATO_RATE
          <InfoTooltip content={t('parameterEditor.tooltips.vibratoRate')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="20"
            step="0.1"
            value={selectedObject.audioParams.vibratoRate || 5}
            onChange={(e) => onParamChange('vibratoRate', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {selectedObject.audioParams.vibratoRate || 5}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>1 Hz</span>
          <span>20 Hz</span>
        </div>
      </div>

      {/* Cantidad de Vibrato */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          VIBRATO_AMOUNT
          <InfoTooltip content={t('parameterEditor.tooltips.vibratoAmount')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={selectedObject.audioParams.vibratoAmount || 0.2}
            onChange={(e) => onParamChange('vibratoAmount', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Math.round((selectedObject.audioParams.vibratoAmount || 0.2) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Attack */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
          ATTACK
          <InfoTooltip content={t('parameterEditor.tooltips.attack')} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.001"
            max="2"
            step="0.001"
            value={selectedObject.audioParams.attack || 0.01}
            onChange={(e) => onParamChange('attack', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.attack || 0.01).toFixed(3)}s
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.001s</span>
          <span>2s</span>
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
            max="4"
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
          <span>4s</span>
        </div>
      </div>
    </div>
  );
}
