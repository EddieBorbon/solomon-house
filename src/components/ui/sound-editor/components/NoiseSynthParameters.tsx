'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';

interface NoiseSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

/**
 * Componente especializado para parámetros específicos de NoiseSynth
 * Responsabilidad única: Manejar parámetros específicos del NoiseSynth (plane)
 */
export function NoiseSynthParameters({
  selectedObject,
  onParamChange
}: NoiseSynthParametersProps) {
  
  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        NOISE_SYNTH_PARAMETERS
      </h4>

      {/* Noise Type */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          NOISE_TYPE
        </label>
        <select
          value={selectedObject.audioParams.noiseType || 'white'}
          onChange={(e) => onParamChange('noiseType', e.target.value as 'white' | 'pink' | 'brown')}
          className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-full h-6 focus:outline-none focus:border-gray-400"
        >
          <option value="white">WHITE_NOISE</option>
          <option value="pink">PINK_NOISE</option>
          <option value="brown">BROWN_NOISE</option>
        </select>
      </div>

      {/* Attack */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          ATTACK
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.001"
            max="1"
            step="0.001"
            value={selectedObject.audioParams.attack || 0.001}
            onChange={(e) => onParamChange('attack', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.attack || 0.001).toFixed(3)}s
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.001s</span>
          <span>1.000s</span>
        </div>
      </div>

      {/* Decay */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          DECAY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.01"
            max="2"
            step="0.01"
            value={selectedObject.audioParams.decay || 0.1}
            onChange={(e) => onParamChange('decay', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.decay || 0.1).toFixed(2)}s
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.01s</span>
          <span>2.00s</span>
        </div>
      </div>

      {/* Sustain */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          SUSTAIN
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={selectedObject.audioParams.sustain || 0}
            onChange={(e) => onParamChange('sustain', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.sustain || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0</span>
          <span>1.0</span>
        </div>
      </div>
    </div>
  );
}
