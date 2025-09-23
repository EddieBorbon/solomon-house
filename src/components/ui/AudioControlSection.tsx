'use client';

import React from 'react';
import { type SoundObject, useWorldStore } from '../../state/useWorldStore';

interface AudioControlSectionProps {
  selectedObject: SoundObject;
  onRemove: (id: string) => void;
}

export function AudioControlSection({ selectedObject, onRemove }: AudioControlSectionProps) {
  return (
    <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
      <div className="text-center">
        <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
          selectedObject.type === 'cone' ? 'bg-orange-500' :
          selectedObject.type === 'cube' ? 'bg-blue-500' :
          selectedObject.type === 'sphere' ? 'bg-purple-500' :
          selectedObject.type === 'cylinder' ? 'bg-green-500' :
          selectedObject.type === 'pyramid' ? 'bg-red-500' :
          selectedObject.type === 'icosahedron' ? 'bg-indigo-500' :
          selectedObject.type === 'torus' ? 'bg-cyan-500' : 
          selectedObject.type === 'dodecahedronRing' ? 'bg-pink-500' :
          selectedObject.type === 'spiral' ? 'bg-cyan-500' : 'bg-gray-500'
        }`}>
          <span className="text-lg">
            {selectedObject.type === 'cone' ? '🥁' :
             selectedObject.type === 'cube' ? '🔷' :
             selectedObject.type === 'sphere' ? '🔮' :
             selectedObject.type === 'cylinder' ? '🔶' :
             selectedObject.type === 'pyramid' ? '🔺' :
             selectedObject.type === 'icosahedron' ? '🔶' :
             selectedObject.type === 'torus' ? '🔄' : 
             selectedObject.type === 'dodecahedronRing' ? '🔷' :
             selectedObject.type === 'spiral' ? '🌀' : '❓'}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-300">
          {selectedObject.type === 'cone' ? 'MembraneSynth' :
           selectedObject.type === 'cube' ? 'Síntesis AM' :
           selectedObject.type === 'sphere' ? 'Síntesis FM' :
           selectedObject.type === 'cylinder' ? 'DuoSynth' :
           selectedObject.type === 'pyramid' ? 'MonoSynth' :
           selectedObject.type === 'icosahedron' ? 'MetalSynth' :
           selectedObject.type === 'plane' ? 'NoiseSynth' :
           selectedObject.type === 'torus' ? 'PluckSynth' : 
           selectedObject.type === 'dodecahedronRing' ? 'PolySynth' :
           selectedObject.type === 'spiral' ? 'Sampler' : 'Objeto de Sonido'}
        </span>
        
        {/* Texto informativo específico para cada tipo */}
        {selectedObject.type === 'pyramid' ? (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mt-1">
              {selectedObject.audioParams.duration === Infinity 
                ? 'Haz clic para activar/desactivar el sonido continuo'
                : 'Mantén presionado el clic sobre el objeto para tocar (gate)'
              }
            </p>
          </div>
        ) : selectedObject.type === 'icosahedron' ? (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mt-1">
              Haz clic en el objeto para tocar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Sonido percusivo metálico
            </p>
          </div>
        ) : selectedObject.type === 'plane' ? (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mt-1">
              Haz clic en el objeto para tocar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Generador de ruido percusivo
            </p>
          </div>
        ) : selectedObject.type === 'torus' ? (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mt-1">
              Haz clic en el objeto para tocar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Instrumento de cuerdas percusivo
            </p>
          </div>
        ) : selectedObject.type === 'dodecahedronRing' ? (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mt-1">
              Haz clic para activar/desactivar el acorde continuo
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Instrumento polifónico para acordes
            </p>
          </div>
        ) : selectedObject.type === 'spiral' ? (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mt-1">
              Haz clic en el objeto para tocar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Sampler percusivo polifónico
            </p>
          </div>
        ) : (
         <div className="mt-2">
           <p className="text-xs text-gray-400 mt-1">
             Control de Sonido Continuo
           </p>
           <p className="text-xs text-gray-400 mt-1">
             Duración: {(selectedObject.audioParams.duration || 1.0).toFixed(1)}s
           </p>
         </div>
        )}
        
        {/* Botón de activación/desactivación de audio */}
        <div className="mt-4">
          <button
            onClick={() => {
              const { toggleObjectAudio } = useWorldStore.getState();
              toggleObjectAudio(selectedObject.id);
            }}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              selectedObject.audioEnabled
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {selectedObject.audioEnabled ? '🔇 Desactivar Sonido Continuo' : '🔊 Activar Sonido Continuo'}
          </button>
          <p className="text-xs text-gray-400 mt-1 text-center">
            {selectedObject.audioEnabled 
              ? 'Sonido continuo activado. Haz clic para desactivar.'
              : 'Sonido continuo desactivado. Haz clic para activar.'
            }
          </p>
         <p className="text-xs text-blue-400 mt-2 text-center">
           💡 El botón controla el sonido continuo. Para sonidos cortos, haz clic en el objeto 3D.
         </p>
        </div>
      </div>
    </div>
  );
}
