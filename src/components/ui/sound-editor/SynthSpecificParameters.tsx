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
    <div className="space-y-4">
      {/* Frecuencia - Para todos los objetos excepto spiral */}
      {selectedObject.type !== 'spiral' && (
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {selectedObject.type === 'cone' ? 'Frecuencia (Tono)' : 'Frecuencia (Hz)'}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={selectedObject.type === 'cone' ? '20' : selectedObject.type === 'icosahedron' ? '50' : selectedObject.type === 'dodecahedronRing' ? '55' : '20'}
              max={selectedObject.type === 'cone' ? '200' : selectedObject.type === 'icosahedron' ? '1200' : selectedObject.type === 'dodecahedronRing' ? '880' : '2000'}
              step="1"
              value={selectedObject.audioParams.frequency}
              onChange={(e) => onParamChange('frequency', Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {selectedObject.audioParams.frequency}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{selectedObject.type === 'cone' ? '20 Hz' : selectedObject.type === 'icosahedron' ? '50 Hz' : selectedObject.type === 'dodecahedronRing' ? '55 Hz (A1)' : '20 Hz'}</span>
            <span>{selectedObject.type === 'cone' ? '200 Hz' : selectedObject.type === 'icosahedron' ? '1200 Hz' : selectedObject.type === 'dodecahedronRing' ? '880 Hz (A5)' : '2000 Hz'}</span>
          </div>
          {selectedObject.type === 'dodecahedronRing' && (
            <p className="text-xs text-pink-400 mt-1">
              💡 La frecuencia base transpone el acorde completo
            </p>
          )}
        </div>
      )}

      {/* Forma de Onda (Portadora) - Para todos los objetos excepto spiral */}
      {selectedObject.type !== 'spiral' && (
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Forma de Onda
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
      )}

      {/* Duración - Para todos los objetos excepto spiral */}
      {selectedObject.type !== 'spiral' && (
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Duración (segundos)
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
              className="flex-1 p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors font-mono"
            />

            <span className="text-white font-mono text-xs min-w-[3rem] text-right">
              {selectedObject.audioParams.duration === Infinity ? '∞' : `${(selectedObject.audioParams.duration || 1.0).toFixed(1)}s`}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1s</span>
            <span>60s</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {selectedObject.audioParams.duration === Infinity 
              ? 'Sonido continuo - usa el botón "Activar Sonido Continuo" para controlar'
              : 'Sonido con duración finita - se detiene automáticamente'
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
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Harmonicity
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={selectedObject.audioParams.harmonicity || 1.5}
                onChange={(e) => onParamChange('harmonicity', Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                {selectedObject.audioParams.harmonicity || 1.5}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1</span>
              <span>10</span>
            </div>
          </div>

          {/* Forma de Onda (Moduladora) */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Forma de Onda (Moduladora)
            </label>
            <select
              value={selectedObject.audioParams.modulationWaveform || 'square'}
              onChange={(e) => onParamChange('modulationWaveform', e.target.value as OscillatorType)}
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

      {/* Volumen - Movido al final */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Volumen
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
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-white font-mono text-sm min-w-[4rem] text-right">
            {Math.round(selectedObject.audioParams.volume * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
