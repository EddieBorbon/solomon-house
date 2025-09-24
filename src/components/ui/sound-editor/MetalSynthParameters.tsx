'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';

interface MetalSynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function MetalSynthParameters({
  selectedObject,
  onParamChange
}: MetalSynthParametersProps) {
  if (selectedObject.type !== 'icosahedron') return null;

  return (
    <>
      {/* Sección: Parámetros del MetalSynth */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
        <h4 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
          🔶 Parámetros del MetalSynth
        </h4>
        
        {/* Harmonicity */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Harmonicity
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
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.harmonicity || 5.1).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1</span>
            <span>10</span>
          </div>
        </div>

        {/* Modulation Index */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Modulation Index
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
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {selectedObject.audioParams.modulationIndex || 32}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        {/* Modulation Envelope */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Modulation Envelope
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.01"
              max="2"
              step="0.01"
              value={selectedObject.audioParams.modulationEnvelope || 0.01}
              onChange={(e) => onParamChange('modulationEnvelope', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.modulationEnvelope || 0.01).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.01s</span>
            <span>2s</span>
          </div>
        </div>

        {/* Resonance */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Resonance
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={selectedObject.audioParams.resonance || 4000}
              onChange={(e) => onParamChange('resonance', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {selectedObject.audioParams.resonance || 4000}Hz
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1 Hz</span>
            <span>20 Hz</span>
          </div>
        </div>

        {/* Octaves */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Octaves
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
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.octaves || 2.5).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5</span>
            <span>8</span>
          </div>
        </div>
      </div>
    </>
  );
}
