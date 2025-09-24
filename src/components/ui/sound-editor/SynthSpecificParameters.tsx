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
    <div className="relative border border-white p-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-4 text-white text-center">SYNTH_PARAMETERS</h4>
      
      {/* Frecuencia - Para todos los objetos excepto spiral */}
      {selectedObject.type !== 'spiral' && (
        <div className="mb-4">
          <label className="futuristic-label block mb-1 text-white text-xs">
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

      {/* Formas de Onda y Duración - Para todos los objetos excepto spiral */}
      {selectedObject.type !== 'spiral' && (
        <div className="mb-4">
          <div className="flex gap-3">
            {/* WAVEFORM */}
            <div className="flex-1">
              <label className="futuristic-label block mb-1 text-white text-xs">
                WAVEFORM
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

            {/* MODULATION_WAVEFORM - Para AMSynth (cubo) y FMSynth (esfera) */}
            {(selectedObject.type === 'cube' || selectedObject.type === 'sphere') && (
              <div className="flex-1">
                <label className="futuristic-label block mb-1 text-white text-xs">
                  MODULATION
                </label>
                <select
                  value={selectedObject.audioParams.modulationWaveform || (selectedObject.type === 'cube' ? 'square' : 'sine')}
                  onChange={(e) => onParamChange('modulationWaveform', e.target.value as OscillatorType)}
                  className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-full h-6 focus:outline-none focus:border-gray-400"
                >
                  <option value="sine">SINE</option>
                  <option value="square">SQUARE</option>
                  <option value="sawtooth">SAWTOOTH</option>
                  <option value="triangle">TRIANGLE</option>
                </select>
              </div>
            )}

            {/* DURATION_SECONDS */}
            <div className="flex-1">
              <label className="futuristic-label block mb-1 text-white text-xs">
                DURATION
              </label>
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
                className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-full h-6 focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>
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
                className="futuristic-slider flex-1"
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
                className="futuristic-slider flex-1"
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
            <label className="futuristic-label block mb-1 text-white text-xs">
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

        </>
      )}

      {/* Controles específicos para FMSynth (esfera) */}
      {selectedObject.type === 'sphere' && (
        <>
          {/* Harmonicity */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
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
            <label className="futuristic-label block mb-1 text-white text-xs">
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

        </>
      )}

      {/* Volumen - Movido al final */}
      <div>
        <label className="futuristic-label block mb-1 text-white text-xs">
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
