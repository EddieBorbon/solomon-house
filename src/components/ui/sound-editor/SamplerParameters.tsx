'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';

interface SamplerParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function SamplerParameters({
  selectedObject,
  onParamChange
}: SamplerParametersProps) {
  if (selectedObject.type !== 'spiral') return null;

  return (
    <>
      {/* Sección: Parámetros del Sampler */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
        <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          🌀 Parámetros del Sampler
        </h4>
        
        {/* Attack */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Attack (Ataque)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedObject.audioParams.attack || 0.1}
              onChange={(e) => onParamChange('attack', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.attack || 0.1).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0s</span>
            <span>1s</span>
          </div>
        </div>

        {/* Release */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Release (Liberación)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={selectedObject.audioParams.release || 1.0}
              onChange={(e) => onParamChange('release', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.release || 1.0).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0s</span>
            <span>2s</span>
          </div>
        </div>

        {/* Base URL */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Base URL (URL Base)
          </label>
          <input
            type="text"
            value={selectedObject.audioParams.baseUrl || '/samples/piano/'}
            onChange={(e) => onParamChange('baseUrl', e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none transition-colors"
            placeholder="/samples/piano/"
          />
        </div>

        {/* URLs */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            URLs (Archivos de Audio)
          </label>
          <textarea
            value={JSON.stringify(selectedObject.audioParams.urls || ['A4.mp3', 'C4.mp3', 'Ds4.mp3', 'Fs4.mp3'])}
            onChange={(e) => {
              try {
                const urls = JSON.parse(e.target.value);
                onParamChange('urls', urls);
              } catch {
              }
            }}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-cyan-500 focus:outline-none transition-colors h-20 resize-none"
            placeholder='[&quot;A4.mp3&quot;, &quot;C4.mp3&quot;, &quot;Ds4.mp3&quot;, &quot;Fs4.mp3&quot;]'
          />
          <p className="text-xs text-gray-400 mt-1">
            Formato JSON: [&quot;archivo1.mp3&quot;, &quot;archivo2.mp3&quot;, ...]
          </p>
        </div>
      </div>
    </>
  );
}
