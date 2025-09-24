'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface EffectZoneHeaderProps {
  zone: EffectZone;
  isRefreshingEffects: boolean;
  onRemove: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRefresh: () => void;
}

export function EffectZoneHeader({
  zone,
  isRefreshingEffects,
  onRemove,
  onToggleLock,
  onRefresh
}: EffectZoneHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded ${
            zone.type === 'phaser' ? 'bg-purple-500' : 
            zone.type === 'autoFilter' ? 'bg-green-500' : 
            zone.type === 'autoWah' ? 'bg-orange-500' :
            zone.type === 'bitCrusher' ? 'bg-red-500' :
            zone.type === 'chebyshev' ? 'bg-indigo-500' :
            zone.type === 'chorus' ? 'bg-teal-500' :
            zone.type === 'distortion' ? 'bg-pink-500' :
            zone.type === 'feedbackDelay' ? 'bg-amber-500' :
            zone.type === 'freeverb' ? 'bg-sky-500' :
            zone.type === 'frequencyShifter' ? 'bg-lime-500' :
            zone.type === 'jcReverb' ? 'bg-blue-800' :
            zone.type === 'pingPongDelay' ? 'bg-violet-500' :
            zone.type === 'pitchShift' ? 'bg-emerald-500' :
            zone.type === 'reverb' ? 'bg-amber-500' :
            zone.type === 'stereoWidener' ? 'bg-cyan-500' :
            zone.type === 'tremolo' ? 'bg-red-500' :
            zone.type === 'vibrato' ? 'bg-orange-500' : 'bg-gray-500'
          }`} />
          <h3 className="text-lg font-semibold text-white">
            Editor de Zona de Efecto
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshingEffects}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors duration-200"
            title="Actualizar efectos"
          >
            {isRefreshingEffects ? '⏳' : '🔄'}
          </button>
          <button
            onClick={() => onToggleLock(zone.id)}
            className={`px-3 py-1 text-white text-sm rounded-lg transition-colors duration-200 ${
              zone.isLocked ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={zone.isLocked ? "Desbloquear zona" : "Bloquear zona"}
          >
            {zone.isLocked ? '🔒' : '🔓'}
          </button>
          <button
            onClick={() => {
              if (confirm('¿Estás seguro de que quieres eliminar esta zona de efecto?')) {
                onRemove(zone.id);
              }
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
            title="Eliminar zona de efecto"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-400">
        <p>Efecto: <span className="text-white">{zone.type}</span></p>
        <p>ID: <span className="text-white font-mono text-xs">{zone.id.slice(0, 8)}...</span></p>
        <p>Estado: <span className={`${zone.isLocked ? 'text-yellow-400' : 'text-green-400'}`}>
          {zone.isLocked ? 'Bloqueada' : 'Activa'}
        </span></p>
      </div>
    </div>
  );
}