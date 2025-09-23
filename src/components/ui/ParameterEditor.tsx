'use client';

import { useWorldStore, type EffectZone, type SoundObject } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/AudioManager';
import React from 'react';
import { MobileObjectEditor } from './MobileObjectEditor';
import { useEntitySelector } from '../../hooks/useEntitySelector';
import { useTransformHandler } from '../../hooks/useTransformHandler';
import { EffectParametersSection } from './EffectParametersSection';
import { EffectSpecificParameters } from './EffectSpecificParameters';
import { AudioControlSection } from './AudioControlSection';
import { EffectZoneHeaderComponent } from './effect-editor/EffectZoneHeader';
import { EffectBasicParameters } from './effect-editor/EffectBasicParameters';
import { EffectShapeSelector } from './effect-editor/EffectShapeSelector';
import { EffectTransformSection } from './effect-editor/EffectTransformSection';
import { SoundObjectHeader } from './sound-editor/SoundObjectHeader';
import { SynthSpecificParameters } from './sound-editor/SynthSpecificParameters';
import { SoundTransformSection } from './sound-editor/SoundTransformSection';
import { AdvancedSynthParameters } from './sound-editor/AdvancedSynthParameters';
import { MonoSynthParameters } from './sound-editor/MonoSynthParameters';
import { MetalSynthParameters } from './sound-editor/MetalSynthParameters';
import { NoiseSynthParameters } from './sound-editor/NoiseSynthParameters';
import { PluckSynthParameters } from './sound-editor/PluckSynthParameters';
import { PolySynthParameters } from './sound-editor/PolySynthParameters';
import { SoundObjectControls } from './sound-editor/SoundObjectControls';
import { SamplerParameters } from './sound-editor/SamplerParameters';
import { SoundObjectFooter } from './sound-editor/SoundObjectFooter';
import { NoSelectionMessage } from './NoSelectionMessage';
import { MobileObjectEditorWrapper } from './MobileObjectEditorWrapper';
import { useParameterHandlers } from '../../hooks/useParameterHandlers';

export function ParameterEditor() {
  const { 
    updateObject,
    updateEffectZone,
    removeObject, 
    removeMobileObject,
    removeEffectZone, 
    toggleLockEffectZone,
    setEditingEffectZone,
    refreshAllEffects
  } = useWorldStore();
  
  const { isUpdatingParams, lastUpdatedParam, setIsUpdatingParams, setLastUpdatedParam } = useParameterHandlers();

  // Usar el hook personalizado para la selección de entidades
  const {
    selectedEntity,
    selectedEntityId,
    isSoundObject,
    isMobileObject,
    isEffectZone,
    getSoundObject,
    getMobileObject,
    getEffectZone,
    hasSelection
  } = useEntitySelector();

  // Usar el hook personalizado para transformaciones
  const {
    updateTransform,
    resetTransform,
    roundToDecimals,
    canTransform
  } = useTransformHandler();

  // Estado para mostrar cuando se están actualizando los parámetros
  const [isRefreshingEffects, setIsRefreshingEffects] = React.useState(false);

  // Efecto para activar/desactivar el estado de edición de zona de efectos
  // NOTA: Este estado ya no bloquea OrbitControls, solo se usa para UI
  React.useEffect(() => {
    if (selectedEntity?.type === 'effectZone') {
      setEditingEffectZone(true);
    } else {
      setEditingEffectZone(false);
    }

    // Cleanup: desactivar el estado cuando se desmonte el componente
    return () => {
      setEditingEffectZone(false);
    };
  }, [selectedEntity?.type, setEditingEffectZone]);

  // Función para actualizar un parámetro específico de objeto sonoro
  const handleParamChange = (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => {
    if (!isSoundObject) return;

    const soundObject = getSoundObject();
    if (!soundObject) return;

    // Mostrar estado de actualización
    setIsUpdatingParams(true);
    setLastUpdatedParam(param);

    const newAudioParams = {
      ...soundObject.audioParams,
      [param]: value,
    };

    updateObject(soundObject.id, {
      audioParams: newAudioParams,
    });

    // Ocultar estado de actualización después de un breve delay
    setTimeout(() => {
      setIsUpdatingParams(false);
      setLastUpdatedParam(null);
    }, 1000);
  };

  // Función para actualizar parámetros de zona de efecto
  const handleEffectParamChange = (param: string, value: number | string) => {
    if (!isEffectZone) return;

    const effectZone = getEffectZone();
    if (!effectZone) return;

    // Mostrar estado de actualización
    setIsUpdatingParams(true);
    setLastUpdatedParam(param);

    const newEffectParams = {
      ...effectZone.effectParams,
      [param]: value,
    };

    updateEffectZone(effectZone.id, {
      effectParams: newEffectParams,
    });

    // Ocultar estado de actualización después de un breve delay
    setTimeout(() => {
      setIsUpdatingParams(false);
      setLastUpdatedParam(null);
    }, 1000);
  };

  // Alias para mantener compatibilidad con el código existente
  const handleTransformChange = updateTransform;

  // Si no hay entidad seleccionada, mostrar mensaje
  if (!selectedEntity) {
    return <NoSelectionMessage />;
  }

  // Renderizar controles según el tipo de entidad seleccionada
  if (isMobileObject) {
    const mobileObject = getMobileObject();
    if (!mobileObject) return null;
    
    return (
      <MobileObjectEditorWrapper 
        mobileObject={mobileObject} 
        onRemove={removeMobileObject} 
      />
    );
  }
  
  if (isEffectZone) {
    const zone = getEffectZone();
    if (!zone) return null;
    
    // Asegurar que effectParams existe
    if (!zone?.effectParams) {
      zone.effectParams = {};
    }
    
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-xs max-h-[75vh] overflow-y-auto">
          {/* Efecto de brillo interior */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
          {/* Header con información de la zona de efecto */}
          <EffectZoneHeaderComponent 
            zone={zone}
            isRefreshingEffects={isRefreshingEffects}
            onRemove={removeEffectZone}
            onToggleLock={toggleLockEffectZone}
            onRefresh={() => {
              setIsRefreshingEffects(true);
              refreshAllEffects();
              
              // Ocultar estado después de un delay
              setTimeout(() => {
                setIsRefreshingEffects(false);
              }, 1000);
            }}
          />


          {/* Controles de parámetros del efecto */}
          <div className="space-y-4">
            <EffectParametersSection 
              zone={zone}
              isUpdatingParams={isUpdatingParams}
              lastUpdatedParam={lastUpdatedParam}
              onEffectParamChange={handleEffectParamChange}
            />
            
            {/* Parámetros específicos del efecto */}
            <EffectSpecificParameters 
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />
            
            {/* Parámetros básicos del efecto */}
            <EffectBasicParameters 
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del AutoFilter */}
            {/* @ts-ignore - Disabled section */}
            {false && zone && zone?.type === 'autoFilter' && (
              <>
                {/* Depth */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Profundidad de Modulación
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={zone?.effectParams.depth ?? 0.5}
                      onChange={(e) => handleEffectParamChange('depth', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      disabled={zone?.isLocked}
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {zone?.effectParams.depth ?? 0.5}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>1</span>
                  </div>
                </div>

                {/* Filter Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Tipo de Filtro
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['lowpass', 'highpass', 'bandpass', 'notch'] as const).map((filterType) => (
                      <button
                        key={filterType}
                        onClick={() => handleEffectParamChange('filterType', filterType)}
                        disabled={zone?.isLocked}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          (zone?.effectParams.filterType ?? 'lowpass') === filterType
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <span className="capitalize">{filterType}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Q */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Resonancia (Q)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={zone?.effectParams.filterQ ?? 1}
                      onChange={(e) => handleEffectParamChange('filterQ', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      disabled={zone?.isLocked}
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {zone?.effectParams.filterQ ?? 1}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1</span>
                    <span>10</span>
                  </div>
                </div>

                {/* LFO Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Tipo de LFO
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((lfoType) => (
                      <button
                        key={lfoType}
                        onClick={() => handleEffectParamChange('lfoType', lfoType)}
                        disabled={zone?.isLocked}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          (zone?.effectParams.lfoType ?? 'sine') === lfoType
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <span className="capitalize">{lfoType}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

                            {/* Parámetros específicos del AutoWah */}
                {false && zone && zone?.type === 'autoWah' && (
                  <>
                    {/* Sensitivity */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Sensibilidad
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                                                value={zone?.effectParams.sensitivity ?? 0.5}
                      onChange={(e) => handleEffectParamChange('sensitivity', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      disabled={zone?.isLocked}
                    />
                                         <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                      {zone?.effectParams.sensitivity ?? 0.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del BitCrusher */}
                {false && zone && zone?.type === 'bitCrusher' && (
                  <>
                    {/* Bits */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Bits
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="16"
                          step="1"
                          value={zone?.effectParams.bits ?? 4}
                          onChange={(e) => handleEffectParamChange('bits', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                                                     {zone?.effectParams.bits ?? 4}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span>
                        <span>16</span>
                      </div>
                    </div>

                    {/* NormFreq */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Frecuencia Normalizada
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone?.effectParams.normFreq ?? 0.5}
                          onChange={(e) => handleEffectParamChange('normFreq', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                                                     {zone?.effectParams.normFreq ?? 0.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Chebyshev */}
                {false && zone && zone?.type === 'chebyshev' && (
                  <>
                    {/* Order */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Orden del Polinomio
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          step="1"
                          value={zone?.effectParams.order ?? 50}
                          onChange={(e) => handleEffectParamChange('order', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.order ?? 50}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span>
                        <span>100</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Orden impar = distorsión armónica, Orden par = distorsión suave
                      </p>
                    </div>

                    {/* Oversample */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Oversampling
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['none', '2x', '4x'] as const).map((oversampleType) => (
                          <button
                            key={oversampleType}
                            onClick={() => handleEffectParamChange('oversample', oversampleType)}
                            disabled={zone?.isLocked}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              (zone?.effectParams.oversample ?? 'none') === oversampleType
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            <span className="capitalize">{oversampleType}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mayor oversampling = mejor calidad, más CPU
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Chorus */}
                {false && zone && zone?.type === 'chorus' && (
                  <>
                    {/* Frecuencia del LFO */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Frecuencia del LFO (Hz)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={zone?.effectParams.chorusFrequency ?? 1.5}
                          onChange={(e) => handleEffectParamChange('chorusFrequency', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.chorusFrequency ?? 1.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1 Hz</span>
                        <span>10 Hz</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Velocidad de modulación del efecto
                      </p>
                    </div>

                    {/* Tiempo de Delay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tiempo de Delay (ms)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="2"
                          max="20"
                          step="0.1"
                          value={zone?.effectParams.delayTime ?? 3.5}
                          onChange={(e) => handleEffectParamChange('delayTime', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.delayTime ?? 3.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>2 ms</span>
                        <span>20 ms</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tiempo base del delay del chorus
                      </p>
                    </div>

                    {/* Profundidad */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Profundidad
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone?.effectParams.chorusDepth ?? 0.7}
                          onChange={(e) => handleEffectParamChange('chorusDepth', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.chorusDepth ?? 0.7}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Intensidad de la modulación del delay
                      </p>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Feedback
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="0.9"
                          step="0.01"
                          value={zone?.effectParams.feedback ?? 0}
                          onChange={(e) => handleEffectParamChange('feedback', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.feedback ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>0.9</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Cantidad de retroalimentación (0 = chorus, mayor a 0 = flanger)
                      </p>
                    </div>

                    {/* Spread */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Spread Estéreo (grados)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="180"
                          step="1"
                          value={zone?.effectParams.spread ?? 180}
                          onChange={(e) => handleEffectParamChange('spread', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.spread ?? 180}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0°</span>
                        <span>180°</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        0° = central, 180° = estéreo completo
                      </p>
                    </div>

                    {/* Tipo de LFO */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tipo de LFO
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((lfoType) => (
                          <button
                            key={lfoType}
                            onClick={() => handleEffectParamChange('chorusType', lfoType)}
                            disabled={zone?.isLocked}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              (zone?.effectParams.chorusType ?? 'sine') === lfoType
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            <span className="capitalize">{lfoType}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Forma de onda del LFO para la modulación
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Distortion */}
                {false && zone && zone?.type === 'distortion' && (
                  <>
                    {/* Distortion amount */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Cantidad de distorsión
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone?.effectParams.distortion ?? 0.4}
                          onChange={(e) => handleEffectParamChange('distortion', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.distortion ?? 0.4}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Nivel de distorsión (0 a 1)
                      </p>
                    </div>

                    {/* Oversample */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Oversampling
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['none', '2x', '4x'] as const).map((oversampleType) => (
                          <button
                            key={oversampleType}
                            onClick={() => handleEffectParamChange('oversample', oversampleType)}
                            disabled={zone?.isLocked}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              (zone?.effectParams.oversample ?? 'none') === oversampleType
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            <span className="capitalize">{oversampleType}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mayor oversampling = mejor calidad, más CPU
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del FeedbackDelay */}
                {false && zone && zone?.type === 'feedbackDelay' && (
                  <>
                    {/* Delay Time */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tiempo de Delay
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={typeof zone?.effectParams.delayTime === 'number' ? zone?.effectParams.delayTime : 0.25}
                          onChange={(e) => handleEffectParamChange('delayTime', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {typeof zone?.effectParams.delayTime === 'number' ? zone?.effectParams.delayTime : '8n'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 s</span>
                        <span>1 s</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Retraso en segundos (puedes usar también valores musicales como &apos;8n&apos;)
                      </p>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Feedback
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="0.95"
                          step="0.01"
                          value={zone?.effectParams.feedback ?? 0.5}
                          onChange={(e) => handleEffectParamChange('feedback', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.feedback ?? 0.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>0.95</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Proporción de señal realimentada
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Freeverb */}
                {false && zone && zone?.type === 'freeverb' && (
                  <>
                    {/* Room Size */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Room Size
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone?.effectParams.roomSize ?? 0.7}
                          onChange={(e) => handleEffectParamChange('roomSize', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.roomSize ?? 0.7}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        0 = sala pequeña, 1 = sala grande (más decay)
                      </p>
                    </div>

                    {/* Dampening */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Dampening (Hz)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="500"
                          max="8000"
                          step="10"
                          value={zone?.effectParams.dampening ?? 3000}
                          onChange={(e) => handleEffectParamChange('dampening', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.dampening ?? 3000}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>500 Hz</span>
                        <span>8 kHz</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Filtro lowpass interno del reverb
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del FrequencyShifter */}
                {false && zone && zone?.type === 'frequencyShifter' && (
                  <>
                    {/* Frequency Shift */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Frecuencia de Shift (Hz)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="-2000"
                          max="2000"
                          step="1"
                          value={zone?.effectParams.frequency ?? 0}
                          onChange={(e) => handleEffectParamChange('frequency', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.frequency ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>-2000 Hz</span>
                        <span>2000 Hz</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Desplaza todas las frecuencias por un valor fijo
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del JCReverb */}
                {false && zone && zone?.type === 'jcReverb' && (
                  <>
                    {/* Room Size */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Room Size
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone?.effectParams.roomSize ?? 0.5}
                          onChange={(e) => handleEffectParamChange('roomSize', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.roomSize ?? 0.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        0 = sala pequeña, 1 = sala grande (schroeder)
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del PingPongDelay */}
                {false && zone && zone?.type === 'pingPongDelay' && (
                  <>
                    {/* Delay Time */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tiempo de Delay
                      </label>
                      <div className="flex items-center gap-3">
                        <select
                          value={zone?.effectParams.pingPongDelayTime ?? '4n'}
                          onChange={(e) => handleEffectParamChange('pingPongDelayTime', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-violet-500 focus:outline-none"
                          disabled={zone?.isLocked}
                        >
                          <option value="1n">Nota completa (1n)</option>
                          <option value="2n">Media nota (2n)</option>
                          <option value="4n">Cuarto de nota (4n)</option>
                          <option value="8n">Octavo de nota (8n)</option>
                          <option value="16n">Dieciseisavo de nota (16n)</option>
                          <option value="32n">Treinta y dosavo de nota (32n)</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tiempo entre ecos consecutivos
                      </p>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Feedback ({(zone?.effectParams.pingPongFeedback ?? 0.2) * 100}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="0.9"
                          step="0.05"
                          value={zone?.effectParams.pingPongFeedback ?? 0.2}
                          onChange={(e) => handleEffectParamChange('pingPongFeedback', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone?.effectParams.pingPongFeedback ?? 0.2) * 100)}%
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

                    {/* Max Delay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Max Delay ({zone?.effectParams.maxDelay ?? 1.0}s)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="2"
                          step="0.1"
                          value={zone?.effectParams.maxDelay ?? 1.0}
                          onChange={(e) => handleEffectParamChange('maxDelay', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.maxDelay ?? 1.0}s
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1s</span>
                        <span>2.0s</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tiempo máximo de delay en segundos
                      </p>
                    </div>

                    {/* Wet */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Wet (Mezcla) ({Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone?.effectParams.wet ?? 0.5}
                          onChange={(e) => handleEffectParamChange('wet', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mezcla entre señal seca y procesada
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del PitchShift */}
                {false && zone && zone?.type === 'pitchShift' && (
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
                          onChange={(e) => handleEffectParamChange('pitchShift', Number(e.target.value))}
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
                          onChange={(e) => handleEffectParamChange('windowSize', Number(e.target.value))}
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
                          onChange={(e) => handleEffectParamChange('delayTime', Number(e.target.value))}
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
                          onChange={(e) => handleEffectParamChange('feedback', Number(e.target.value))}
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
                )}

                {/* Parámetros específicos del Reverb */}
                {false && zone && zone?.type === 'reverb' && (
                  <>
                    {/* Decay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Decay ({zone?.effectParams.decay ?? 1.5}s)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={zone?.effectParams.decay ?? 1.5}
                          onChange={(e) => handleEffectParamChange('decay', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.decay ?? 1.5}s
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1s</span>
                        <span>10s</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Duración de la reverberación
                      </p>
                    </div>

                    {/* PreDelay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        PreDelay ({zone?.effectParams.preDelay ?? 0.01}s)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="0.1"
                          step="0.001"
                          value={zone?.effectParams.preDelay ?? 0.01}
                          onChange={(e) => handleEffectParamChange('preDelay', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.preDelay ?? 0.01}s
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0s</span>
                        <span>0.1s</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tiempo antes de que la reverberación se active completamente
                      </p>
                    </div>

                    {/* Wet */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Wet (Mezcla) ({Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone?.effectParams.wet ?? 0.5}
                          onChange={(e) => handleEffectParamChange('wet', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mezcla entre señal seca y procesada
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del StereoWidener */}
                {false && zone && zone?.type === 'stereoWidener' && (
                  <>
                    {/* Width */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Width (Ancho Estéreo): {Math.round((zone?.effectParams.width ?? 0.5) * 100)}%
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone?.effectParams.width ?? 0.5}
                          onChange={(e) => handleEffectParamChange('width', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone?.effectParams.width ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0% (Mono)</span>
                        <span>100% (Estéreo)</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Ancho del campo estéreo (0 = mono, 0.5 = sin cambio, 1 = estéreo máximo)
                      </p>
                    </div>

                    {/* Wet */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Wet (Mezcla) ({Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone?.effectParams.wet ?? 0.5}
                          onChange={(e) => handleEffectParamChange('wet', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mezcla entre señal seca y procesada
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Tremolo */}
                {false && zone && zone?.type === 'tremolo' && (
                  <>
                    {/* Frequency */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Frecuencia: {zone?.effectParams.tremoloFrequency ?? 10} Hz
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="20"
                          step="0.1"
                          value={zone?.effectParams.tremoloFrequency ?? 10}
                          onChange={(e) => handleEffectParamChange('tremoloFrequency', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.tremoloFrequency ?? 10} Hz
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1 Hz</span>
                        <span>20 Hz</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Velocidad de modulación del tremolo
                      </p>
                    </div>

                    {/* Depth */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Profundidad: {Math.round((zone?.effectParams.tremoloDepth ?? 0.5) * 100)}%
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone?.effectParams.tremoloDepth ?? 0.5}
                          onChange={(e) => handleEffectParamChange('tremoloDepth', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone?.effectParams.tremoloDepth ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Intensidad de la modulación de amplitud
                      </p>
                    </div>

                    {/* Spread */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Spread: {zone?.effectParams.tremoloSpread ?? 180}°
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="180"
                          step="1"
                          value={zone?.effectParams.tremoloSpread ?? 180}
                          onChange={(e) => handleEffectParamChange('tremoloSpread', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.tremoloSpread ?? 180}°
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0°</span>
                        <span>180°</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Separación estéreo entre canales LFO
                      </p>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tipo de Onda
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((waveType) => (
                          <button
                            key={waveType}
                            onClick={() => handleEffectParamChange('tremoloType', waveType)}
                            disabled={zone?.isLocked}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              zone?.effectParams.tremoloType === waveType
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            {waveType}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Forma de onda del LFO
                      </p>
                    </div>

                    {/* Wet */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Wet (Mezcla) ({Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone?.effectParams.wet ?? 0.5}
                          onChange={(e) => handleEffectParamChange('wet', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mezcla entre señal seca y procesada
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Vibrato */}
                {false && zone && zone?.type === 'vibrato' && (
                  <>
                    {/* Frequency */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Frecuencia: {zone?.effectParams.vibratoFrequency ?? 5} Hz
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="20"
                          step="0.1"
                          value={zone?.effectParams.vibratoFrequency ?? 5}
                          onChange={(e) => handleEffectParamChange('vibratoFrequency', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone?.effectParams.vibratoFrequency ?? 5} Hz
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1 Hz</span>
                        <span>20 Hz</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Velocidad de modulación del vibrato
                      </p>
                    </div>

                    {/* Depth */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Profundidad: {Math.round((zone?.effectParams.vibratoDepth ?? 0.1) * 100)}%
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone?.effectParams.vibratoDepth ?? 0.1}
                          onChange={(e) => handleEffectParamChange('vibratoDepth', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone?.effectParams.vibratoDepth ?? 0.1) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Intensidad de la modulación de pitch
                      </p>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tipo de Onda
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((waveType) => (
                          <button
                            key={waveType}
                            onClick={() => handleEffectParamChange('vibratoType', waveType)}
                            disabled={zone?.isLocked}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              zone?.effectParams.vibratoType === waveType
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            {waveType}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Forma de onda del LFO
                      </p>
                    </div>

                    {/* Max Delay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Max Delay: {(zone?.effectParams.vibratoMaxDelay ?? 0.005) * 1000} ms
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.001"
                          max="0.02"
                          step="0.001"
                          value={zone?.effectParams.vibratoMaxDelay ?? 0.005}
                          onChange={(e) => handleEffectParamChange('vibratoMaxDelay', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone?.effectParams.vibratoMaxDelay ?? 0.005) * 1000)} ms
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 ms</span>
                        <span>20 ms</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tiempo máximo de delay para el vibrato
                      </p>
                    </div>

                    {/* Wet */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Wet (Mezcla) ({Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone?.effectParams.wet ?? 0.5}
                          onChange={(e) => handleEffectParamChange('wet', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone?.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone?.effectParams.wet ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mezcla entre señal seca y procesada
                      </p>
                    </div>
                  </>
                )}
              </div>

          {/* Selector de forma */}
          <EffectShapeSelector 
            zone={zone}
            onShapeChange={(shape) => updateEffectZone(zone?.id, { shape })}
          />

          {/* Sección de Posición y Tamaño para Zonas de Efectos */}
          <EffectTransformSection 
            zone={zone}
            onUpdateEffectZone={updateEffectZone}
            roundToDecimals={roundToDecimals}
          />

          {/* Información adicional */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
              <p className="text-xs text-purple-300 text-center">
                💡 Los objetos sonoros dentro de esta zona se procesarán automáticamente con el efecto Phaser
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar controles para objeto sonoro (código existente)
  const selectedObject = getSoundObject();
  if (!selectedObject) return null;
  
  // Asegurar que audioParams existe
  if (!selectedObject.audioParams) {
    selectedObject.audioParams = {
      frequency: 440,
      waveform: 'sine',
      volume: 0.5
    };
  }
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Header con información del objeto */}
        <SoundObjectHeader 
          selectedObject={selectedObject}
          onRemove={removeObject}
        />

        <SoundObjectControls 
          selectedObject={selectedObject}
          onParamChange={handleParamChange}
          onTransformChange={handleTransformChange}
          onResetTransform={resetTransform}
          roundToDecimals={roundToDecimals}
          onRemove={removeObject}
        />


          {/* Parámetros avanzados de sintetizadores */}
          <AdvancedSynthParameters 
            selectedObject={selectedObject}
            onParamChange={handleParamChange}
          />

          {/* Controles específicos para MonoSynth (pirámide) */}
          <MonoSynthParameters 
            selectedObject={selectedObject}
            onParamChange={handleParamChange}
          />
          

          {/* Controles específicos para MetalSynth (icosaedro) */}
          <MetalSynthParameters 
            selectedObject={selectedObject}
            onParamChange={handleParamChange}
          />
          

          {/* Controles específicos para NoiseSynth (plano) */}
          <NoiseSynthParameters 
            selectedObject={selectedObject}
            onParamChange={handleParamChange}
          />
          
          {/* Controles específicos para PluckSynth (torus) */}
          <PluckSynthParameters 
            selectedObject={selectedObject}
            onParamChange={handleParamChange}
          />
          
          {/* Controles específicos para PolySynth (dodecahedronRing) */}
          <PolySynthParameters 
            selectedObject={selectedObject}
            onParamChange={handleParamChange}
          />
          
          {/* Controles específicos para Sampler (spiral) */}
          <SamplerParameters 
            selectedObject={selectedObject}
            onParamChange={handleParamChange}
          />
          
          {/* Sección de Posición y Tamaño - Movida al final */}
          <SoundTransformSection 
            selectedObject={selectedObject}
            onTransformChange={handleTransformChange}
            onResetTransform={resetTransform}
            roundToDecimals={roundToDecimals}
          />
        </div>

        <SoundObjectFooter />
      </div>
   
  );
}
