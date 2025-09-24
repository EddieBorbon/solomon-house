'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';

interface BaseSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
  showFrequency?: boolean;
  showWaveform?: boolean;
  showDuration?: boolean;
  showModulation?: boolean;
  modulationType?: 'waveform2' | 'modulationWaveform';
}

/**
 * Componente base con controles comunes para todos los sintetizadores
 * Responsabilidad única: Manejar controles comunes (volumen, frecuencia, waveform, duración)
 */
export function BaseSynthParameters({
  selectedObject,
  onParamChange,
  showFrequency = true,
  showWaveform = true,
  showDuration = true,
  showModulation = false,
  modulationType = 'modulationWaveform'
}: BaseSynthParametersProps) {
  
  // Función helper para obtener rangos de frecuencia según el tipo
  const getFrequencyRange = () => {
    switch (selectedObject.type) {
      case 'cone':
        return { min: 20, max: 200, label: 'FREQUENCY_TONE' };
      case 'icosahedron':
        return { min: 50, max: 1200, label: 'FREQUENCY_HZ' };
      case 'dodecahedronRing':
        return { min: 55, max: 880, label: 'FREQUENCY_HZ' };
      case 'torus':
        return { min: 20, max: 440, label: 'FREQUENCY_HZ' };
      default:
        return { min: 20, max: 2000, label: 'FREQUENCY_HZ' };
    }
  };

  // Función helper para obtener etiquetas de frecuencia según el tipo
  const getFrequencyLabels = () => {
    switch (selectedObject.type) {
      case 'cone':
        return { min: '20_HZ', max: '200_HZ' };
      case 'icosahedron':
        return { min: '50_HZ', max: '1200_HZ' };
      case 'dodecahedronRing':
        return { min: '55_HZ_A1', max: '880_HZ_A5' };
      case 'torus':
        return { min: '20_HZ', max: '440_HZ' };
      default:
        return { min: '20_HZ', max: '2000_HZ' };
    }
  };

  const frequencyRange = getFrequencyRange();
  const frequencyLabels = getFrequencyLabels();

  return (
    <>
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
      {showFrequency && selectedObject.type !== 'spiral' && (
        <div className="mb-4">
          <label className="futuristic-label block mb-1 text-white text-xs">
            {frequencyRange.label}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={frequencyRange.min}
              max={frequencyRange.max}
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
            <span>{frequencyLabels.min}</span>
            <span>{frequencyLabels.max}</span>
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
            {showWaveform && (
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
            )}

            {/* MODULATION - Para AMSynth (cubo), FMSynth (esfera) y DuoSynth (cilindro) */}
            {showModulation && (
              <div className="flex-1">
                <label className="futuristic-label block mb-1 text-white text-xs">
                  MODULATION
                </label>
                <select
                  value={
                    modulationType === 'waveform2'
                      ? (selectedObject.audioParams.waveform2 || 'sine')
                      : (selectedObject.audioParams.modulationWaveform || 'sine')
                  }
                  onChange={(e) => {
                    if (modulationType === 'waveform2') {
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
            {showDuration && (
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
            )}
          </div>
        </div>
      )}
    </>
  );
}
