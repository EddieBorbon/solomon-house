'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';

interface AdvancedSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function AdvancedSynthParameters({
  selectedObject,
  onParamChange
}: AdvancedSynthParametersProps) {
  return (
    <div className="futuristic-param-container">
      

      {/* Controles específicos para DuoSynth (cilindro) */}
      {selectedObject.type === 'cylinder' && (
        <>
          {/* Harmonicity (Desafinación) */}
          <div>
            <label className="futuristic-label block mb-2 text-white">
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
              <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                {selectedObject.audioParams.harmonicity || 1.5}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0.5</span>
              <span>4</span>
            </div>
          </div>

          {/* Velocidad de Vibrato */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Velocidad de Vibrato
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
              <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                {selectedObject.audioParams.vibratoRate || 5}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 Hz</span>
              <span>20 Hz</span>
            </div>
          </div>

          {/* Cantidad de Vibrato */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Cantidad de Vibrato
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
              <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                {Math.round((selectedObject.audioParams.vibratoAmount || 0.2) * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Forma de Onda (Voz 1) */}
          <div>
            <label className="futuristic-label block mb-2 text-white">
              MODULATION_WAVEFORM
            </label>
            <select
              value={selectedObject.audioParams.waveform}
              onChange={(e) => onParamChange('waveform', e.target.value as OscillatorType)}
              className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-full h-6 focus:outline-none focus:border-gray-400"
            >
              <option value="sine">SINE</option>
              <option value="square">SQUARE</option>
              <option value="sawtooth">SAWTOOTH</option>
              <option value="triangle">TRIANGLE</option>
            </select>
          </div>

          {/* Forma de Onda (Voz 2) */}
          <div>
            <label className="futuristic-label block mb-2 text-white">
              MODULATION_WAVEFORM
            </label>
            <select
              value={selectedObject.audioParams.waveform2 || 'sine'}
              onChange={(e) => onParamChange('waveform2', e.target.value as OscillatorType)}
              className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-full h-6 focus:outline-none focus:border-gray-400"
            >
              <option value="sine">SINE</option>
              <option value="square">SQUARE</option>
              <option value="sawtooth">SAWTOOTH</option>
              <option value="triangle">TRIANGLE</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
