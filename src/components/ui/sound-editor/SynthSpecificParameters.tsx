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
      
      {/* Volumen - Siempre en primer lugar */}
      <div className="mb-4">
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
      
      {/* Frecuencia - Para todos los objetos excepto spiral */}
      {selectedObject.type !== 'spiral' && (
        <div className="mb-4">
          <label className="futuristic-label block mb-1 text-white text-xs">
            {selectedObject.type === 'cone' ? 'FREQUENCY_TONE' : 'FREQUENCY_HZ'}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={selectedObject.type === 'cone' ? '20' : selectedObject.type === 'icosahedron' ? '50' : selectedObject.type === 'dodecahedronRing' ? '55' : selectedObject.type === 'torus' ? '20' : '20'}
              max={selectedObject.type === 'cone' ? '200' : selectedObject.type === 'icosahedron' ? '1200' : selectedObject.type === 'dodecahedronRing' ? '880' : selectedObject.type === 'torus' ? '440' : '2000'}
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
            <span>{selectedObject.type === 'cone' ? '20_HZ' : selectedObject.type === 'icosahedron' ? '50_HZ' : selectedObject.type === 'dodecahedronRing' ? '55_HZ_A1' : selectedObject.type === 'torus' ? '20_HZ' : '20_HZ'}</span>
            <span>{selectedObject.type === 'cone' ? '200_HZ' : selectedObject.type === 'icosahedron' ? '1200_HZ' : selectedObject.type === 'dodecahedronRing' ? '880_HZ_A5' : selectedObject.type === 'torus' ? '440_HZ' : '2000_HZ'}</span>
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

            {/* MODULATION - Para AMSynth (cubo), FMSynth (esfera) y DuoSynth (cilindro) */}
            {(selectedObject.type === 'cube' || selectedObject.type === 'sphere' || selectedObject.type === 'cylinder') && (
              <div className="flex-1">
                <label className="futuristic-label block mb-1 text-white text-xs">
                  MODULATION
                </label>
                <select
                  value={
                    selectedObject.type === 'cylinder' 
                      ? (selectedObject.audioParams.waveform2 || 'sine')
                      : (selectedObject.audioParams.modulationWaveform || (selectedObject.type === 'cube' ? 'square' : 'sine'))
                  }
                  onChange={(e) => {
                    if (selectedObject.type === 'cylinder') {
                      onParamChange('waveform2', e.target.value as OscillatorType);
                    } else {
                      onParamChange('modulationWaveform', e.target.value as OscillatorType);
                    }
                  }}
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
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
              PITCH_DECAY
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
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {(selectedObject.audioParams.pitchDecay || 0.05).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0.01</span>
              <span>0.5</span>
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
                min="0.5"
                max="20"
                step="0.1"
                value={selectedObject.audioParams.octaves || 10}
                onChange={(e) => onParamChange('octaves', Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {(selectedObject.audioParams.octaves || 10).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
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

      {/* Controles específicos para DuoSynth (cilindro) */}
      {selectedObject.type === 'cylinder' && (
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
          </div>

        </>
      )}

      {/* Controles específicos para MonoSynth (pirámide) */}
      {selectedObject.type === 'pyramid' && (
        <>
          {/* Envolvente de Amplitud */}
          <div className="mb-4">
            <h5 className="futuristic-label block mb-2 text-white text-xs">
              AMPLITUDE_ENVELOPE
            </h5>
            
            {/* Attack */}
            <div className="mb-3">
              <label className="futuristic-label block mb-1 text-white text-xs">
                ATTACK
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.001"
                  max="2"
                  step="0.001"
                  value={selectedObject.audioParams.ampAttack || 0.01}
                  onChange={(e) => onParamChange('ampAttack', Number(e.target.value))}
                  className="futuristic-slider flex-1"
                />
                <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                  {(selectedObject.audioParams.ampAttack || 0.01).toFixed(3)}s
                </span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
                <span>0.001s</span>
                <span>2s</span>
              </div>
            </div>

            {/* Decay */}
            <div className="mb-3">
              <label className="futuristic-label block mb-1 text-white text-xs">
                DECAY
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.01"
                  max="2"
                  step="0.01"
                  value={selectedObject.audioParams.ampDecay || 0.2}
                  onChange={(e) => onParamChange('ampDecay', Number(e.target.value))}
                  className="futuristic-slider flex-1"
                />
                <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                  {(selectedObject.audioParams.ampDecay || 0.2).toFixed(2)}s
                </span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
                <span>0.01s</span>
                <span>2s</span>
              </div>
            </div>

            {/* Sustain */}
            <div className="mb-3">
              <label className="futuristic-label block mb-1 text-white text-xs">
                SUSTAIN
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectedObject.audioParams.ampSustain || 0.1}
                  onChange={(e) => onParamChange('ampSustain', Number(e.target.value))}
                  className="futuristic-slider flex-1"
                />
                <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                  {Math.round((selectedObject.audioParams.ampSustain || 0.1) * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
                <span>0%</span>
                <span>100%</span>
              </div>
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
                  value={selectedObject.audioParams.ampRelease || 0.5}
                  onChange={(e) => onParamChange('ampRelease', Number(e.target.value))}
                  className="futuristic-slider flex-1"
                />
                <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                  {(selectedObject.audioParams.ampRelease || 0.5).toFixed(2)}s
                </span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
                <span>0.01s</span>
                <span>4s</span>
              </div>
            </div>
          </div>

          {/* Envolvente de Filtro */}
          <div className="mb-4">
            <h5 className="futuristic-label block mb-2 text-white text-xs">
              FILTER_ENVELOPE
            </h5>
            
            {/* Filter Attack */}
            <div className="mb-3">
              <label className="futuristic-label block mb-1 text-white text-xs">
                FILTER_ATTACK
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.001"
                  max="1"
                  step="0.001"
                  value={selectedObject.audioParams.filterAttack || 0.005}
                  onChange={(e) => onParamChange('filterAttack', Number(e.target.value))}
                  className="futuristic-slider flex-1"
                />
                <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                  {(selectedObject.audioParams.filterAttack || 0.005).toFixed(3)}s
                </span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
                <span>0.001s</span>
                <span>1s</span>
              </div>
            </div>

            {/* Filter Decay */}
            <div className="mb-3">
              <label className="futuristic-label block mb-1 text-white text-xs">
                FILTER_DECAY
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.01"
                  max="2"
                  step="0.01"
                  value={selectedObject.audioParams.filterDecay || 0.1}
                  onChange={(e) => onParamChange('filterDecay', Number(e.target.value))}
                  className="futuristic-slider flex-1"
                />
                <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                  {(selectedObject.audioParams.filterDecay || 0.1).toFixed(2)}s
                </span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
                <span>0.01s</span>
                <span>2s</span>
              </div>
            </div>

            {/* Filter Sustain */}
            <div className="mb-3">
              <label className="futuristic-label block mb-1 text-white text-xs">
                FILTER_SUSTAIN
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectedObject.audioParams.filterSustain || 0.05}
                  onChange={(e) => onParamChange('filterSustain', Number(e.target.value))}
                  className="futuristic-slider flex-1"
                />
                <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                  {Math.round((selectedObject.audioParams.filterSustain || 0.05) * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Filter Release */}
            <div className="mb-3">
              <label className="futuristic-label block mb-1 text-white text-xs">
                FILTER_RELEASE
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.01"
                  max="2"
                  step="0.01"
                  value={selectedObject.audioParams.filterRelease || 0.2}
                  onChange={(e) => onParamChange('filterRelease', Number(e.target.value))}
                  className="futuristic-slider flex-1"
                />
                <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                  {(selectedObject.audioParams.filterRelease || 0.2).toFixed(2)}s
                </span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
                <span>0.01s</span>
                <span>2s</span>
              </div>
            </div>

            {/* Filter Base Frequency */}
            <div className="mb-3">
              <label className="futuristic-label block mb-1 text-white text-xs">
                FILTER_BASE_FREQ
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="2000"
                  step="1"
                  value={selectedObject.audioParams.filterBaseFreq || 200}
                  onChange={(e) => onParamChange('filterBaseFreq', Number(e.target.value))}
                  className="futuristic-slider flex-1"
                />
                <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                  {selectedObject.audioParams.filterBaseFreq || 200}Hz
                </span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
                <span>20 Hz</span>
                <span>2000 Hz</span>
              </div>
            </div>

            {/* Filter Octaves */}
            <div className="mb-3">
              <label className="futuristic-label block mb-1 text-white text-xs">
                FILTER_OCTAVES
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.1"
                  value={selectedObject.audioParams.filterOctaves || 4}
                  onChange={(e) => onParamChange('filterOctaves', Number(e.target.value))}
                  className="futuristic-slider flex-1"
                />
                <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                  {(selectedObject.audioParams.filterOctaves || 4).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
                <span>0.5</span>
                <span>8</span>
              </div>
            </div>

            {/* Filter Q */}
            <div className="mb-4">
              <label className="futuristic-label block mb-1 text-white text-xs">
                FILTER_Q
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={selectedObject.audioParams.filterQ || 2}
                  onChange={(e) => onParamChange('filterQ', Number(e.target.value))}
                  className="futuristic-slider flex-1"
                />
                <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                  {(selectedObject.audioParams.filterQ || 2).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
                <span>0.1</span>
                <span>10</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Controles específicos para MetalSynth (icosaedro) */}
      {selectedObject.type === 'icosahedron' && (
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
                value={selectedObject.audioParams.harmonicity || 5.1}
                onChange={(e) => onParamChange('harmonicity', Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {(selectedObject.audioParams.harmonicity || 5.1).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0.1</span>
              <span>10</span>
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
                min="1"
                max="100"
                step="1"
                value={selectedObject.audioParams.modulationIndex || 32}
                onChange={(e) => onParamChange('modulationIndex', Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {selectedObject.audioParams.modulationIndex || 32}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>1</span>
              <span>100</span>
            </div>
          </div>

          {/* Modulation Envelope */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
              MODULATION_ENVELOPE
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.01"
                max="2"
                step="0.01"
                value={(selectedObject.audioParams as any).modulationEnvelope || 0.01}
                onChange={(e) => onParamChange('modulationEnvelope' as keyof AudioParams, Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {((selectedObject.audioParams as any).modulationEnvelope || 0.01).toFixed(2)}s
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0.01s</span>
              <span>2s</span>
            </div>
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
                value={(selectedObject.audioParams as any).resonance || 4000}
                onChange={(e) => onParamChange('resonance' as keyof AudioParams, Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {(selectedObject.audioParams as any).resonance || 4000}Hz
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0.1 Hz</span>
              <span>20 Hz</span>
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
                min="0.5"
                max="8"
                step="0.1"
                value={selectedObject.audioParams.octaves || 2.5}
                onChange={(e) => onParamChange('octaves', Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {(selectedObject.audioParams.octaves || 2.5).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0.5</span>
              <span>8</span>
            </div>
          </div>
        </>
      )}

      {/* Controles específicos para NoiseSynth (plano) */}
      {selectedObject.type === 'plane' && (
        <>
          {/* Tipo de Ruido */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
              NOISE_TYPE
            </label>
            <select
              value={(selectedObject.audioParams as any).noiseType || 'white'}
              onChange={(e) => onParamChange('noiseType' as keyof AudioParams, e.target.value)}
              className="w-full p-2 bg-black text-white border border-white focus:border-white focus:outline-none transition-colors font-mono text-xs"
            >
              <option value="white">WHITE (COMPLETE_NOISE)</option>
              <option value="pink">PINK (SOFT_NOISE)</option>
              <option value="brown">BROWN (LOW_NOISE)</option>
            </select>
          </div>

          {/* Duración del Golpe */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
              HIT_DURATION
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={selectedObject.audioParams.duration || 0.1}
                onChange={(e) => onParamChange('duration', Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {(selectedObject.audioParams.duration || 0.1).toFixed(2)}s
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0.01s</span>
              <span>1s</span>
            </div>
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
              <span>1s</span>
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
                max="1"
                step="0.01"
                value={(selectedObject.audioParams as any).decay || 0.1}
                onChange={(e) => onParamChange('decay' as keyof AudioParams, Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {((selectedObject.audioParams as any).decay || 0.1).toFixed(2)}s
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0.01s</span>
              <span>1s</span>
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
                value={(selectedObject.audioParams as any).sustain || 0.1}
                onChange={(e) => onParamChange('sustain' as keyof AudioParams, Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {Math.round(((selectedObject.audioParams as any).sustain || 0.1) * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0%</span>
              <span>100%</span>
            </div>
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
                value={(selectedObject.audioParams as any).release || 0.2}
                onChange={(e) => onParamChange('release' as keyof AudioParams, Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {((selectedObject.audioParams as any).release || 0.2).toFixed(2)}s
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0.01s</span>
              <span>2s</span>
            </div>
          </div>
        </>
      )}

      {/* Controles específicos para PluckSynth (torus) */}
      {selectedObject.type === 'torus' && (
        <>
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
          </div>
        </>
      )}

      {/* Controles específicos para PolySynth (dodecahedronRing) */}
      {selectedObject.type === 'dodecahedronRing' && (
        <>
          {/* Polifonía */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
              POLYPHONY
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={(selectedObject.audioParams as any).polyphony || 4}
                onChange={(e) => onParamChange('polyphony' as keyof AudioParams, Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {(selectedObject.audioParams as any).polyphony || 4}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>1</span>
              <span>8</span>
            </div>
          </div>

          {/* Tipo de Acorde */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
              CHORD_TYPE
            </label>
            <select
              value={JSON.stringify((selectedObject.audioParams as any).chord || ["C4", "E4", "G4"])}
              onChange={(e) => {
                const chordMap: { [key: string]: string[] } = {
                  '["C4","E4","G4"]': ["C4", "E4", "G4"], // Mayor
                  '["C4","Eb4","G4"]': ["C4", "Eb4", "G4"], // Menor
                  '["C4","E4","G4","B4"]': ["C4", "E4", "G4", "B4"], // Mayor 7
                  '["C4","Eb4","G4","Bb4"]': ["C4", "Eb4", "G4", "Bb4"], // Menor 7
                  '["C4","E4","G4","B4","D5"]': ["C4", "E4", "G4", "B4", "D5"], // Mayor 9
                  '["C4","Eb4","G4","Bb4","D5"]': ["C4", "Eb4", "G4", "Bb4", "D5"], // Menor 9
                  '["C4","E4","G#4","B4"]': ["C4", "E4", "G#4", "B4"], // Mayor 7 (#5)
                  '["C4","Eb4","G4","Bb4","Db5"]': ["C4", "Eb4", "G4", "Bb4", "Db5"], // Menor 9 (b5)
                };
                const chord = chordMap[e.target.value] || ["C4", "E4", "G4"];
                onParamChange('chord' as keyof AudioParams, chord);
              }}
              className="w-full p-2 bg-black text-white border border-white focus:border-white focus:outline-none transition-colors font-mono text-xs"
            >
              <option value='["C4","E4","G4"]'>C_MAJOR (C-E-G)</option>
              <option value='["C4","Eb4","G4"]'>C_MINOR (C-Eb-G)</option>
              <option value='["C4","E4","G4","B4"]'>C_MAJOR_7 (C-E-G-B)</option>
              <option value='["C4","Eb4","G4","Bb4"]'>C_MINOR_7 (C-Eb-G-Bb)</option>
              <option value='["C4","E4","G4","B4","D5"]'>C_MAJOR_9 (C-E-G-B-D)</option>
              <option value='["C4","Eb4","G4","Bb4","D5"]'>C_MINOR_9 (C-Eb-G-Bb-D)</option>
              <option value='["C4","E4","G#4","B4"]'>C_MAJOR_7_SHARP5 (C-E-G#-B)</option>
              <option value='["C4","Eb4","G4","Bb4","Db5"]'>C_MINOR_9_FLAT5 (C-Eb-G-Bb-Db)</option>
            </select>
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
          </div>

          {/* Curve */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
              CURVE
            </label>
            <select
              value={(selectedObject.audioParams as any).curve || 'linear'}
              onChange={(e) => onParamChange('curve' as keyof AudioParams, e.target.value)}
              className="w-full p-2 bg-black text-white border border-white focus:border-white focus:outline-none transition-colors font-mono text-xs"
            >
              <option value="linear">LINEAR</option>
              <option value="exponential">EXPONENTIAL</option>
              <option value="sine">SINE</option>
              <option value="cosine">COSINE</option>
              <option value="bounce">BOUNCE</option>
              <option value="ripple">RIPPLE</option>
              <option value="step">STEP</option>
            </select>
          </div>
        </>
      )}

      {/* Controles específicos para Sampler (spiral) */}
      {selectedObject.type === 'spiral' && (
        <>
          {/* Attack */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
              ATTACK
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={(selectedObject.audioParams as any).attack || 0.1}
                onChange={(e) => onParamChange('attack' as keyof AudioParams, Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {((selectedObject.audioParams as any).attack || 0.1).toFixed(2)}s
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0s</span>
              <span>1s</span>
            </div>
          </div>

          {/* Release */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
              RELEASE
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={(selectedObject.audioParams as any).release || 1.0}
                onChange={(e) => onParamChange('release' as keyof AudioParams, Number(e.target.value))}
                className="futuristic-slider flex-1"
              />
              <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
                {((selectedObject.audioParams as any).release || 1.0).toFixed(2)}s
              </span>
            </div>
            <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
              <span>0s</span>
              <span>2s</span>
            </div>
          </div>

          {/* Base URL */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
              BASE_URL
            </label>
            <input
              type="text"
              value={(selectedObject.audioParams as any).baseUrl || '/samples/piano/'}
              onChange={(e) => onParamChange('baseUrl' as keyof AudioParams, e.target.value)}
              className="w-full p-2 bg-black text-white border border-white focus:border-white focus:outline-none transition-colors font-mono text-xs"
              placeholder="/samples/piano/"
            />
          </div>

          {/* URLs */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs">
              URLS
            </label>
            <textarea
              value={JSON.stringify((selectedObject.audioParams as any).urls || ['A4.mp3', 'C4.mp3', 'Ds4.mp3', 'Fs4.mp3'])}
              onChange={(e) => {
                try {
                  const urls = JSON.parse(e.target.value);
                  onParamChange('urls' as keyof AudioParams, urls);
                } catch (error) {
                  console.error('Error parsing URLs:', error);
                }
              }}
              className="w-full p-2 bg-black text-white border border-white focus:border-white focus:outline-none transition-colors h-20 resize-none font-mono text-xs"
              placeholder='["A4.mp3", "C4.mp3", "Ds4.mp3", "Fs4.mp3"]'
            />
            <p className="text-xs text-white mt-1 font-mono tracking-wider">
              JSON_FORMAT: ["FILE1.MP3", "FILE2.MP3", "..."]
            </p>
          </div>
        </>
      )}
    </div>
  );
}
