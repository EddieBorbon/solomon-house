'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';

interface MetalSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

/**
 * Componente especializado para parámetros específicos de MetalSynth
 * Responsabilidad única: Manejar parámetros específicos del MetalSynth (icosahedron)
 */
export function MetalSynthParameters({
  selectedObject,
  onParamChange
}: MetalSynthParametersProps) {
  
  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        METAL_SYNTH_PARAMETERS
      </h4>

      {/* Harmonicity */}
      <div className="mb-4">
        <label className="futuristic-label block mb-1 text-white text-xs">
          HARMONICITY
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.1"
            max="20"
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
          <span>20.0</span>
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
            value={selectedObject.audioParams.modulationIndex || 32}
            onChange={(e) => onParamChange('modulationIndex', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {selectedObject.audioParams.modulationIndex || 32}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0</span>
          <span>100</span>
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
            min="1000"
            max="8000"
            step="100"
            value={selectedObject.audioParams.resonance || 4000}
            onChange={(e) => onParamChange('resonance', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {selectedObject.audioParams.resonance || 4000}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>1000 Hz</span>
          <span>8000 Hz</span>
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
            max="5"
            step="0.1"
            value={selectedObject.audioParams.octaves || 1.5}
            onChange={(e) => onParamChange('octaves', Number(e.target.value))}
            className="futuristic-slider flex-1"
          />
          <span className="text-white font-mono text-xs min-w-[4rem] text-right tracking-wider">
            {(selectedObject.audioParams.octaves || 1.5).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white mt-1 font-mono tracking-wider">
          <span>0.5</span>
          <span>5.0</span>
        </div>
      </div>
    </div>
  );
}
