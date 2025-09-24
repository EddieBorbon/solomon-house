'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';

interface SynthSpecificParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function SynthSpecificParameters({
  selectedObject,
  onParamChange
}: SynthSpecificParametersProps) {
  return (
    <div className="futuristic-param-container">
      <h4 className="futuristic-label mb-4 text-white">SYNTH_PARAMETERS</h4>
      
      {/* Frecuencia - Para todos los objetos excepto spiral */}
      {selectedObject.type !== 'spiral' && (
        <div className="mb-4">
          <label className="futuristic-label block mb-2 text-white">
            {selectedObject.type === 'cone' ? 'FREQUENCY_TONE' : 'FREQUENCY_HZ'}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={selectedObject.type === 'cone' ? '20' : selectedObject.type === 'icosahedron' ? '50' : selectedObject.type === 'dodecahedronRing' ? '55' : '20'}
              max={selectedObject.type === 'cone' ? '200' : selectedObject.type === 'icosahedron' ? '1200' : selectedObject.type === 'dodecahedronRing' ? '880' : '2000'}
              step="1"
              value={selectedObject.audioParams.frequency}
              onChange={(e) => onParamChange('frequency', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
              {selectedObject.audioParams.frequency}
            </span>
          </div>
          <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
            <span>{selectedObject.type === 'cone' ? '20_HZ' : selectedObject.type === 'icosahedron' ? '50_HZ' : selectedObject.type === 'dodecahedronRing' ? '55_HZ_A1' : '20_HZ'}</span>
            <span>{selectedObject.type === 'cone' ? '200_HZ' : selectedObject.type === 'icosahedron' ? '1200_HZ' : selectedObject.type === 'dodecahedronRing' ? '880_HZ_A5' : '2000_HZ'}</span>
          </div>
          {selectedObject.type === 'dodecahedronRing' && (
            <p className="text-xs text-white mt-1 font-mono tracking-wider">
              FREQUENCY_BASE_TRANSPOSES_COMPLETE_CHORD
            </p>
          )}
        </div>
      )}

      {/* Forma de Onda (Portadora) - Para todos los objetos excepto spiral */}
      {selectedObject.type !== 'spiral' && (
        <div className="mb-4">
          <label className="futuristic-label block mb-2">
            WAVEFORM
          </label>
          <select
            value={selectedObject.audioParams.waveform}
            onChange={(e) => onParamChange('waveform', e.target.value as OscillatorType)}
            className="futuristic-select w-full p-2"
          >
            <option value="sine">SINE</option>
            <option value="square">SQUARE</option>
            <option value="sawtooth">SAWTOOTH</option>
            <option value="triangle">TRIANGLE</option>
          </select>
        </div>
      )}

      {/* Duración - Para todos los objetos excepto spiral */}
      {selectedObject.type !== 'spiral' && (
        <div className="mb-4">
          <label className="futuristic-label block mb-2">
            DURATION_SECONDS
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0.1"
              max="60"
              step="0.1"
              value={selectedObject.audioParams.duration === Infinity ? '' : (selectedObject.audioParams.duration || 1.0)}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  onParamChange('duration', Infinity);
                } else {
                  onParamChange('duration', Number(value));
                }
              }}
              placeholder="1.0"
              className="futuristic-input flex-1 p-2 font-mono"
            />

            <span className="text-white font-mono text-xs min-w-[3rem] text-right tracking-wider">
              {selectedObject.audioParams.duration === Infinity ? '∞' : `${(selectedObject.audioParams.duration || 1.0).toFixed(1)}S`}
            </span>
          </div>
          <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
            <span>0.1S</span>
            <span>60.0S</span>
          </div>
          <p className="text-xs text-white mt-1 font-mono tracking-wider">
            {selectedObject.audioParams.duration === Infinity 
              ? 'CONTINUOUS_AUDIO_USE_BUTTON_TO_CONTROL'
              : 'FINITE_DURATION_AUTO_STOP'
            }
          </p>
        </div>
      )}

      {/* Controles específicos para MembraneSynth (cono) */}
      {selectedObject.type === 'cone' && (
        <>
          {/* Pitch Decay */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Pitch Decay (Caída de Tono)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={selectedObject.audioParams.pitchDecay || 0.05}
                onChange={(e) => onParamChange('pitchDecay', Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                {(selectedObject.audioParams.pitchDecay || 0.05).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.01</span>
              <span>0.5</span>
            </div>
          </div>

          {/* Octaves */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Octaves (Impacto)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.1"
                value={selectedObject.audioParams.octaves || 10}
                onChange={(e) => onParamChange('octaves', Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                {(selectedObject.audioParams.octaves || 10).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5</span>
              <span>20</span>
            </div>
          </div>
        </>
      )}

      {/* Controles específicos para AMSynth (cubo) */}
      {selectedObject.type === 'cube' && (
        <>
          {/* Harmonicity */}
          <div className="mb-4">
            <label className="futuristic-label block mb-2">
              HARMONICITY
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={selectedObject.audioParams.harmonicity || 1.5}
                onChange={(e) => onParamChange('harmonicity', Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {selectedObject.audioParams.harmonicity || 1.5}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0.1</span>
              <span>10.0</span>
            </div>
          </div>

          {/* Forma de Onda (Moduladora) */}
          <div className="mb-4">
            <label className="futuristic-label block mb-2">
              MODULATION_WAVEFORM
            </label>
            <select
              value={selectedObject.audioParams.modulationWaveform || 'square'}
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

      {/* Volumen - Movido al final */}
      <div>
        <label className="futuristic-label block mb-2">
          VOLUME
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(selectedObject.audioParams.volume * 100)}
            onChange={(e) => {
              const percentage = Number(e.target.value);
              const actualValue = percentage / 100; // Convertir de 0-100 a 0-1
              onParamChange('volume', actualValue);
            }}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {Math.round(selectedObject.audioParams.volume * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
