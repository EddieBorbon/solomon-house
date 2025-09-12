'use client';

import React, { useState } from 'react';

export function CameraControlsHelp() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black/80 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl p-2 text-white hover:bg-white/10 transition-colors"
        title="Mostrar controles de cámara"
      >
        ⌨️
      </button>
      
      {isVisible && (
        <div className="absolute top-12 right-0 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl p-4 min-w-[200px]">
          <div className="text-white text-sm space-y-2">
            <div className="font-semibold text-cyan-400 mb-2">Controles de Cámara</div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>W</span>
                <span className="text-gray-400">Adelante</span>
              </div>
              <div className="flex justify-between">
                <span>S</span>
                <span className="text-gray-400">Atrás</span>
              </div>
              <div className="flex justify-between">
                <span>A</span>
                <span className="text-gray-400">Izquierda</span>
              </div>
              <div className="flex justify-between">
                <span>D</span>
                <span className="text-gray-400">Derecha</span>
              </div>
              <div className="flex justify-between">
                <span>Q</span>
                <span className="text-gray-400">Abajo</span>
              </div>
              <div className="flex justify-between">
                <span>E</span>
                <span className="text-gray-400">Arriba</span>
              </div>
              <div className="flex justify-between">
                <span>Shift</span>
                <span className="text-gray-400">Rápido</span>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="text-xs text-gray-400">
                Mouse: Rotar, Zoom, Panear
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
