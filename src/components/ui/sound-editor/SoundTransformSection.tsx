'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { RotateCcw, Copy } from 'lucide-react';

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
    <div className="relative border border-white p-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        POSITION_AND_SIZE
      </h4>
      
      {/* Position, Rotation, Scale - Todo junto */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Position */}
        <div>
          <label className="futuristic-label block mb-2 text-white text-center">POSITION</label>
          <div className="space-y-1">
            {[
              { axis: 'X', value: selectedObject.position[0] },
              { axis: 'Y', value: selectedObject.position[1] },
              { axis: 'Z', value: selectedObject.position[2] }
            ].map(({ axis, value }, index) => (
              <div key={axis} className="flex items-center gap-1">
                <span className="text-xs text-white font-mono tracking-wider w-3">{axis}</span>
                <input
                  type="number"
                  step="0.1"
                  value={roundToDecimals(value)}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value) || 0;
                    onTransformChange('position', index as 0 | 1 | 2, newValue);
                  }}
                  className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-12 h-6 focus:outline-none focus:border-gray-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="futuristic-label block mb-2 text-white text-center">ROTATION</label>
          <div className="space-y-1">
            {[
              { axis: 'X', value: selectedObject.rotation[0] },
              { axis: 'Y', value: selectedObject.rotation[1] },
              { axis: 'Z', value: selectedObject.rotation[2] }
            ].map(({ axis, value }, index) => (
              <div key={axis} className="flex items-center gap-1">
                <span className="text-xs text-white font-mono tracking-wider w-3">{axis}</span>
                <input
                  type="number"
                  step="1"
                  value={roundToDecimals(value)}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value) || 0;
                    onTransformChange('rotation', index as 0 | 1 | 2, newValue);
                  }}
                  className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-12 h-6 focus:outline-none focus:border-gray-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div>
          <label className="futuristic-label block mb-2 text-white text-center">SCALE</label>
          <div className="space-y-1">
            {[
              { axis: 'X', value: selectedObject.scale[0] },
              { axis: 'Y', value: selectedObject.scale[1] },
              { axis: 'Z', value: selectedObject.scale[2] }
            ].map(({ axis, value }, index) => (
              <div key={axis} className="flex items-center gap-1">
                <span className="text-xs text-white font-mono tracking-wider w-3">{axis}</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={roundToDecimals(value)}
                  onChange={(e) => {
                    const newValue = Math.max(0.1, parseFloat(e.target.value) || 1);
                    onTransformChange('scale', index as 0 | 1 | 2, newValue);
                  }}
                  className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-12 h-6 focus:outline-none focus:border-gray-400"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controles de transformación */}
      <div className="flex gap-2">
        <button
          onClick={onResetTransform}
          className="relative bg-black border border-white px-3 py-2 text-white hover:bg-white hover:text-black transition-all duration-300 group flex items-center gap-2 flex-1 justify-center"
          title="Resetear transformación a valores por defecto"
        >
          <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
          <RotateCcw className="w-4 h-4" />
          <span className="relative text-xs font-mono tracking-wider uppercase">RESET</span>
        </button>
        <button
          onClick={() => {
            // Copiar valores al portapapeles
            const transformText = `Position: [${selectedObject.position.join(', ')}]\nRotation: [${selectedObject.rotation.join(', ')}]\nScale: [${selectedObject.scale.join(', ')}]`;
            navigator.clipboard.writeText(transformText);
          }}
          className="relative bg-black border border-white px-3 py-2 text-white hover:bg-white hover:text-black transition-all duration-300 group flex items-center gap-2 flex-1 justify-center"
          title="Copiar valores al portapapeles"
        >
          <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
          <Copy className="w-4 h-4" />
          <span className="relative text-xs font-mono tracking-wider uppercase">COPY</span>
        </button>
      </div>
    </div>
  );
}
