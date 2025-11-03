'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/factories/SoundSourceFactory';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface SoundObjectMovementControlsProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

/**
 * Componente para los controles de movimiento de objetos sonoros
 * Similar a MobileMovementControls pero integrado en objetos sonoros
 */
export function SoundObjectMovementControls({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedObject: _selectedObject,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onParamChange: _onParamChange
}: SoundObjectMovementControlsProps) {
  const { t } = useLanguage();

  // Mostrar mensaje de "En Desarrollo" y deshabilitar controles
  return (
    <div className="relative border border-yellow-500 p-4 mb-4 bg-yellow-900/20">
      {/* Decoraciones de esquina */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-yellow-500"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-yellow-500"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-yellow-500"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-yellow-500"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center flex items-center justify-center">
        {t('parameterEditor.movementProperties')}
      </h4>
      
      <div className="text-center space-y-2">
        <h3 className="text-sm font-mono font-bold text-yellow-400 tracking-wider">
          {t('parameterEditor.inDevelopment')}
        </h3>
        <p className="text-xs font-mono text-yellow-300">
          Esta funcionalidad está en desarrollo y estará disponible próximamente.
        </p>
      </div>

      {/* Controles deshabilitados con overlay */}
      <div className="opacity-30 pointer-events-none mt-4">
        {/* Los controles están ocultos y deshabilitados */}
      </div>
    </div>
  );
}

