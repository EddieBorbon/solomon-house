'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';

interface MembraneSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

/**
 * Componente especializado para parámetros específicos de MembraneSynth
 * Responsabilidad única: Manejar parámetros específicos del MembraneSynth (cone)
 */
export function MembraneSynthParameters({
  selectedObject,
  onParamChange
}: MembraneSynthParametersProps) {
  
  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        MEMBRANE_SYNTH_PARAMETERS
      </h4>

      {/* Pitch Decay */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          PITCH_DECAY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={selectedObject.audioParams.pitchDecay || 0.05}
            onChange={(e) => onParamChange('pitchDecay', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.pitchDecay || 0.05).toFixed(3)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.001</span>
          <span>0.100</span>
        </div>
      </div>

      {/* Octaves */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          OCTAVES
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={selectedObject.audioParams.octaves || 10}
            onChange={(e) => onParamChange('octaves', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.octaves || 10).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>1</span>
          <span>20</span>
        </div>
      </div>
    </div>
  );
}
