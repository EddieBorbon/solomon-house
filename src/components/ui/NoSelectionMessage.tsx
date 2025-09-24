'use client';

import React from 'react';

export function NoSelectionMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h3 className="text-lg font-semibold text-white mb-3">
        Selecciona un Objeto
      </h3>
      <p className="text-sm text-gray-400 mb-4 px-4">
        Haz clic en cualquier objeto de sonido o zona de efecto para editarlo
      </p>
      <div className="text-xs text-gray-500">
        Los objetos aparecen en la escena 3D
      </div>
    </div>
  );
}
