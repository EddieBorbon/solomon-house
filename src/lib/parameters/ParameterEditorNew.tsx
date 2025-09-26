'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWorldStore, type EffectZone } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/AudioManager';
import { ParameterComponentFactory } from './ParameterComponentFactory';
import { 
  EffectZoneEntity, 
  SoundObjectEntity, 
  ParameterConfig,
  IParameterPanel,
  SoundObjectType
} from './types';
import { EffectType } from '../../types/world';
import { useEntitySelector } from '../../hooks/useEntitySelector';
import { useTransformHandler } from '../../hooks/useTransformHandler';
import { useParameterHandlers } from '../../hooks/useParameterHandlers';

// Importar componentes de UI
import { EffectZoneHeader } from '../../components/ui/effect-editor/EffectZoneHeader';
import { EffectParametersSection } from '../../components/ui/EffectParametersSection';
import { EffectInfoSection } from '../../components/ui/effect-editor/EffectInfoSection';
import { EffectShapeSelector } from '../../components/ui/effect-editor/EffectShapeSelector';
import { EffectTransformSection } from '../../components/ui/effect-editor/EffectTransformSection';
import { SoundObjectHeader } from '../../components/ui/sound-editor/SoundObjectHeader';
import { SynthSpecificParameters } from '../../components/ui/sound-editor/SynthSpecificParameters';
import { SoundTransformSection } from '../../components/ui/sound-editor/SoundTransformSection';
import { SoundObjectControls } from '../../components/ui/sound-editor/SoundObjectControls';
import { SoundObjectFooter } from '../../components/ui/sound-editor/SoundObjectFooter';
import { NoSelectionMessage } from '../../components/ui/NoSelectionMessage';
import { MobileObjectEditorWrapper } from '../../components/ui/MobileObjectEditorWrapper';

interface ParameterEditorProps {
  config?: Partial<ParameterConfig>;
}

/**
 * Panel de parámetros refactorizado usando Strategy Pattern
 */
class ParameterPanel implements IParameterPanel {
  private expanded: boolean = false;
  private onExpandedChange?: (expanded: boolean) => void;

  constructor(onExpandedChange?: (expanded: boolean) => void) {
    this.onExpandedChange = onExpandedChange;
  }

  isExpanded(): boolean {
    return this.expanded;
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
    this.onExpandedChange?.(this.expanded);
  }

  setExpanded(expanded: boolean): void {
    this.expanded = expanded;
    this.onExpandedChange?.(expanded);
  }

  render(): React.ReactElement | null {
    // Esta implementación se maneja en el componente principal
    return null;
  }
}

/**
 * Componente principal del editor de parámetros refactorizado
 */
export function ParameterEditorNew({ config = {} }: ParameterEditorProps) {
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  
  // Configuración por defecto
  const defaultConfig: ParameterConfig = {
    enableRealTimeUpdates: true,
    updateDelay: 1000,
    enableValidation: true,
    enableTransformControls: true,
    panelWidth: 384,
    animationDuration: 300,
    frequencyRange: {
      min: 20,
      max: 20000
    },
    volumeRange: {
      min: -60,
      max: 0
    },
    ...config
  };

  // Hooks del store
  const {
    updateObject,
    updateEffectZone,
    removeObject,
    removeMobileObject,
    removeEffectZone,
    toggleLockEffectZone,
    setEditingEffectZone
  } = useWorldStore();

  const { isUpdatingParams } = useParameterHandlers();

  // Hook para selección de entidades
  const {
    selectedEntity,
    isSoundObject,
    isMobileObject,
    isEffectZone,
    getSoundObject,
    getMobileObject,
    getEffectZone
  } = useEntitySelector();

  // Hook para transformaciones
  const {
    roundToDecimals
  } = useTransformHandler();

  // Componentes refactorizados
  const parameterFactory = ParameterComponentFactory.getInstance();

  // Crear panel de parámetros
  const parameterPanel = useMemo(() => 
    new ParameterPanel(setIsPanelExpanded), 
    []
  );

  // Expandir automáticamente el panel cuando se selecciona una entidad
  useEffect(() => {
    if (selectedEntity) {
      parameterPanel.setExpanded(true);
    }
  }, [selectedEntity, parameterPanel]);

  // Efecto para activar/desactivar el estado de edición de zona de efectos
  useEffect(() => {
    if (selectedEntity?.type === 'effectZone') {
      setEditingEffectZone(true);
    } else {
      setEditingEffectZone(false);
    }

    return () => {
      setEditingEffectZone(false);
    };
  }, [selectedEntity?.type, setEditingEffectZone]);

  // Estado de parámetros se maneja localmente
  // TODO: Implementar suscripción cuando esté disponible en ParameterManagerFacade

  // Función para actualizar parámetros de objeto sonoro
  const handleParamChange = useCallback((param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => {
    if (!isSoundObject) return;

    const soundObject = getSoundObject();
    if (!soundObject) return;

    const newAudioParams = {
      ...soundObject.audioParams,
      [param]: value,
    };

    updateObject(soundObject.id, {
      audioParams: newAudioParams,
    });
  }, [isSoundObject, getSoundObject, updateObject]);

  // Función para actualizar parámetros de zona de efecto
  const handleEffectParamChange = useCallback((param: string, value: number | string) => {
    if (!isEffectZone) return;

    const effectZone = getEffectZone();
    if (!effectZone) return;

    // TODO: Implementar validación específica para efectos cuando esté disponible
    // const result = parameterManager.updateEffectParams(effectZone, { [param]: value });

    const newEffectParams = {
      ...effectZone.effectParams,
      [param]: value,
    };

    updateEffectZone(effectZone.id, {
      effectParams: newEffectParams,
    });
  }, [isEffectZone, getEffectZone, updateEffectZone]);

  // Función para manejar actualización de zona de efecto
  const handleUpdateEffectZone = useCallback((id: string, updates: Partial<EffectZone>) => {
    updateEffectZone(id, updates);
  }, [updateEffectZone]);

  // Función para manejar cambio de forma de zona de efecto
  const handleShapeChange = useCallback((shape: 'sphere' | 'cube') => {
    if (!isEffectZone) return;
    const zone = getEffectZone();
    if (!zone) return;
    handleUpdateEffectZone(zone.id, { shape });
  }, [isEffectZone, getEffectZone, handleUpdateEffectZone]);

  // Función para manejar transformaciones de objeto sonoro
  const handleSoundTransformChange = useCallback((transform: 'position' | 'rotation' | 'scale', axis: 0 | 1 | 2, value: number) => {
    if (!isSoundObject) return;
    const soundObject = getSoundObject();
    if (!soundObject) return;
    
    const newTransform = { ...soundObject };
    if (transform === 'position') {
      newTransform.position[axis] = value;
    } else if (transform === 'rotation') {
      newTransform.rotation[axis] = value;
    } else if (transform === 'scale') {
      newTransform.scale[axis] = value;
    }
    
    updateObject(soundObject.id, newTransform);
  }, [isSoundObject, getSoundObject, updateObject]);

  // Función para resetear transformaciones de objeto sonoro
  const handleResetSoundTransform = useCallback(() => {
    if (!isSoundObject) return;
    const soundObject = getSoundObject();
    if (!soundObject) return;
    
    updateObject(soundObject.id, {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    });
  }, [isSoundObject, getSoundObject, updateObject]);

  // Función para manejar refresco de efectos
  // const handleRefreshEffects = useCallback(() => {
  //   refreshAllEffects();
  // }, [refreshAllEffects]);

  // Si no hay entidad seleccionada, mostrar solo el botón de toggle
  if (!selectedEntity) {
    return (
      <div className="fixed right-0 top-0 h-full z-50 flex">
        {/* Panel principal */}
        <div className={`bg-black/80 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-all duration-${defaultConfig.animationDuration} overflow-hidden ${
          isPanelExpanded ? `w-${defaultConfig.panelWidth / 4}` : 'w-0'
        }`}>
          <div className="p-4 h-full overflow-y-auto">
            {isPanelExpanded && (
              <NoSelectionMessage />
            )}
          </div>
        </div>

        {/* Botón de toggle */}
        <button
          onClick={() => parameterPanel.toggleExpanded()}
          className="bg-black/80 backdrop-blur-xl border-l border-white/10 shadow-2xl p-3 flex items-center justify-center hover:bg-black/90 transition-all duration-300"
          title={isPanelExpanded ? "Contraer panel" : "Expandir panel"}
        >
          {isPanelExpanded ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        {/* Panel principal */}
        <div className={`bg-black/80 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-all duration-${defaultConfig.animationDuration} overflow-hidden ${
          isPanelExpanded ? `w-${defaultConfig.panelWidth / 4}` : 'w-0'
        }`}>
          {/* Efecto de brillo interior */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
          
          <div className="p-3 h-full overflow-y-auto">
            {isPanelExpanded && (
              <>
                {/* Header con información de la zona de efecto */}
                <EffectZoneHeader
                  zone={zone}
                  onRemove={removeEffectZone}
                  onToggleLock={toggleLockEffectZone}
                />

                {/* Controles de parámetros del efecto */}
                <div className="space-y-4">
                  <EffectParametersSection
                    zone={zone}
                    isUpdatingParams={isUpdatingParams}
                    onEffectParamChange={handleEffectParamChange}
                  />

                  {/* Parámetros específicos del efecto usando el factory */}
                  {parameterFactory.createEffectComponent(zone.type as EffectType, {
                    id: zone.id,
                    type: 'effectZone',
                    effectType: zone.type as EffectType,
                    effectParams: zone.effectParams || {},
                    position: zone.position,
                    rotation: zone.rotation,
                    scale: zone.scale,
                    isLocked: zone.isLocked,
                    isSelected: true
                  } as EffectZoneEntity)}

                  {/* Secciones adicionales */}
                  <EffectInfoSection effectType={zone.type} />
                  <EffectShapeSelector 
                    zone={zone}
                    onShapeChange={handleShapeChange}
                  />
                  <EffectTransformSection 
                    zone={zone} 
                    onUpdateEffectZone={handleUpdateEffectZone}
                    roundToDecimals={roundToDecimals}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Botón de toggle */}
        <button
          onClick={() => parameterPanel.toggleExpanded()}
          className="bg-black/80 backdrop-blur-xl border-l border-white/10 shadow-2xl p-3 flex items-center justify-center hover:bg-black/90 transition-all duration-300"
          title={isPanelExpanded ? "Contraer panel" : "Expandir panel"}
        >
          {isPanelExpanded ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  if (isSoundObject) {
    const soundObject = getSoundObject();
    if (!soundObject) return null;

    return (
      <div className="fixed right-0 top-0 h-full z-50 flex">
        {/* Panel principal */}
        <div className={`bg-black/80 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-all duration-${defaultConfig.animationDuration} overflow-hidden ${
          isPanelExpanded ? `w-${defaultConfig.panelWidth / 4}` : 'w-0'
        }`}>
          {/* Efecto de brillo interior */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
          
          <div className="p-3 h-full overflow-y-auto">
            {isPanelExpanded && (
              <>
                {/* Header con información del objeto sonoro */}
                <SoundObjectHeader
                  selectedObject={soundObject}
                  onRemove={removeObject}
                />

                {/* Controles de parámetros del objeto sonoro */}
                <div className="space-y-4">
                  {/* Parámetros específicos del objeto usando el factory */}
                  {parameterFactory.createSoundObjectComponent(soundObject.type as SoundObjectType, {
                    id: soundObject.id,
                    type: 'soundObject',
                    audioParams: soundObject.audioParams,
                    position: soundObject.position,
                    rotation: soundObject.rotation,
                    scale: soundObject.scale,
                    isSelected: true
                  } as SoundObjectEntity)}

                  {/* Secciones adicionales */}
                  <SynthSpecificParameters 
                    selectedObject={soundObject}
                    onParamChange={handleParamChange}
                  />
                  <SoundTransformSection 
                    selectedObject={soundObject}
                    onTransformChange={handleSoundTransformChange}
                    onResetTransform={handleResetSoundTransform}
                    roundToDecimals={roundToDecimals}
                  />
                  <SoundObjectControls 
                    selectedObject={soundObject}
                    onParamChange={handleParamChange}
                    onTransformChange={handleSoundTransformChange}
                    onResetTransform={handleResetSoundTransform}
                    roundToDecimals={roundToDecimals}
                    onRemove={removeObject}
                  />
                </div>

                {/* Footer */}
                <SoundObjectFooter />
              </>
            )}
          </div>
        </div>

        {/* Botón de toggle */}
        <button
          onClick={() => parameterPanel.toggleExpanded()}
          className="bg-black/80 backdrop-blur-xl border-l border-white/10 shadow-2xl p-3 flex items-center justify-center hover:bg-black/90 transition-all duration-300"
          title={isPanelExpanded ? "Contraer panel" : "Expandir panel"}
        >
          {isPanelExpanded ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  return null;
}
