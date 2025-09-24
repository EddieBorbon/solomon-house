'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';

interface SoundTransformSectionProps {
  selectedObject: SoundObject;
  onTransformChange: (transform: 'position' | 'rotation' | 'scale', axis: 0 | 1 | 2, value: number) => void;
  onResetTransform: () => void;
  roundToDecimals: (value: number) => number;
}

export function SoundTransformSection({
  selectedObject,
  onTransformChange,
  onResetTransform,
  roundToDecimals
}: SoundTransformSectionProps) {
  return (
    <div className="futuristic-param-container">
      <h4 className="futuristic-label mb-4">
        POSITION_AND_SIZE
      </h4>
      
      {/* Position */}
      <div className="space-y-2 mb-4">
        <label className="futuristic-label block mb-2">POSITION</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { axis: 'X', value: selectedObject.position[0] },
            { axis: 'Y', value: selectedObject.position[1] },
            { axis: 'Z', value: selectedObject.position[2] }
          ].map(({ axis, value }, index) => (
            <div key={axis} className="flex flex-col">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 border border-white bg-black"></div>
                <span className="text-xs text-white font-mono tracking-wider">{axis}</span>
              </div>
              <input
                type="number"
                step="0.1"
                value={roundToDecimals(value)}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  onTransformChange('position', index as 0 | 1 | 2, newValue);
                }}
                className="futuristic-input w-full px-2 py-1 text-xs font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-2 mb-4">
        <label className="futuristic-label block mb-2">ROTATION</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { axis: 'X', value: selectedObject.rotation[0] },
            { axis: 'Y', value: selectedObject.rotation[1] },
            { axis: 'Z', value: selectedObject.rotation[2] }
          ].map(({ axis, value }, index) => (
            <div key={axis} className="flex flex-col">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 border border-white bg-black"></div>
                <span className="text-xs text-white font-mono tracking-wider">{axis}</span>
              </div>
              <input
                type="number"
                step="1"
                value={roundToDecimals(value)}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  onTransformChange('rotation', index as 0 | 1 | 2, newValue);
                }}
                className="futuristic-input w-full px-2 py-1 text-xs font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-2 mb-4">
        <label className="futuristic-label block mb-2">SCALE</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { axis: 'X', value: selectedObject.scale[0] },
            { axis: 'Y', value: selectedObject.scale[1] },
            { axis: 'Z', value: selectedObject.scale[2] }
          ].map(({ axis, value }, index) => (
            <div key={axis} className="flex flex-col">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 border border-white bg-black"></div>
                <span className="text-xs text-white font-mono tracking-wider">{axis}</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={roundToDecimals(value)}
                onChange={(e) => {
                  const newValue = Math.max(0.1, parseFloat(e.target.value) || 1);
                  onTransformChange('scale', index as 0 | 1 | 2, newValue);
                }}
                className="futuristic-input w-full px-2 py-1 text-xs font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controles de transformación */}
      <div className="flex gap-2">
        <button
          onClick={onResetTransform}
          className="futuristic-button flex-1 px-3 py-2 text-xs font-mono tracking-wider"
          title="Resetear transformación a valores por defecto"
        >
          <span className="futuristic-button-text">RESET</span>
        </button>
        <button
          onClick={() => {
            // Copiar valores al portapapeles
            const transformText = `Position: [${selectedObject.position.join(', ')}]\nRotation: [${selectedObject.rotation.join(', ')}]\nScale: [${selectedObject.scale.join(', ')}]`;
            navigator.clipboard.writeText(transformText);
          }}
          className="futuristic-button px-3 py-2 text-xs font-mono tracking-wider"
          title="Copiar valores al portapapeles"
        >
          <span className="futuristic-button-text">COPY</span>
        </button>
      </div>
    </div>
  );
}
