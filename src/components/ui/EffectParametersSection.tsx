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



      {/* Parámetros específicos del efecto */}
      {zone.type === 'bitCrusher' && (
        <div className="space-y-6">
          {/* Bits parameter */}
          <div className="relative">
            <label className="futuristic-label block mb-3 text-white text-xs font-mono tracking-wider">
              BITS
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={16}
                step={1}
                value={zone.effectParams.bits ?? 8}
                onChange={(e) => onEffectParamChange('bits', Number(e.target.value))}
                className="futuristic-slider flex-1 h-2 bg-black border border-white rounded-lg appearance-none cursor-pointer"
                disabled={zone.isLocked}
                style={{
                  background: `linear-gradient(to right, #666666 0%, #666666 ${((zone.effectParams.bits ?? 8) - 1) / 15 * 100}%, #333333 ${((zone.effectParams.bits ?? 8) - 1) / 15 * 100}%, #333333 100%)`
                }}
              />
              <div className="bg-black border border-white px-3 py-1 min-w-[4rem] text-center">
                <span className="text-white font-mono text-sm tracking-wider">
                  {zone.effectParams.bits ?? 8}
                </span>
              </div>
            </div>
          </div>

          {/* Normalized Frequency parameter */}
          <div className="relative">
            <label className="futuristic-label block mb-3 text-white text-xs font-mono tracking-wider">
              FRECUENCIA_NORMALIZADA
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={zone.effectParams.normFreq ?? 0.5}
                onChange={(e) => onEffectParamChange('normFreq', Number(e.target.value))}
                className="futuristic-slider flex-1 h-2 bg-black border border-white rounded-lg appearance-none cursor-pointer"
                disabled={zone.isLocked}
                style={{
                  background: `linear-gradient(to right, #666666 0%, #666666 ${(zone.effectParams.normFreq ?? 0.5) * 100}%, #333333 ${(zone.effectParams.normFreq ?? 0.5) * 100}%, #333333 100%)`
                }}
              />
              <div className="bg-black border border-white px-3 py-1 min-w-[4rem] text-center">
                <span className="text-white font-mono text-sm tracking-wider">
                  {zone.effectParams.normFreq ?? 0.5}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
