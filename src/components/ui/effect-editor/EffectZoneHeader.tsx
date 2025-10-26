'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { useLanguage } from '../../../contexts/LanguageContext';

interface EffectZoneHeaderProps {
  zone: EffectZone;
  onRemove: (id: string) => void;
  onToggleLock: (id: string) => void;
}

export function EffectZoneHeader({
  zone,
  onRemove,
  onToggleLock
}: EffectZoneHeaderProps) {
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleLock(zone.id)}
              className={`relative border border-white p-2 text-white hover:bg-white hover:text-black transition-all duration-300 group ${
                zone.isLocked ? 'bg-white text-black' : ''
              }`}
              title={zone.isLocked ? "Desbloquear zona" : "Bloquear zona"}
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <div className="relative w-4 h-4 flex items-center justify-center">
                {zone.isLocked ? (
                  <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                ) : (
                  <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
                  </svg>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                if (confirm(t('confirmations.deleteEffectZone'))) {
                  onRemove(zone.id);
                }
              }}
              className="relative border border-white p-2 text-white hover:bg-white hover:text-black transition-all duration-300 group"
              title={t('titles.deleteEffectZone')}
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <div className="relative w-4 h-4 flex items-center justify-center">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </div>
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