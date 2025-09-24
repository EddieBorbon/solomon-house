'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';

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
        <label className="futuristic-label block mb-1 text-white text-xs">
          ATTACK_NOISE
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="20"
            step="0.1"
            value={(selectedObject.audioParams as any).attackNoise || 1}
            onChange={(e) => onParamChange('attackNoise' as keyof AudioParams, Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((selectedObject.audioParams as any).attackNoise || 1).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.1</span>
          <span>20</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_NOISE_AMPLITUDE_AT_ATTACK
        </p>
      </div>

      {/* Dampening */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          DAMPENING
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="500"
            max="7000"
            step="100"
            value={(selectedObject.audioParams as any).dampening || 4000}
            onChange={(e) => onParamChange('dampening' as keyof AudioParams, Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams as any).dampening || 4000}Hz
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>500 Hz</span>
          <span>7000 Hz</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_FREQUENCY_DAMPENING_FILTER
        </p>
      </div>

      {/* Resonance */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          RESONANCE
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="20"
            step="0.1"
            value={(selectedObject.audioParams as any).resonance || 0.7}
            onChange={(e) => onParamChange('resonance' as keyof AudioParams, Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((selectedObject.audioParams as any).resonance || 0.7).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.1</span>
          <span>20</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_RESONANCE_QUALITY_FILTER
        </p>
      </div>

      {/* Release */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          RELEASE
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.01"
            max="2"
            step="0.01"
            value={(selectedObject.audioParams as any).release || 1}
            onChange={(e) => onParamChange('release' as keyof AudioParams, Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((selectedObject.audioParams as any).release || 1).toFixed(2)}s
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.01s</span>
          <span>2s</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_RELEASE_TIME_ENVELOPE
        </p>
      </div>
    </div>
  );
}
