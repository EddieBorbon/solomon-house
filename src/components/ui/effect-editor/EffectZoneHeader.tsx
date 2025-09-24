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
    <div className="mb-6 relative">
      {/* Contenedor con borde complejo */}
      <div className="relative border border-white p-4">
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 border border-white ${
              zone.type === 'phaser' ? 'bg-white' : 
              zone.type === 'autoFilter' ? 'bg-gray-300' : 
              zone.type === 'autoWah' ? 'bg-gray-400' :
              zone.type === 'bitCrusher' ? 'bg-gray-500' :
              zone.type === 'chebyshev' ? 'bg-gray-600' :
              zone.type === 'chorus' ? 'bg-gray-700' :
              zone.type === 'distortion' ? 'bg-gray-800' :
              zone.type === 'feedbackDelay' ? 'bg-gray-900' :
              zone.type === 'freeverb' ? 'bg-white' :
              zone.type === 'frequencyShifter' ? 'bg-gray-300' :
              zone.type === 'jcReverb' ? 'bg-gray-400' :
              zone.type === 'pingPongDelay' ? 'bg-gray-500' :
              zone.type === 'pitchShift' ? 'bg-gray-600' :
              zone.type === 'reverb' ? 'bg-gray-700' :
              zone.type === 'stereoWidener' ? 'bg-gray-800' :
              zone.type === 'tremolo' ? 'bg-gray-900' :
              zone.type === 'vibrato' ? 'bg-white' : 'bg-gray-500'
            }`} />
            <h3 className="text-sm font-mono font-bold text-white tracking-wider">
              002_EFFECT_ZONE_EDITOR
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onRefresh}
              disabled={isRefreshingEffects}
              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black disabled:opacity-50 transition-all duration-300 group"
              title="Actualizar efectos"
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">
                {isRefreshingEffects ? 'SYNC' : 'REFRESH'}
              </span>
            </button>
            <button
              onClick={() => onToggleLock(zone.id)}
              className={`relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group ${
                zone.isLocked ? 'bg-white text-black' : ''
              }`}
              title={zone.isLocked ? "Desbloquear zona" : "Bloquear zona"}
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">
                {zone.isLocked ? 'LOCK' : 'UNLOCK'}
              </span>
            </button>
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres eliminar esta zona de efecto?')) {
                  onRemove(zone.id);
                }
              }}
              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
              title="Eliminar zona de efecto"
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">DELETE</span>
            </button>
          </div>
        </div>
        <div className="text-xs font-mono text-gray-300 tracking-wider">
          <p><span className="text-white">EFFECT:</span> {zone.type.toUpperCase()}</p>
          <p><span className="text-white">ID:</span> {zone.id.slice(0, 8).toUpperCase()}...</p>
          <p><span className="text-white">STATUS:</span> <span className={`${zone.isLocked ? 'text-gray-300' : 'text-white'}`}>
            {zone.isLocked ? 'LOCKED' : 'ACTIVE'}
          </span></p>
        </div>
      </div>
    </div>
  );
}