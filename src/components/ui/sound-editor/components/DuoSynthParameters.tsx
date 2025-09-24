'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';

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
        <label className="futuristic-label block mb-1 text-white text-xs">
          HARMONICITY
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
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_FREQUENCY_RATIO_BETWEEN_VOICES
        </p>
      </div>

      {/* Velocidad de Vibrato */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          VIBRATO_RATE
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
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_VIBRATO_FREQUENCY_SPEED
        </p>
      </div>

      {/* Cantidad de Vibrato */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          VIBRATO_AMOUNT
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
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_VIBRATO_DEPTH_INTENSITY
        </p>
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
            max="2"
            step="0.001"
            value={(selectedObject.audioParams as any).attack || 0.01}
            onChange={(e) => onParamChange('attack' as keyof AudioParams, Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((selectedObject.audioParams as any).attack || 0.01).toFixed(3)}s
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.001s</span>
          <span>2s</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_ATTACK_TIME_ENVELOPE
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
            max="4"
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
          <span>4s</span>
        </div>
        <p className="text-xs text-white mt-1 font-mono tracking-wider">
          CONTROLS_RELEASE_TIME_ENVELOPE
        </p>
      </div>
    </div>
  );
}
