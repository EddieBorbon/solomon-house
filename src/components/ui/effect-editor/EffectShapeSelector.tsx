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
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label text-white text-xs mb-3 text-center">
        SHAPE_SELECTOR
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {(['sphere', 'cube'] as const).map((shape) => (
          <button
            key={shape}
            onClick={() => onShapeChange(shape)}
            disabled={zone?.isLocked}
            className={`px-2 py-1 text-xs rounded-md transition-colors font-mono tracking-wider ${
              zone?.shape === shape
                ? 'bg-white text-black'
                : 'bg-black text-white border border-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {shape === 'sphere' && '🔵'}
            {shape === 'cube' && '🟦'}
            <span className="ml-1 uppercase">{shape}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
