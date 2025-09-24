'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';

interface PluckSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function PluckSynthParameters({
  selectedObject,
  onParamChange
}: PluckSynthParametersProps) {
  if (selectedObject.type !== 'torus') return null;

  return (
    <>
      {/* Sección: Parámetros del PluckSynth */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
        <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          🔄 Parámetros del PluckSynth
        </h4>
        
        {/* Attack Noise */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Attack Noise (Ruido de Ataque)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={selectedObject.audioParams.attackNoise || 1}
              onChange={(e) => onParamChange('attackNoise', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.attackNoise || 1).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1</span>
            <span>20</span>
          </div>
        </div>

        {/* Dampening */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Dampening (Amortiguación)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="500"
              max="7000"
              step="100"
              value={selectedObject.audioParams.dampening || 4000}
              onChange={(e) => onParamChange('dampening', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {selectedObject.audioParams.dampening || 4000}Hz
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>500 Hz</span>
            <span>7000 Hz</span>
          </div>
        </div>

        {/* Resonance */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Resonance (Resonancia)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={selectedObject.audioParams.resonance || 0.7}
              onChange={(e) => onParamChange('resonance', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.resonance || 0.7).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1</span>
            <span>20</span>
          </div>
        </div>
      </div>
    </>
  );
}
