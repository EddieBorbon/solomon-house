'use client';

import React from 'react';
import { type EffectZone } from '../../state/useWorldStore';

interface LockControlProps {
  zone: EffectZone;
  onToggleLock: (zoneId: string) => void;
}

export function LockControl({ zone, onToggleLock }: LockControlProps) {
  const handleToggleLock = () => {
    onToggleLock(zone.id);
  };

  return (
    <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
      <div className="text-center">
        <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
          zone.isLocked ? 'bg-red-500' : 'bg-purple-500'
        }`}>
          <span className="text-lg">
            {zone.isLocked ? '🔒' : '🔓'}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-300">
          {zone.isLocked ? 'Zona Bloqueada' : 'Zona Desbloqueada'}
        </span>
        
        <div className="mt-4">
          <button
            onClick={handleToggleLock}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              zone.isLocked
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {zone.isLocked ? '🔓 Desbloquear Zona' : '🔒 Bloquear Zona'}
          </button>
          <p className="text-xs text-gray-400 mt-1 text-center">
            {zone.isLocked 
              ? 'La zona está protegida contra cambios. Haz clic para desbloquear.'
              : 'La zona puede ser modificada. Haz clic para bloquear.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
