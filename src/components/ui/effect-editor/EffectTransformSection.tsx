'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface EffectTransformSectionProps {
  zone: EffectZone;
  onUpdateEffectZone: (id: string, updates: Partial<EffectZone>) => void;
  roundToDecimals: (value: number) => number;
}

export function EffectTransformSection({
  zone,
  onUpdateEffectZone,
  roundToDecimals
}: EffectTransformSectionProps) {
  return (
    <div className="mt-6 pt-4 border-t border-gray-700">
      <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
        📍 Posición y Tamaño
      </h4>
      
      {/* Position */}
      <div className="space-y-2 mb-4">
        <label className="text-xs font-medium text-gray-300">Position</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { axis: 'X', color: 'bg-red-500', value: zone?.position[0] },
            { axis: 'Y', color: 'bg-green-500', value: zone?.position[1] },
            { axis: 'Z', color: 'bg-blue-500', value: zone?.position[2] }
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
                  const newPosition = [...zone?.position] as [number, number, number];
                  newPosition[index] = newValue;
                  onUpdateEffectZone(zone?.id, { position: newPosition });
                }}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                disabled={zone?.isLocked}
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
            { axis: 'X', color: 'bg-red-500', value: zone?.rotation[0] },
            { axis: 'Y', color: 'bg-green-500', value: zone?.rotation[1] },
            { axis: 'Z', color: 'bg-blue-500', value: zone?.rotation[2] }
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
                  const newRotation = [...zone?.rotation] as [number, number, number];
                  newRotation[index] = newValue;
                  onUpdateEffectZone(zone?.id, { rotation: newRotation });
                }}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                disabled={zone?.isLocked}
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
            { axis: 'X', color: 'bg-red-500', value: zone?.scale[0] },
            { axis: 'Y', color: 'bg-green-500', value: zone?.scale[1] },
            { axis: 'Z', color: 'bg-blue-500', value: zone?.scale[2] }
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
                  const newScale = [...zone?.scale] as [number, number, number];
                  newScale[index] = newValue;
                  onUpdateEffectZone(zone?.id, { scale: newScale });
                }}
                className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                disabled={zone?.isLocked}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controles de transformación */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            // Resetear a valores por defecto
            onUpdateEffectZone(zone?.id, { 
              position: [0, 0, 0], 
              rotation: [0, 0, 0],
              scale: [1, 1, 1] 
            });
          }}
          className="flex-1 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Resetear posición y tamaño a valores por defecto"
          disabled={zone?.isLocked}
        >
          🔄 Reset
        </button>
        <button
          onClick={() => {
            // Copiar valores al portapapeles
            const transformText = `Position: [${zone?.position.join(', ')}]\nRotation: [${zone?.rotation.join(', ')}]\nScale: [${zone?.scale.join(', ')}]`;
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
