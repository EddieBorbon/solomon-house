'use client';

import React, { useState, useEffect } from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';
import { FuturisticSlider } from '../../FuturisticSlider';
import { InfoTooltip } from '../../InfoTooltip';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface AutoTriggerParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | number[] | boolean) => void;
}

/**
 * Componente para los parámetros de auto-activación
 * Permite configurar que los objetos sonoros se activen automáticamente
 */
export function AutoTriggerParameters({
  selectedObject,
  onParamChange
}: AutoTriggerParametersProps) {
  const { t } = useLanguage();
  const [patternInput, setPatternInput] = useState(
    selectedObject.audioParams.autoTriggerPattern?.join(', ') || ''
  );

  // Sincronizar patternInput cuando cambia el objeto seleccionado
  useEffect(() => {
    setPatternInput(selectedObject.audioParams.autoTriggerPattern?.join(', ') || '');
  }, [selectedObject.audioParams.autoTriggerPattern]);

  const autoTrigger = selectedObject.audioParams.autoTrigger || false;
  const mode = selectedObject.audioParams.autoTriggerMode || 'fixed';
  const interval = selectedObject.audioParams.autoTriggerInterval || 1.0;
  const minInterval = selectedObject.audioParams.autoTriggerMin || 0.5;
  const maxInterval = selectedObject.audioParams.autoTriggerMax || 2.0;
  const pattern = selectedObject.audioParams.autoTriggerPattern || [];
  const patternLoop = selectedObject.audioParams.autoTriggerPatternLoop ?? true;

  const handlePatternChange = (value: string) => {
    setPatternInput(value);
    // Parsear el patrón como array de números
    const parsed = value
      .split(',')
      .map(v => parseFloat(v.trim()))
      .filter(v => !isNaN(v) && v > 0);
    
    if (parsed.length > 0) {
      onParamChange('autoTriggerPattern', parsed);
    }
  };

  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center flex items-center justify-center">
        {t('parameterEditor.autoTrigger')}
      </h4>

      {/* Toggle para activar/desactivar auto-activación */}
      <div className="mb-4">
        <label className="futuristic-label block mb-2 text-white text-xs flex items-center">
          {t('parameterEditor.autoTriggerEnabled')}
          <InfoTooltip content={t('parameterEditor.autoTriggerEnabledTooltip')} />
        </label>
        <button
          onClick={() => onParamChange('autoTrigger', !autoTrigger)}
          className={`w-full py-2 px-4 border border-white text-xs font-mono transition-colors ${
            autoTrigger
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-black text-white hover:bg-gray-900'
          }`}
        >
          {autoTrigger ? t('parameterEditor.enabled') : t('parameterEditor.disabled')}
        </button>
      </div>

      {/* Solo mostrar los demás controles si autoTrigger está activado */}
      {autoTrigger && (
        <>
          {/* Modo de auto-activación */}
          <div className="mb-4">
            <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
              {t('parameterEditor.autoTriggerMode')}
              <InfoTooltip content={t('parameterEditor.autoTriggerModeTooltip')} />
            </label>
            <select
              value={mode}
              onChange={(e) => onParamChange('autoTriggerMode', e.target.value)}
              className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-full h-8 focus:outline-none focus:border-gray-400"
            >
              <option value="fixed">{t('parameterEditor.autoTriggerFixed')}</option>
              <option value="random">{t('parameterEditor.autoTriggerRandom')}</option>
              <option value="pattern">{t('parameterEditor.autoTriggerPattern')}</option>
            </select>
          </div>

          {/* Controles según el modo */}
          {mode === 'fixed' && (
            <div className="mb-4">
              <FuturisticSlider
                label={t('parameterEditor.autoTriggerInterval')}
                value={interval * 1000}
                min={100}
                max={10000}
                step={100}
                onChange={(value) => onParamChange('autoTriggerInterval', value / 1000)}
                unit="s"
                displayValue={interval}
                tooltip={t('parameterEditor.autoTriggerIntervalTooltip')}
              />
            </div>
          )}

          {mode === 'random' && (
            <>
              <div className="mb-4">
                <FuturisticSlider
                  label={t('parameterEditor.autoTriggerMin')}
                  value={minInterval * 1000}
                  min={100}
                  max={5000}
                  step={100}
                  onChange={(value) => onParamChange('autoTriggerMin', value / 1000)}
                  unit="s"
                  displayValue={minInterval}
                  tooltip={t('parameterEditor.autoTriggerMinTooltip')}
                />
              </div>
              <div className="mb-4">
                <FuturisticSlider
                  label={t('parameterEditor.autoTriggerMax')}
                  value={maxInterval * 1000}
                  min={100}
                  max={10000}
                  step={100}
                  onChange={(value) => onParamChange('autoTriggerMax', value / 1000)}
                  unit="s"
                  displayValue={maxInterval}
                  tooltip={t('parameterEditor.autoTriggerMaxTooltip')}
                />
              </div>
            </>
          )}

          {mode === 'pattern' && (
            <>
              <div className="mb-4">
                <label className="futuristic-label block mb-1 text-white text-xs flex items-center">
                  {t('parameterEditor.autoTriggerPatternValues')}
                  <InfoTooltip content={t('parameterEditor.autoTriggerPatternTooltip')} />
                </label>
                <input
                  type="text"
                  value={patternInput}
                  onChange={(e) => handlePatternChange(e.target.value)}
                  placeholder={t('parameterEditor.autoTriggerPatternPlaceholder')}
                  className="bg-black border border-white text-white text-xs font-mono px-2 py-1 w-full focus:outline-none focus:border-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  {t('parameterEditor.seconds')}: {pattern.length > 0 ? pattern.join(', ') : t('parameterEditor.none')}
                </p>
              </div>
              <div className="mb-4">
                <label className="futuristic-label block mb-2 text-white text-xs flex items-center">
                  {t('parameterEditor.autoTriggerPatternLoop')}
                  <InfoTooltip content={t('parameterEditor.autoTriggerPatternLoopTooltip')} />
                </label>
                <button
                  onClick={() => onParamChange('autoTriggerPatternLoop', !patternLoop)}
                  className={`w-full py-2 px-4 border border-white text-xs font-mono transition-colors ${
                    patternLoop
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  {patternLoop ? t('parameterEditor.enabled') : t('parameterEditor.disabled')}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

