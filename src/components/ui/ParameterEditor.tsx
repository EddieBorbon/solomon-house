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
