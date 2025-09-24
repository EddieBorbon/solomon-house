'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';

interface PolySynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

/**
 * Componente especializado para parámetros específicos de PolySynth
 * Responsabilidad única: Manejar parámetros específicos del PolySynth (dodecahedronRing)
 */
export function PolySynthParameters({
  selectedObject,
  onParamChange
}: PolySynthParametersProps) {
  
  // Mapa de acordes disponibles
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

  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        POLY_SYNTH_PARAMETERS
      </h4>

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

      {/* Harmonicity */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          HARMONICITY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={(selectedObject.audioParams as any).harmonicity || 1}
            onChange={(e) => onParamChange('harmonicity' as keyof AudioParams, Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {((selectedObject.audioParams as any).harmonicity || 1).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0</span>
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
            min="0"
            max="100"
            step="1"
            value={(selectedObject.audioParams as any).modulationIndex || 10}
            onChange={(e) => onParamChange('modulationIndex' as keyof AudioParams, Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams as any).modulationIndex || 10}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0</span>
          <span>100</span>
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
    </div>
  );
}
