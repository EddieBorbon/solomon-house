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
    <div className="pt-6 border-t border-gray-700">
      <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
        📍 Posición y Tamaño
      </h4>
      
      {/* Position */}
      <div className="space-y-2 mb-4">
        <label className="text-xs font-medium text-gray-300">Position</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { axis: 'X', color: 'bg-red-500', value: selectedObject.position[0] },
            { axis: 'Y', color: 'bg-green-500', value: selectedObject.position[1] },
            { axis: 'Z', color: 'bg-blue-500', value: selectedObject.position[2] }
          ].map(({ axis, color, value }, index) => (
            <div key={axis} className="flex flex-col">
              <div className="flex items-center gap-1 mb-1">
                <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                <span className="text-xs text-gray-400">{axis}</span>
              </div>
              <input
                type="number"
                step="0.1"
                value={roundToDecimals(value)}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  onTransformChange('position', index as 0 | 1 | 2, newValue);
                }}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-2 mb-4">
        <label className="text-xs font-medium text-gray-300">Rotation</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { axis: 'X', color: 'bg-red-500', value: selectedObject.rotation[0] },
            { axis: 'Y', color: 'bg-green-500', value: selectedObject.rotation[1] },
            { axis: 'Z', color: 'bg-blue-500', value: selectedObject.rotation[2] }
          ].map(({ axis, color, value }, index) => (
            <div key={axis} className="flex flex-col">
              <div className="flex items-center gap-1 mb-1">
                <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                <span className="text-xs text-gray-400">{axis}</span>
              </div>
              <input
                type="number"
                step="1"
                value={roundToDecimals(value)}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  onTransformChange('rotation', index as 0 | 1 | 2, newValue);
                }}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-2 mb-4">
        <label className="text-xs font-medium text-gray-300">Scale</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { axis: 'X', color: 'bg-red-500', value: selectedObject.scale[0] },
            { axis: 'Y', color: 'bg-green-500', value: selectedObject.scale[1] },
            { axis: 'Z', color: 'bg-blue-500', value: selectedObject.scale[2] }
          ].map(({ axis, color, value }, index) => (
            <div key={axis} className="flex flex-col">
              <div className="flex items-center gap-1 mb-1">
                <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                <span className="text-xs text-gray-400">{axis}</span>
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
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controles de transformación */}
      <div className="flex gap-2">
        <button
          onClick={onResetTransform}
          className="flex-1 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
          title="Resetear transformación a valores por defecto"
        >
          🔄 Reset
        </button>
        <button
          onClick={() => {
            // Copiar valores al portapapeles
            const transformText = `Position: [${selectedObject.position.join(', ')}]\nRotation: [${selectedObject.rotation.join(', ')}]\nScale: [${selectedObject.scale.join(', ')}]`;
            navigator.clipboard.writeText(transformText);
          }}
          className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
          title="Copiar valores al portapapeles"
        >
          📋
        </button>
      </div>
    </div>
  );
}
