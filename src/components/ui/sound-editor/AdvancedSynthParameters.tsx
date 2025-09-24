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
      <h4 className="futuristic-label mb-4">ADVANCED_SYNTH_PARAMETERS</h4>
      
      {/* Controles específicos para FMSynth (esfera) */}
      {selectedObject.type === 'sphere' && (
        <>
          {/* Harmonicity */}
          <div className="mb-4">
            <label className="futuristic-label block mb-2">
              HARMONICITY
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.01"
                value={selectedObject.audioParams.harmonicity || 2}
                onChange={(e) => onParamChange('harmonicity', Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {selectedObject.audioParams.harmonicity || 2}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0.5</span>
              <span>8.0</span>
            </div>
          </div>

          {/* Modulation Index (Timbre) */}
          <div className="mb-4">
            <label className="futuristic-label block mb-2">
              MODULATION_INDEX_TIMBRE
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="40"
                step="0.1"
                value={selectedObject.audioParams.modulationIndex || 10}
                onChange={(e) => onParamChange('modulationIndex', Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {selectedObject.audioParams.modulationIndex || 10}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>1.0</span>
              <span>40.0</span>
            </div>
          </div>

          {/* Forma de Onda (Moduladora) */}
          <div className="mb-4">
            <label className="futuristic-label block mb-2">
              MODULATION_WAVEFORM
            </label>
            <select
              value={selectedObject.audioParams.modulationWaveform || 'sine'}
              onChange={(e) => onParamChange('modulationWaveform', e.target.value as OscillatorType)}
              className="futuristic-select w-full p-2"
            >
              <option value="sine">SINE</option>
              <option value="square">SQUARE</option>
              <option value="sawtooth">SAWTOOTH</option>
              <option value="triangle">TRIANGLE</option>
            </select>
          </div>
        </>
      )}

      {/* Controles específicos para DuoSynth (cilindro) */}
      {selectedObject.type === 'cylinder' && (
        <>
          {/* Harmonicity (Desafinación) */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Harmonicity (Desafinación)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.01"
                value={selectedObject.audioParams.harmonicity || 1.5}
                onChange={(e) => onParamChange('harmonicity', Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                {selectedObject.audioParams.harmonicity || 1.5}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
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
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
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
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
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
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Forma de Onda (Voz 1)
            </label>
            <select
              value={selectedObject.audioParams.waveform}
              onChange={(e) => onParamChange('waveform', e.target.value as OscillatorType)}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="sine">Seno</option>
              <option value="square">Cuadrada</option>
              <option value="sawtooth">Sierra</option>
              <option value="triangle">Triangular</option>
            </select>
          </div>

          {/* Forma de Onda (Voz 2) */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Forma de Onda (Voz 2)
            </label>
            <select
              value={selectedObject.audioParams.waveform2 || 'sine'}
              onChange={(e) => onParamChange('waveform2', e.target.value as OscillatorType)}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="sine">Seno</option>
              <option value="square">Cuadrada</option>
              <option value="sawtooth">Sierra</option>
              <option value="triangle">Triangular</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
