'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';

interface PolySynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function PolySynthParameters({
  selectedObject,
  onParamChange
}: PolySynthParametersProps) {
  if (selectedObject.type !== 'dodecahedronRing') return null;

  return (
    <>
      {/* Sección: Parámetros del PolySynth */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
        <h4 className="text-sm font-semibold text-pink-400 mb-3 flex items-center gap-2">
          🔷 Parámetros del PolySynth
        </h4>
        
        {/* Polifonía */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Polifonía (Número de Voces)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={selectedObject.audioParams.polyphony || 4}
              onChange={(e) => onParamChange('polyphony', Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {selectedObject.audioParams.polyphony || 4}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>8</span>
          </div>
        </div>

        {/* Tipo de Acorde */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Tipo de Acorde
          </label>
          <select
            value={JSON.stringify(selectedObject.audioParams.chord || ["C4", "E4", "G4"])}
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
              onParamChange('chord', chord);
            }}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-pink-500 focus:outline-none transition-colors"
          >
            <option value='["C4","E4","G4"]'>Do Mayor (C-E-G)</option>
            <option value='["C4","Eb4","G4"]'>Do Menor (C-Eb-G)</option>
            <option value='["C4","E4","G4","B4"]'>Do Mayor 7 (C-E-G-B)</option>
            <option value='["C4","Eb4","G4","Bb4"]'>Do Menor 7 (C-Eb-G-Bb)</option>
            <option value='["C4","E4","G4","B4","D5"]'>Do Mayor 9 (C-E-G-B-D)</option>
            <option value='["C4","Eb4","G4","Bb4","D5"]'>Do Menor 9 (C-Eb-G-Bb-D)</option>
            <option value='["C4","E4","G#4","B4"]'>Do Mayor 7 (#5) (C-E-G#-B)</option>
            <option value='["C4","Eb4","G4","Bb4","Db5"]'>Do Menor 9 (b5) (C-Eb-G-Bb-Db)</option>
          </select>
        </div>

        {/* Release */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Release (Liberación)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.01"
              max="4"
              step="0.01"
              value={selectedObject.audioParams.release || 1}
              onChange={(e) => onParamChange('release', Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.release || 1).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.01s</span>
            <span>4s</span>
          </div>
        </div>

        {/* Curve */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Curve (Curva de Envolvente)
          </label>
          <select
            value={selectedObject.audioParams.curve || 'linear'}
            onChange={(e) => onParamChange('curve', e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-pink-500 focus:outline-none transition-colors"
          >
            <option value="linear">Linear (Lineal)</option>
            <option value="exponential">Exponential (Exponencial)</option>
            <option value="sine">Sine (Seno)</option>
            <option value="cosine">Cosine (Coseno)</option>
            <option value="bounce">Bounce (Rebote)</option>
            <option value="ripple">Ripple (Ondulación)</option>
            <option value="step">Step (Escalón)</option>
          </select>
        </div>
      </div>
    </>
  );
}
