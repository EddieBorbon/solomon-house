'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface PitchShiftParamsProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function PitchShiftParams({ zone, onEffectParamChange }: PitchShiftParamsProps) {
  if (zone?.type !== 'pitchShift') return null;

  return (
    <>
      {/* Pitch */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Pitch (Semi-tonos): {zone?.effectParams.pitchShift ?? 0}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="-24"
            max="24"
            step="1"
            value={zone?.effectParams.pitchShift ?? 0}
            onChange={(e) => onEffectParamChange('pitchShift', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.pitchShift ?? 0}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>-24 (2 octavas abajo)</span>
          <span>+24 (2 octavas arriba)</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Intervalo de transposición en semi-tonos
        </p>
      </div>

      {/* Window Size */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Window Size ({zone?.effectParams.windowSize ?? 0.1}s)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.03"
            max="0.1"
            step="0.01"
            value={zone?.effectParams.windowSize ?? 0.1}
            onChange={(e) => onEffectParamChange('windowSize', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.windowSize ?? 0.1}s
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.03s</span>
          <span>0.1s</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Tamaño de ventana para el pitch shifting (menor = menos delay, mayor = más suave)
        </p>
      </div>

      {/* Delay Time */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Delay Time ({zone?.effectParams.delayTime ?? 0}s)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={zone?.effectParams.delayTime ?? 0}
            onChange={(e) => onEffectParamChange('delayTime', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {zone?.effectParams.delayTime ?? 0}s
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0s</span>
          <span>1s</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Tiempo de delay en la señal de entrada
        </p>
      </div>

      {/* Feedback */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Feedback ({(zone?.effectParams.feedback ?? 0) * 100}%)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.05"
            value={zone?.effectParams.feedback ?? 0}
            onChange={(e) => onEffectParamChange('feedback', Number(e.target.value))}
            className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
            disabled={zone?.isLocked}
          />
          <span className="text-white font-mono text-xs min-w-[3rem] text-right">
            {Math.round((zone?.effectParams.feedback ?? 0) * 100)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>90%</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Cantidad de señal que se retroalimenta
        </p>
      </div>
    </>
  );
}
