'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface EffectShapeSelectorProps {
  zone: EffectZone;
  onShapeChange: (shape: 'sphere' | 'cube') => void;
}

export function EffectShapeSelector({
  zone,
  onShapeChange
}: EffectShapeSelectorProps) {
  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-2">
        🔷 Cambiar Forma
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {(['sphere', 'cube'] as const).map((shape) => (
          <button
            key={shape}
            onClick={() => onShapeChange(shape)}
            disabled={zone?.isLocked}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              zone?.shape === shape
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {shape === 'sphere' && '🔵'}
            {shape === 'cube' && '🟦'}
            <span className="ml-1 capitalize">{shape}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
