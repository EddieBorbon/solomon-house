'use client';

import React from 'react';
import { type MobileObject } from '../../../state/useWorldStore';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MobileSphereControlsProps {
  mobileObject: MobileObject;
  onSphereTransformChange: (property: 'spherePosition' | 'sphereRotation' | 'sphereScale', axis: 0 | 1 | 2, value: number) => void;
  onResetSphereTransform: () => void;
  roundToDecimals: (value: number) => number;
}

export function MobileSphereControls({
  mobileObject,
  onSphereTransformChange,
  onResetSphereTransform,
  roundToDecimals
}: MobileSphereControlsProps) {
  const { t } = useLanguage();
  const spherePosition = mobileObject.mobileParams.spherePosition || [0, 0, 0];
  const sphereRotation = mobileObject.mobileParams.sphereRotation || [0, 0, 0];
  const sphereScale = mobileObject.mobileParams.sphereScale || [1, 1, 1];

  return (
    <div className="relative border border-white p-4">
      {/* Decoraciones de esquina */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-mono font-bold text-white tracking-wider">
          {t('mobileObject.transformacionesEsfera')}
        </h4>
        <button
          onClick={onResetSphereTransform}
          className="relative border border-white px-2 py-1 text-xs font-mono text-white hover:bg-white hover:text-black transition-all duration-300"
        >
          {t('parameterEditor.reset')}
        </button>
      </div>

      {/* Posición de la esfera */}
      <div className="mb-4">
        <h5 className="text-xs font-mono font-bold text-gray-400 mb-2 tracking-wider">
          {t('mobileObject.posicionEsfera')}
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
                  value={spherePosition[index]}
                  onChange={(e) => onSphereTransformChange('spherePosition', index as 0 | 1 | 2, parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                  {roundToDecimals(spherePosition[index])}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rotación de la esfera */}
      <div className="mb-4">
        <h5 className="text-xs font-mono font-bold text-gray-400 mb-2 tracking-wider">
          {t('mobileObject.rotacionEsfera')}
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
                  value={sphereRotation[index]}
                  onChange={(e) => onSphereTransformChange('sphereRotation', index as 0 | 1 | 2, parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                  {roundToDecimals(sphereRotation[index])}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escala de la esfera */}
      <div>
        <h5 className="text-xs font-mono font-bold text-gray-400 mb-2 tracking-wider">
          {t('mobileObject.escalaEsfera')}
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
                  value={sphereScale[index]}
                  onChange={(e) => onSphereTransformChange('sphereScale', index as 0 | 1 | 2, parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                  {roundToDecimals(sphereScale[index])}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

