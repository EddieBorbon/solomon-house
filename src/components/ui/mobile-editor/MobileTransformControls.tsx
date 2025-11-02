'use client';

import React from 'react';
import { type MobileObject } from '../../../state/useWorldStore';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MobileTransformControlsProps {
  mobileObject: MobileObject;
  onTransformChange: (property: 'position' | 'rotation' | 'scale', axis: 0 | 1 | 2, value: number) => void;
  onResetTransform: () => void;
  roundToDecimals: (value: number) => number;
}

export function MobileTransformControls({
  mobileObject,
  onTransformChange,
  onResetTransform,
  roundToDecimals
}: MobileTransformControlsProps) {
  const { t } = useLanguage();
  
  return (
    <div className="relative border border-white p-4">
      {/* Decoraciones de esquina */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-mono font-bold text-white tracking-wider">
          {t('mobileObject.transformacionesGrupo')}
        </h4>
        <button
          onClick={onResetTransform}
          className="relative border border-white px-2 py-1 text-xs font-mono text-white hover:bg-white hover:text-black transition-all duration-300"
        >
          {t('parameterEditor.reset')}
        </button>
      </div>

      {/* Posición */}
      <div className="mb-4">
        <h5 className="text-xs font-mono font-bold text-gray-400 mb-2 tracking-wider">
          {t('mobileObject.posicion')}
        </h5>
        <div className="space-y-2">
          {(['X', 'Y', 'Z'] as const).map((axis, index) => (
            <div key={axis} className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 w-4">{axis}:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={(typeof mobileObject.position[index] === 'number' && !isNaN(mobileObject.position[index])) ? mobileObject.position[index] : 0}
                  onChange={(e) => onTransformChange('position', index as 0 | 1 | 2, parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                  {roundToDecimals((typeof mobileObject.position[index] === 'number' && !isNaN(mobileObject.position[index])) ? mobileObject.position[index] : 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rotación */}
      <div className="mb-4">
        <h5 className="text-xs font-mono font-bold text-gray-400 mb-2 tracking-wider">
          {t('mobileObject.rotacion')}
        </h5>
        <div className="space-y-2">
          {(['X', 'Y', 'Z'] as const).map((axis, index) => (
            <div key={axis} className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 w-4">{axis}:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-3.14"
                  max="3.14"
                  step="0.1"
                  value={(typeof mobileObject.rotation[index] === 'number' && !isNaN(mobileObject.rotation[index])) ? mobileObject.rotation[index] : 0}
                  onChange={(e) => onTransformChange('rotation', index as 0 | 1 | 2, parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                  {roundToDecimals((typeof mobileObject.rotation[index] === 'number' && !isNaN(mobileObject.rotation[index])) ? mobileObject.rotation[index] : 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escala */}
      <div>
        <h5 className="text-xs font-mono font-bold text-gray-400 mb-2 tracking-wider">
          {t('mobileObject.escala')}
        </h5>
        <div className="space-y-2">
          {(['X', 'Y', 'Z'] as const).map((axis, index) => (
            <div key={axis} className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 w-4">{axis}:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={(typeof mobileObject.scale[index] === 'number' && !isNaN(mobileObject.scale[index])) ? mobileObject.scale[index] : 1}
                  onChange={(e) => onTransformChange('scale', index as 0 | 1 | 2, parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                  {roundToDecimals((typeof mobileObject.scale[index] === 'number' && !isNaN(mobileObject.scale[index])) ? mobileObject.scale[index] : 1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
