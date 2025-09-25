'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';

interface FMSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

/**
 * Componente especializado para parámetros específicos de FMSynth
 * Responsabilidad única: Manejar parámetros específicos del FMSynth (sphere)
 */
export function FMSynthParameters({
  selectedObject,
  onParamChange
}: FMSynthParametersProps) {
  
  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        FM_SYNTH_PARAMETERS
      </h4>

      {/* Harmonicity */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          HARMONICITY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={selectedObject.audioParams.harmonicity || 2}
            onChange={(e) => onParamChange('harmonicity', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.harmonicity || 2).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.1</span>
          <span>10.0</span>
        </div>
      </div>

      {/* Modulation Index */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          MODULATION_INDEX
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="50"
            step="0.5"
            value={selectedObject.audioParams.modulationIndex || 10}
            onChange={(e) => onParamChange('modulationIndex', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.modulationIndex || 10).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0</span>
          <span>50</span>
        </div>
      </div>
    </div>
  );
}
