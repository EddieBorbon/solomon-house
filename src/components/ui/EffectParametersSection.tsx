'use client';

import React from 'react';
import { type EffectZone } from '../../state/useWorldStore';

interface EffectParametersSectionProps {
  zone: EffectZone;
  isUpdatingParams: boolean;
  lastUpdatedParam: string | null;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function EffectParametersSection({ 
  zone, 
  isUpdatingParams, 
  lastUpdatedParam, 
  onEffectParamChange 
}: EffectParametersSectionProps) {
  // No renderizar para efectos que tienen sus propios componentes específicos
  const excludedTypes = ['phaser', 'autoFilter', 'autoWah', 'chebyshev', 'chorus', 'distortion', 'feedbackDelay', 'freeverb', 'frequencyShifter', 'jcReverb', 'pingPongDelay', 'pitchShift', 'reverb', 'stereoWidener', 'tremolo', 'vibrato'];
  if (excludedTypes.includes(zone?.type || '')) return null;
  
  const getEffectTypeColor = (type: string) => {
    switch (type) {
      case 'phaser': return 'text-purple-400';
      case 'autoFilter': return 'text-green-400';
      case 'autoWah': return 'text-orange-400';
      case 'bitCrusher': return 'text-red-400';
      case 'chebyshev': return 'text-indigo-400';
      default: return 'text-teal-400';
    }
  };

  const getEffectTypeName = (type: string) => {
    switch (type) {
      case 'phaser': return 'Phaser';
      case 'autoFilter': return 'AutoFilter';
      case 'autoWah': return 'AutoWah';
      case 'bitCrusher': return 'BitCrusher';
      case 'chebyshev': return 'Chebyshev';
      default: return 'Chorus';
    }
  };

  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 flex items-center justify-center gap-2 text-white">
        {getEffectTypeName(zone.type).toUpperCase()}_PARAMETERS
        {isUpdatingParams && (
          <span className="text-white animate-pulse">🔄</span>
        )}
      </h4>


      {/* Indicador de parámetro actualizado */}
      {lastUpdatedParam && (
        <div className="mb-3 p-2 bg-black border border-white rounded-lg">
          <p className="text-xs text-white text-center font-mono tracking-wider">
            ✅ PARAMETER <strong>{lastUpdatedParam.toUpperCase()}</strong> UPDATED_REALTIME
          </p>
        </div>
      )}
    </div>
  );
}
