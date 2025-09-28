'use client';

import React from 'react';
import { type SoundObject, useWorldStore } from '../../state/useWorldStore';

interface AudioControlSectionProps {
  selectedObject: SoundObject;
}

export function AudioControlSection({ selectedObject }: AudioControlSectionProps) {
  return (
    <div className="mb-6 relative">
      {/* Contenedor con borde complejo */}
      <div className="relative border border-white p-4">
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
        
        <div className="text-center">
          <div className={`w-8 h-8 mx-auto mb-2 border border-white flex items-center justify-center ${
            selectedObject.type === 'cone' ? 'bg-white' :
            selectedObject.type === 'cube' ? 'bg-gray-300' :
            selectedObject.type === 'sphere' ? 'bg-gray-400' :
            selectedObject.type === 'cylinder' ? 'bg-gray-500' :
            selectedObject.type === 'pyramid' ? 'bg-gray-600' :
            selectedObject.type === 'icosahedron' ? 'bg-gray-700' :
            selectedObject.type === 'torus' ? 'bg-gray-800' : 
            selectedObject.type === 'dodecahedronRing' ? 'bg-gray-900' :
            selectedObject.type === 'spiral' ? 'bg-white' : 'bg-gray-500'
          }`}>
            <span className="text-sm font-mono font-bold"
              style={{ 
                color: selectedObject.type === 'cone' || selectedObject.type === 'spiral' ? '#000000' : '#FFFFFF'
              }}>
              {selectedObject.type === 'cone' ? 'M' :
               selectedObject.type === 'cube' ? 'AM' :
               selectedObject.type === 'sphere' ? 'FM' :
               selectedObject.type === 'cylinder' ? 'DS' :
               selectedObject.type === 'pyramid' ? 'MS' :
               selectedObject.type === 'icosahedron' ? 'MT' :
               selectedObject.type === 'torus' ? 'PS' : 
               selectedObject.type === 'dodecahedronRing' ? 'PL' :
               selectedObject.type === 'spiral' ? 'SP' : '?'}
            </span>
          </div>
          <span className="text-xs font-mono text-white tracking-wider">
            {selectedObject.type === 'cone' ? 'MEMBRANE_SYNTH' :
             selectedObject.type === 'cube' ? 'AM_SYNTHESIS' :
             selectedObject.type === 'sphere' ? 'FM_SYNTHESIS' :
             selectedObject.type === 'cylinder' ? 'DUO_SYNTH' :
             selectedObject.type === 'pyramid' ? 'MONO_SYNTH' :
             selectedObject.type === 'icosahedron' ? 'METAL_SYNTH' :
             selectedObject.type === 'plane' ? 'NOISE_SYNTH' :
             selectedObject.type === 'torus' ? 'PLUCK_SYNTH' : 
             selectedObject.type === 'dodecahedronRing' ? 'POLY_SYNTH' :
             selectedObject.type === 'spiral' ? 'SAMPLER' : 'SOUND_OBJECT'}
          </span>
        
        {/* Texto informativo específico para cada tipo */}
        {selectedObject.type === 'pyramid' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {selectedObject.audioParams.duration === Infinity 
                ? 'CLICK_TO_TOGGLE_CONTINUOUS_AUDIO'
                : 'HOLD_CLICK_ON_OBJECT_FOR_GATE_CONTROL'
              }
            </p>
          </div>
        ) : selectedObject.type === 'icosahedron' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              CLICK_OBJECT_TO_PLAY
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              METALLIC_PERCUSSIVE_SOUND
            </p>
          </div>
        ) : selectedObject.type === 'plane' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              CLICK_OBJECT_TO_PLAY
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              PERCUSSIVE_NOISE_GENERATOR
            </p>
          </div>
        ) : selectedObject.type === 'torus' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              CLICK_OBJECT_TO_PLAY
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              PERCUSSIVE_STRING_INSTRUMENT
            </p>
          </div>
        ) : selectedObject.type === 'dodecahedronRing' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              CLICK_TO_TOGGLE_CONTINUOUS_CHORD
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              POLYPHONIC_CHORD_INSTRUMENT
            </p>
          </div>
        ) : selectedObject.type === 'spiral' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              CLICK_OBJECT_TO_PLAY
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              POLYPHONIC_PERCUSSIVE_SAMPLER
            </p>
          </div>
        ) : selectedObject.type === 'cone' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              CLICK_OBJECT_TO_PLAY
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              PERCUSSIVE_DRUM_SYNTHESIZER
            </p>
          </div>
        ) : (selectedObject.type as string) === 'icosahedron' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              CLICK_OBJECT_TO_PLAY
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              PERCUSSIVE_METAL_SYNTHESIZER
            </p>
          </div>
        ) : (selectedObject.type as string) === 'torus' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              CLICK_OBJECT_TO_PLAY
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              PERCUSSIVE_PLUCK_SYNTHESIZER
            </p>
          </div>
        ) : (
         <div className="mt-2">
           <p className="text-xs font-mono text-white tracking-wider mt-1">
             CONTINUOUS_AUDIO_CONTROL
           </p>
           <p className="text-xs font-mono text-white tracking-wider mt-1">
             DURATION: {(selectedObject.audioParams.duration || 1.0).toFixed(1)}S
           </p>
         </div>
        )}
        
        {/* Botón de activación/desactivación de audio - No disponible para sintetizadores percusivos */}
        {selectedObject.type !== 'cone' && selectedObject.type !== 'icosahedron' && selectedObject.type !== 'torus' && selectedObject.type !== 'plane' && (
          <div className="mt-4">
            <button
              onClick={() => {
                const { toggleObjectAudio } = useWorldStore.getState();
                toggleObjectAudio(selectedObject.id);
              }}
              className={`relative w-full py-2 px-4 border border-white hover:bg-white hover:text-black transition-all duration-300 group ${
                selectedObject.audioEnabled ? 'bg-white' : 'bg-black'
              }`}
              style={{ 
                color: selectedObject.audioEnabled ? '#000000' : '#FFFFFF'
              }}
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">
                {selectedObject.audioEnabled ? 'DEACTIVATE_CONTINUOUS_AUDIO' : 'ACTIVATE_CONTINUOUS_AUDIO'}
              </span>
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
