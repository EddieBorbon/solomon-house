'use client';

import React from 'react';
import { type SoundObject, useWorldStore } from '../../state/useWorldStore';
import { useLanguage } from '../../contexts/LanguageContext';

interface AudioControlSectionProps {
  selectedObject: SoundObject;
}

export function AudioControlSection({ selectedObject }: AudioControlSectionProps) {
  const { t } = useLanguage();
  
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
            {selectedObject.type === 'cone' ? t('parameterEditor.membraneSynth') :
             selectedObject.type === 'cube' ? t('parameterEditor.amSynthesis') :
             selectedObject.type === 'sphere' ? t('parameterEditor.fmSynthesis') :
             selectedObject.type === 'cylinder' ? t('parameterEditor.duoSynth') :
             selectedObject.type === 'pyramid' ? t('parameterEditor.monoSynth') :
             selectedObject.type === 'icosahedron' ? t('parameterEditor.metalSynth') :
             selectedObject.type === 'plane' ? t('parameterEditor.noiseSynth') :
             selectedObject.type === 'torus' ? t('parameterEditor.pluckSynth') : 
             selectedObject.type === 'dodecahedronRing' ? t('parameterEditor.polySynth') :
             selectedObject.type === 'spiral' ? t('parameterEditor.sampler') : t('parameterEditor.soundObject')}
          </span>
        
        {/* Texto informativo específico para cada tipo */}
        {selectedObject.type === 'pyramid' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {selectedObject.audioParams.duration === Infinity 
                ? t('parameterEditor.clickToToggleContinuousAudio')
                : t('parameterEditor.holdClickOnObjectForGateControl')
              }
            </p>
          </div>
        ) : selectedObject.type === 'icosahedron' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.clickObjectToPlay')}
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.metallicPercussiveSound')}
            </p>
          </div>
        ) : selectedObject.type === 'plane' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.clickObjectToPlay')}
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.percussiveNoiseGenerator')}
            </p>
          </div>
        ) : selectedObject.type === 'torus' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.clickObjectToPlay')}
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.percussiveStringInstrument')}
            </p>
          </div>
        ) : selectedObject.type === 'dodecahedronRing' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.clickToToggleContinuousChord')}
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.polyphonicChordInstrument')}
            </p>
          </div>
        ) : selectedObject.type === 'spiral' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.clickObjectToPlay')}
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.polyphonicPercussiveSampler')}
            </p>
          </div>
        ) : selectedObject.type === 'cone' ? (
          <div className="mt-2">
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.clickObjectToPlay')}
            </p>
            <p className="text-xs font-mono text-white tracking-wider mt-1">
              {t('parameterEditor.percussiveDrumSynthesizer')}
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
             {t('parameterEditor.continuousAudioControl')}
           </p>
           <p className="text-xs font-mono text-white tracking-wider mt-1">
             {t('parameterEditor.duration')} {(selectedObject.audioParams.duration || 1.0).toFixed(1)}S
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
                {selectedObject.audioEnabled ? t('parameterEditor.deactivateContinuousAudio') : t('parameterEditor.activateContinuousAudio')}
              </span>
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
