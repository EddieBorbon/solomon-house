'use client';

import React from 'react';
import { type EffectZone } from '../../state/useWorldStore';

interface EffectParametersSectionProps {
  zone: EffectZone;
  isUpdatingParams: boolean;
  lastUpdatedParam: string | null;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function EffectParametersSection({ 
  zone, 
  isUpdatingParams, 
  lastUpdatedParam, 
  onEffectParamChange 
}: EffectParametersSectionProps) {
  const getEffectTypeColor = (type: string) => {
    switch (type) {
      case 'phaser': return 'text-purple-400';
      case 'autoFilter': return 'text-green-400';
      case 'autoWah': return 'text-orange-400';
      case 'bitCrusher': return 'text-red-400';
      case 'chebyshev': return 'text-indigo-400';
      default: return 'text-teal-400';
    }
  };

  const getEffectTypeName = (type: string) => {
    switch (type) {
      case 'phaser': return 'Phaser';
      case 'autoFilter': return 'AutoFilter';
      case 'autoWah': return 'AutoWah';
      case 'bitCrusher': return 'BitCrusher';
      case 'chebyshev': return 'Chebyshev';
      default: return 'Chorus';
    }
  };

  return (
    <>
      <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${getEffectTypeColor(zone.type)}`}>
        🎛️ Parámetros del {getEffectTypeName(zone.type)}
        {isUpdatingParams && (
          <span className="text-yellow-400 animate-pulse">🔄</span>
        )}
      </h4>

      {/* Control de Radio de la Zona de Efectos */}
      <div className="glass-container p-4">
        <label className="block text-sm font-bold neon-text mb-3">
          Radio de la Zona: {zone.effectParams.radius ?? 2.0}
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              value={zone.effectParams.radius ?? 2.0}
              onChange={(e) => onEffectParamChange('radius', Number(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
              disabled={zone.isLocked}
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #06b6d4 ${((zone.effectParams.radius ?? 2.0) - 0.5) / 9.5 * 100}%, #1f2937 ${((zone.effectParams.radius ?? 2.0) - 0.5) / 9.5 * 100}%, #1f2937 100%)`
              }}
            />
          </div>
          <span className="text-cyan-300 font-mono text-sm min-w-[4rem] text-right bg-black/60 px-2 py-1 rounded-lg border border-cyan-500/30">
            {zone.effectParams.radius ?? 2.0}
          </span>
        </div>
        <div className="flex justify-between text-xs text-purple-300 mt-2">
          <span>0.5</span>
          <span>10</span>
        </div>
        <p className="text-xs text-cyan-300 mt-2 bg-black/40 px-2 py-1 rounded-lg border border-cyan-500/20">
          Tamaño de la zona donde se aplica el efecto
        </p>
      </div>
      
      {/* Indicador de parámetro actualizado */}
      {lastUpdatedParam && (
        <div className="mb-3 p-2 bg-green-900/20 border border-green-600/50 rounded-lg">
          <p className="text-xs text-green-400 text-center">
            ✅ Parámetro <strong>{lastUpdatedParam}</strong> actualizado en tiempo real
          </p>
        </div>
      )}
      
      {/* Indicador de estado del efecto */}
      <div className="mb-3 p-2 bg-blue-900/20 border border-blue-600/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-blue-400">
            🎵 Efecto <strong>{zone.type}</strong> activo
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">En tiempo real</span>
          </div>
        </div>
      </div>
    </>
  );
}
