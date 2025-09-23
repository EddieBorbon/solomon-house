'use client';

import React from 'react';

interface RefreshEffectsButtonProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function RefreshEffectsButton({ isRefreshing, onRefresh }: RefreshEffectsButtonProps) {
  const handleRefresh = () => {
    console.log('🔄 Forzando actualización de todos los efectos...');
    onRefresh();
  };

  return (
    <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
      <div className="text-center">
        <button
          onClick={handleRefresh}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refrescar todos los efectos para asegurar que los cambios se apliquen"
          disabled={isRefreshing}
        >
          {isRefreshing ? '🔄 Refrescando...' : '🔄 Refrescar Efectos'}
        </button>
        <p className="text-xs text-blue-400 mt-1 text-center">
          Fuerza la actualización de todos los efectos para asegurar que los cambios se apliquen en tiempo real
        </p>
      </div>
    </div>
  );
}
