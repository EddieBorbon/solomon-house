'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWorldStore, type EffectZone, type SoundObject, type MobileObject } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/AudioManager';
import { ParameterComponentFactory } from './ParameterComponentFactory';
import { ParameterManager } from './ParameterManager';
import { 
  EffectZoneEntity, 
  SoundObjectEntity, 
  MobileObjectEntity,
  ParameterConfig,
  EntityState,
  IParameterPanel
} from './types';
import { useEntitySelector } from '../../hooks/useEntitySelector';
import { useTransformHandler } from '../../hooks/useTransformHandler';
import { useParameterHandlers } from '../../hooks/useParameterHandlers';

// Importar componentes de UI
import { EffectZoneHeader } from '../../components/ui/effect-editor/EffectZoneHeader';
import { EffectParametersSection } from '../../components/ui/EffectParametersSection';
import { EffectSpecificParameters } from '../../components/ui/EffectSpecificParameters';
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

  render(entity: unknown): React.ReactElement | null {
    // Esta implementación se maneja en el componente principal
    return null;
  }
}

/**
 * Componente principal del editor de parámetros refactorizado
 */
export function ParameterEditorNew({ config = {} }: ParameterEditorProps) {
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isRefreshingEffects, setIsRefreshingEffects] = useState(false);
  
  // Configuración por defecto
  const defaultConfig: ParameterConfig = {
    enableRealTimeUpdates: true,
    updateDelay: 1000,
    enableValidation: true,
    enableTransformControls: true,
    panelWidth: 384,
    animationDuration: 300,
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
    setEditingEffectZone,
    refreshAllEffects
  } = useWorldStore();

  const { isUpdatingParams, lastUpdatedParam, setIsUpdatingParams, setLastUpdatedParam } = useParameterHandlers();

  // Hook para selección de entidades
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

  // Hook para transformaciones
  const {
    updateTransform,
    resetTransform,
    roundToDecimals,
    canTransform
  } = useTransformHandler();

  // Componentes refactorizados
  const parameterFactory = ParameterComponentFactory.getInstance();
  const parameterManager = ParameterManager.getInstance();

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

  // Suscribirse a cambios de estado de parámetros
  useEffect(() => {
    const unsubscribe = parameterManager.subscribeToChanges((entityId, state) => {
      if (entityId === selectedEntityId) {
        setIsUpdatingParams(state.isUpdating);
        setLastUpdatedParam(state.lastUpdatedParam);
      }
    });

    return unsubscribe;
  }, [selectedEntityId, setIsUpdatingParams, setLastUpdatedParam, parameterManager]);

  // Función para actualizar parámetros de objeto sonoro
  const handleParamChange = useCallback((param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => {
    if (!isSoundObject) return;

    const soundObject = getSoundObject();
    if (!soundObject) return;

    // Usar el parameter manager para validar y actualizar
    parameterManager.updateParameter(soundObject.id, param as string, value);

    const newAudioParams = {
      ...soundObject.audioParams,
      [param]: value,
    };

    updateObject(soundObject.id, {
      audioParams: newAudioParams,
    });
  }, [isSoundObject, getSoundObject, updateObject, parameterManager]);

  // Función para actualizar parámetros de zona de efecto
  const handleEffectParamChange = useCallback((param: string, value: number | string) => {
    if (!isEffectZone) return;

    const effectZone = getEffectZone();
    if (!effectZone) return;

    // Usar el parameter manager para validar y actualizar
    parameterManager.updateParameter(effectZone.id, param, value);

    const newEffectParams = {
      ...effectZone.effectParams,
      [param]: value,
    };

    updateEffectZone(effectZone.id, {
      effectParams: newEffectParams,
    });
  }, [isEffectZone, getEffectZone, updateEffectZone, parameterManager]);

  // Función para manejar transformaciones
  const handleTransformChange = useCallback((entityId: string, transform: unknown) => {
    updateTransform(entityId, transform);
  }, [updateTransform]);

  // Función para manejar refresco de efectos
  const handleRefreshEffects = useCallback(() => {
    setIsRefreshingEffects(true);
    refreshAllEffects();

    setTimeout(() => {
      setIsRefreshingEffects(false);
    }, defaultConfig.updateDelay);
  }, [refreshAllEffects, defaultConfig.updateDelay]);

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
                  isRefreshingEffects={isRefreshingEffects}
                  onRemove={removeEffectZone}
                  onToggleLock={toggleLockEffectZone}
                  onRefresh={handleRefreshEffects}
                />

                {/* Controles de parámetros del efecto */}
                <div className="space-y-4">
                  <EffectParametersSection
                    zone={zone}
                    isUpdatingParams={isUpdatingParams}
                    lastUpdatedParam={lastUpdatedParam}
                    onEffectParamChange={handleEffectParamChange}
                  />

                  {/* Parámetros específicos del efecto usando el factory */}
                  {parameterFactory.createEffectComponent(zone.effectType as unknown, zone as EffectZoneEntity)}

                  {/* Secciones adicionales */}
                  <EffectInfoSection zone={zone} />
                  <EffectShapeSelector zone={zone} />
                  <EffectTransformSection 
                    zone={zone} 
                    onTransformChange={handleTransformChange}
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
                  object={soundObject}
                  onRemove={removeObject}
                />

                {/* Controles de parámetros del objeto sonoro */}
                <div className="space-y-4">
                  {/* Parámetros específicos del objeto usando el factory */}
                  {parameterFactory.createSoundObjectComponent(soundObject.type as unknown, soundObject as SoundObjectEntity)}

                  {/* Secciones adicionales */}
                  <SynthSpecificParameters 
                    object={soundObject}
                    onParamChange={handleParamChange}
                  />
                  <SoundTransformSection 
                    object={soundObject} 
                    onTransformChange={handleTransformChange}
                  />
                  <SoundObjectControls 
                    object={soundObject}
                    onParamChange={handleParamChange}
                  />
                </div>

                {/* Footer */}
                <SoundObjectFooter object={soundObject} />
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
