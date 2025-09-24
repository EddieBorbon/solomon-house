'use client';

import React from 'react';
import { NoSelectionMessage } from '../NoSelectionMessage';
import { MobileObjectEditorWrapper } from '../MobileObjectEditorWrapper';
import type { EffectZone, SoundObject, MobileObject } from '../../../state/useWorldStore';

interface EntityTypeSelectorProps {
  selectedEntity: EffectZone | SoundObject | MobileObject | null;
  isMobileObject: boolean;
  isSoundObject: boolean;
  isEffectZone: boolean;
  getMobileObject: () => MobileObject | null;
  getSoundObject: () => SoundObject | null;
  getEffectZone: () => EffectZone | null;
  removeMobileObject: (id: string) => void;
  onRenderSoundObject: () => React.ReactNode;
  onRenderEffectZone: () => React.ReactNode;
}

/**
 * EntityTypeSelector - Responsabilidad única: Determinar qué tipo de editor mostrar
 * Aplica SRP: Solo maneja el routing de tipos de entidades
 * Aplica OCP: Fácil de extender con nuevos tipos de entidades
 */
export function EntityTypeSelector({
  selectedEntity,
  isMobileObject,
  isSoundObject,
  isEffectZone,
  getMobileObject,
  getSoundObject,
  getEffectZone,
  removeMobileObject,
  onRenderSoundObject,
  onRenderEffectZone
}: EntityTypeSelectorProps) {
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
    return onRenderEffectZone();
  }

  if (isSoundObject) {
    return onRenderSoundObject();
  }

  // Fallback si no se reconoce el tipo
  return <NoSelectionMessage />;
}
