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
import { EffectZoneEditor } from './effect-editor/EffectZoneEditor';
import { EffectZoneHeader } from './effect-editor/EffectZoneHeader';
import { AutoFilterParams } from './effect-editor/AutoFilterParams';
import { AutoWahParams } from './effect-editor/AutoWahParams';
import { BitCrusherParams } from './effect-editor/BitCrusherParams';
import { ChebyshevParams } from './effect-editor/ChebyshevParams';
import { DistortionParams } from './effect-editor/DistortionParams';
import { FrequencyShifterParams } from './effect-editor/FrequencyShifterParams';
import { JCReverbParams } from './effect-editor/JCReverbParams';
import { FeedbackDelayParams } from './effect-editor/FeedbackDelayParams';
import { FreeverbParams } from './effect-editor/FreeverbParams';
import { StereoWidenerParams } from './effect-editor/StereoWidenerParams';
import { ReverbParams } from './effect-editor/ReverbParams';
import { TremoloParams } from './effect-editor/TremoloParams';
import { VibratoParams } from './effect-editor/VibratoParams';
import { ChorusParams } from './effect-editor/ChorusParams';
import { PingPongDelayParams } from './effect-editor/PingPongDelayParams';
import { PitchShiftParams } from './effect-editor/PitchShiftParams';
import { EffectInfoSection } from './effect-editor/EffectInfoSection';
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
import { SoundObjectEditor } from './sound-editor/SoundObjectEditor';
import { SoundObjectFooter } from './sound-editor/SoundObjectFooter';
import { NoSelectionMessage } from './NoSelectionMessage';
import { MobileObjectEditorWrapper } from './MobileObjectEditorWrapper';
import { useParameterHandlers } from '../../hooks/useParameterHandlers';

export function ParameterEditor() {
  const [isPanelExpanded, setIsPanelExpanded] = React.useState(false);
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

  // Expandir automáticamente el panel cuando se selecciona una entidad
  React.useEffect(() => {
    if (selectedEntity) {
      setIsPanelExpanded(true);
    }
  }, [selectedEntity]);

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

  // Si no hay entidad seleccionada, mostrar solo el botón de toggle
  if (!selectedEntity) {
    return (
      <div className="fixed right-0 top-0 h-full z-50 flex">
        {/* Panel principal futurista */}
        <div className={`relative bg-black border border-white transition-all duration-300 overflow-hidden ${
          isPanelExpanded ? 'w-96' : 'w-0'
        }`}>
          {/* Grid pattern background */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          {/* Scanner line effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div 
                className="absolute w-full h-1 bg-white shadow-lg shadow-white/80"
                style={{
                  animation: 'scanner 2s linear infinite',
                  top: '-8px'
                }}
              ></div>
            </div>
          </div>
          
          <div className="p-4 h-full overflow-y-auto relative z-10">
            {isPanelExpanded && (
              <NoSelectionMessage />
            )}
          </div>
        </div>

        {/* Botón de toggle futurista */}
        <button
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          className="relative bg-black border border-white p-3 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 group"
          title={isPanelExpanded ? "Contraer panel" : "Expandir panel"}
        >
          {/* Decoraciones de esquina */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
          {isPanelExpanded ? (
            <svg className="w-5 h-5 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
    );
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
      <div className="fixed right-0 top-0 h-full z-50 flex">
        {/* Panel principal futurista */}
        <div className={`relative bg-black border border-white transition-all duration-300 overflow-hidden ${
          isPanelExpanded ? 'w-96' : 'w-0'
        }`}>
          {/* Grid pattern background */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          {/* Scanner line effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div 
                className="absolute w-full h-1 bg-white shadow-lg shadow-white/80"
                style={{
                  animation: 'scanner 2s linear infinite',
                  top: '-8px'
                }}
              ></div>
            </div>
          </div>
          
          <div className="p-3 h-full overflow-y-auto relative z-10">
            {isPanelExpanded && (
              <>
          {/* Header con información de la zona de efecto */}
          <EffectZoneHeader
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


            {/* Parámetros específicos del AutoFilter */}
            <AutoFilterParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del AutoWah */}
            <AutoWahParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del BitCrusher */}
            <BitCrusherParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del Chebyshev */}
            <ChebyshevParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del Chorus */}
            <ChorusParams 
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />


            {/* Parámetros específicos del Distortion */}
            <DistortionParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del FeedbackDelay */}
            <FeedbackDelayParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del Freeverb */}
            <FreeverbParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del FrequencyShifter */}
            <FrequencyShifterParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del JCReverb */}
            <JCReverbParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del PingPongDelay */}
            <PingPongDelayParams 
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del PitchShift */}
            <PitchShiftParams 
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

            {/* Parámetros específicos del Reverb */}
            <ReverbParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />


            {/* Parámetros específicos del StereoWidener */}
            <StereoWidenerParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />


            {/* Parámetros específicos del Tremolo */}
            <TremoloParams
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />


            {/* Parámetros específicos del Vibrato */}
            <VibratoParams 
              zone={zone}
              onEffectParamChange={handleEffectParamChange}
            />

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
          <EffectInfoSection effectType={zone.type} />
              </>
            )}
          </div>
        </div>

        {/* Botón de toggle futurista */}
        <button
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          className="relative bg-black border border-white p-3 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 group"
          title={isPanelExpanded ? "Contraer panel" : "Expandir panel"}
        >
          {/* Decoraciones de esquina */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
          {isPanelExpanded ? (
            <svg className="w-5 h-5 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
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
    <div className="fixed right-0 top-0 h-full z-50 flex">
      {/* Panel principal futurista */}
      <div className={`relative bg-black border border-white transition-all duration-300 overflow-hidden ${
        isPanelExpanded ? 'w-96' : 'w-0'
      }`}>
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Scanner line effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute w-full h-1 bg-white shadow-lg shadow-white/80"
              style={{
                animation: 'scanner 2s linear infinite',
                top: '-8px'
              }}
            ></div>
          </div>
        </div>
        
        <div className="p-4 h-full overflow-y-auto relative z-10">
          {isPanelExpanded && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Botón de toggle futurista */}
      <button
        onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        className="relative bg-black border border-white p-3 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 group"
        title={isPanelExpanded ? "Contraer panel" : "Expandir panel"}
      >
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
        {isPanelExpanded ? (
          <svg className="w-5 h-5 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </button>
    </div>

  );
}
