'use client';

import React from 'react';
import { type MobileObject } from '../../../state/useWorldStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { InfoTooltip } from '../InfoTooltip';

interface MobileMovementControlsProps {
  mobileObject: MobileObject;
  onParamChange: (param: keyof MobileObject['mobileParams'], value: unknown) => void;
}

export function MobileMovementControls({
  mobileObject,
  onParamChange
}: MobileMovementControlsProps) {
  const { t } = useLanguage();
  const { mobileParams } = mobileObject;
  
  // Valores por defecto para evitar errores de undefined
  const safeParams = {
    radius: mobileParams?.radius ?? 2,
    speed: mobileParams?.speed ?? 1,
    proximityThreshold: mobileParams?.proximityThreshold ?? 1.5,
    isActive: mobileParams?.isActive ?? true,
    height: mobileParams?.height ?? 1,
    heightSpeed: mobileParams?.heightSpeed ?? 0.5,
    showRadiusIndicator: mobileParams?.showRadiusIndicator ?? true,
    showProximityIndicator: mobileParams?.showProximityIndicator ?? true,
    showSphere: mobileParams?.showSphere ?? true,
    movementType: mobileParams?.movementType ?? 'circular',
    direction: mobileParams?.direction ?? [1, 0, 0],
    amplitude: mobileParams?.amplitude ?? 0.5,
    frequency: mobileParams?.frequency ?? 1,
    randomSeed: mobileParams?.randomSeed ?? 0,
  };

  return (
    <div className="space-y-4">
      {/* Control de activación */}
      <div className="relative border border-white p-4">
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
        
        <h4 className="text-sm font-mono font-bold text-white mb-3 tracking-wider">
          {t('mobileObject.controlActivacion')}
        </h4>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 flex items-center">
            {t('mobileObject.activo')}
            <InfoTooltip content={t('mobileObject.tooltips.isActive')} />
          </span>
          <button
            onClick={() => onParamChange('isActive', !safeParams.isActive)}
            className={`relative border border-white px-3 py-1 text-xs font-mono transition-all duration-300 ${
              safeParams.isActive 
                ? 'bg-green-400 text-black border-green-400' 
                : 'text-white hover:bg-white hover:text-black'
            }`}
          >
            {safeParams.isActive ? t('mobileObject.on') : t('mobileObject.off')}
          </button>
        </div>
      </div>

      {/* Tipo de movimiento */}
      <div className="relative border border-white p-4">
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
        
        <h4 className="text-sm font-mono font-bold text-white mb-3 tracking-wider flex items-center">
          {t('mobileObject.tipoMovimiento')}
          <InfoTooltip content={t('mobileObject.tooltips.movementType')} />
        </h4>
        
        <div className="space-y-2">
          {(['circular', 'polar', 'random', 'figure8', 'spiral'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onParamChange('movementType', type)}
              className={`w-full text-left px-3 py-2 text-xs font-mono border transition-all duration-300 ${
                safeParams.movementType === type
                  ? 'border-cyan-400 bg-cyan-400 text-black'
                  : 'border-white text-white hover:bg-white hover:text-black'
              }`}
            >
              {t(`mobileObject.${type}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Parámetros básicos */}
      <div className="relative border border-white p-4">
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
        
        <h4 className="text-sm font-mono font-bold text-white mb-3 tracking-wider">
          {t('mobileObject.parametrosBasicos')}
        </h4>
        
        <div className="space-y-3">
          {/* Radio */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 flex items-center">
              {t('mobileObject.radio')}
              <InfoTooltip content={t('mobileObject.tooltips.radius')} />
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={safeParams.radius}
                onChange={(e) => onParamChange('radius', parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                {safeParams.radius.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Velocidad */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 flex items-center">
              {t('mobileObject.velocidad')}
              <InfoTooltip content={t('mobileObject.tooltips.speed')} />
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={safeParams.speed}
                onChange={(e) => onParamChange('speed', parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                {safeParams.speed.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Umbral de proximidad */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 flex items-center">
              {t('mobileObject.proximidad')}
              <InfoTooltip content={t('mobileObject.tooltips.proximityThreshold')} />
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={safeParams.proximityThreshold}
                onChange={(e) => onParamChange('proximityThreshold', parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                {safeParams.proximityThreshold.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Altura del movimiento vertical */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 flex items-center">
              {t('mobileObject.altura')}
              <InfoTooltip content={t('mobileObject.tooltips.height')} />
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={safeParams.height}
                onChange={(e) => onParamChange('height', parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                {safeParams.height.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Velocidad del movimiento vertical */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 flex items-center">
              {t('mobileObject.velAltura')}
              <InfoTooltip content={t('mobileObject.tooltips.heightSpeed')} />
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={safeParams.heightSpeed}
                onChange={(e) => onParamChange('heightSpeed', parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                {safeParams.heightSpeed.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Parámetros específicos según el tipo de movimiento */}
      {safeParams.movementType === 'polar' && (
        <div className="relative border border-white p-4">
          {/* Decoraciones de esquina */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
          
          <h4 className="text-sm font-mono font-bold text-white mb-3 tracking-wider">
            {t('mobileObject.parametrosPolares')}
          </h4>
          
          <div className="space-y-3">
            {/* Amplitud */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 flex items-center">
                {t('mobileObject.amplitud')}
                <InfoTooltip content={t('mobileObject.tooltips.amplitude')} />
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={safeParams.amplitude}
                  onChange={(e) => onParamChange('amplitude', parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                  {safeParams.amplitude.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Frecuencia */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 flex items-center">
                {t('mobileObject.frecuencia')}
                <InfoTooltip content={t('mobileObject.tooltips.frequency')} />
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={safeParams.frequency}
                  onChange={(e) => onParamChange('frequency', parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                  {safeParams.frequency.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {safeParams.movementType === 'random' && (
        <div className="relative border border-white p-4">
          {/* Decoraciones de esquina */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
          
          <h4 className="text-sm font-mono font-bold text-white mb-3 tracking-wider">
            {t('mobileObject.semillaAleatoria')}
          </h4>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 flex items-center">
              {t('mobileObject.semilla')}
              <InfoTooltip content={t('mobileObject.tooltips.randomSeed')} />
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1000"
                step="1"
                value={safeParams.randomSeed}
                onChange={(e) => onParamChange('randomSeed', parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-xs font-mono text-cyan-400 w-12 text-right">
                {safeParams.randomSeed}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Indicadores visuales */}
      <div className="relative border border-white p-4">
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
        
        <h4 className="text-sm font-mono font-bold text-white mb-3 tracking-wider">
          {t('mobileObject.indicadoresVisuales')}
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 flex items-center">
              {t('mobileObject.radio')}
              <InfoTooltip content={t('mobileObject.tooltips.showRadiusIndicator')} />
            </span>
            <button
              onClick={() => onParamChange('showRadiusIndicator', !safeParams.showRadiusIndicator)}
              className={`relative border border-white px-3 py-1 text-xs font-mono transition-all duration-300 ${
                safeParams.showRadiusIndicator 
                  ? 'bg-green-400 text-black border-green-400' 
                  : 'text-white hover:bg-white hover:text-black'
              }`}
            >
              {safeParams.showRadiusIndicator ? t('mobileObject.on') : t('mobileObject.off')}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 flex items-center">
              {t('mobileObject.proximidad')}
              <InfoTooltip content={t('mobileObject.tooltips.showProximityIndicator')} />
            </span>
            <button
              onClick={() => onParamChange('showProximityIndicator', !safeParams.showProximityIndicator)}
              className={`relative border border-white px-3 py-1 text-xs font-mono transition-all duration-300 ${
                safeParams.showProximityIndicator 
                  ? 'bg-green-400 text-black border-green-400' 
                  : 'text-white hover:bg-white hover:text-black'
              }`}
            >
              {safeParams.showProximityIndicator ? t('mobileObject.on') : t('mobileObject.off')}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 flex items-center">
              {t('mobileObject.esfera')}
              <InfoTooltip content={t('mobileObject.tooltips.showSphere')} />
            </span>
            <button
              onClick={() => onParamChange('showSphere', !safeParams.showSphere)}
              className={`relative border border-white px-3 py-1 text-xs font-mono transition-all duration-300 ${
                safeParams.showSphere 
                  ? 'bg-green-400 text-black border-green-400' 
                  : 'text-white hover:bg-white hover:text-black'
              }`}
            >
              {safeParams.showSphere ? t('mobileObject.on') : t('mobileObject.off')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
