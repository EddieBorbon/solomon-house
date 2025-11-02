'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { useLanguage } from '../../../contexts/LanguageContext';

interface EffectZoneHeaderProps {
  zone: EffectZone;
  onRemove: (id: string) => void;
  onToggleLock: (id: string) => void;
  onUpdateZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => void;
}

export function EffectZoneHeader({
  zone,
  onRemove,
  onToggleLock,
  onUpdateZone
}: EffectZoneHeaderProps) {
  const { t } = useLanguage();
  
  // Usar las propiedades individuales de la zona, con true por defecto
  const showWireframe = zone.showWireframe !== undefined ? zone.showWireframe : true;
  const showColor = zone.showColor !== undefined ? zone.showColor : true;
  
  const handleToggleWireframe = () => {
    onUpdateZone(zone.id, { showWireframe: !showWireframe });
  };
  
  const handleToggleColor = () => {
    onUpdateZone(zone.id, { showColor: !showColor });
  };
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
              {t('effects.effectZoneEditor')}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleLock(zone.id)}
              className={`relative border border-white p-2 text-white hover:bg-white hover:text-black transition-all duration-300 group ${
                zone.isLocked ? 'bg-white text-black' : ''
              }`}
              title={zone.isLocked ? t('effects.unlockZone') : t('effects.lockZone')}
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
        
        {/* Botones de control visual - debajo del botón de eliminar */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleToggleWireframe}
            className={`relative border border-white px-3 py-2 text-xs font-mono hover:bg-white transition-all duration-300 group flex-1 ${
              showWireframe ? 'bg-white' : 'bg-black'
            }`}
            title={showWireframe ? t('effects.hideWireframe') : t('effects.showWireframe')}
          >
            <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300 pointer-events-none"></div>
            <span className={`relative flex items-center justify-center gap-2 tracking-wider z-10 ${
              showWireframe ? 'text-black' : 'text-white'
            }`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3 h-3" strokeWidth="1.5">
                <path d="M3 8L8 3M21 8L16 3M3 16L8 21M21 16L16 21" strokeLinecap="round"/>
                <path d="M3 8V16M21 8V16M8 3V21M16 3V21" strokeLinecap="round"/>
              </svg>
              {t('effects.wireframe')}
            </span>
          </button>
          <button
            onClick={handleToggleColor}
            className={`relative border border-white px-3 py-2 text-xs font-mono hover:bg-white transition-all duration-300 group flex-1 ${
              showColor ? 'bg-white' : 'bg-black'
            }`}
            title={showColor ? t('effects.hideColor') : t('effects.showColor')}
          >
            <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300 pointer-events-none"></div>
            <span className={`relative flex items-center justify-center gap-2 tracking-wider z-10 ${
              showColor ? 'text-black' : 'text-white'
            }`}>
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
              </svg>
              {t('effects.color')}
            </span>
          </button>
        </div>
        <div className="text-xs font-mono text-gray-300 tracking-wider">
          <p><span className="text-white">{t('effects.effect')}:</span> {zone.type.toUpperCase()}</p>
          <p><span className="text-white">ID:</span> {zone.id.slice(0, 8).toUpperCase()}...</p>
          <p><span className="text-white">{t('effects.status')}:</span> <span className={`${zone.isLocked ? 'text-gray-300' : 'text-white'}`}>
            {zone.isLocked ? t('effects.locked') : t('effects.active')}
          </span></p>
        </div>
      </div>
    </div>
  );
}