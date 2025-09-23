'use client';

import React from 'react';
import { type EffectZone } from '../../state/useWorldStore';

interface EffectZoneCardProps {
  zone: EffectZone;
  onRemove: (zoneId: string) => void;
}

export function EffectZoneCard({ zone, onRemove }: EffectZoneCardProps) {
  const handleRemove = () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta zona de efecto?')) {
      onRemove(zone.id);
    }
  };

  return (
    <div className="mb-4 relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-black to-pink-500 shadow-lg shadow-black/50" />
          <h3 className="text-lg font-semibold text-white">
            Editor de Zona de Efecto
          </h3>
        </div>
        <button
          onClick={handleRemove}
          className="px-3 py-2 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-500/90 hover:to-red-600/90 text-white text-sm rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 border border-red-400/30 hover:border-red-300/50"
          title="Eliminar zona de efecto"
        >
          🗑️
        </button>
      </div>
      <div className="text-sm text-gray-400">
        <p>Tipo: <span className="text-white">{zone.type}</span></p>
        <p>Forma: <span className="text-white capitalize">{zone.shape}</span></p>
        <p>ID: <span className="text-white font-mono text-xs">{zone.id.slice(0, 8)}...</span></p>
      </div>
    </div>
  );
}
