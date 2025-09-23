'use client';

import React from 'react';

export function NoSelectionMessage() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm">
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Selecciona un Objeto
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Haz clic en cualquier objeto de sonido o zona de efecto para editarlo
          </p>
          <div className="text-xs text-gray-500">
            Los objetos aparecen en la escena 3D
          </div>
        </div>
      </div>
    </div>
  );
}
