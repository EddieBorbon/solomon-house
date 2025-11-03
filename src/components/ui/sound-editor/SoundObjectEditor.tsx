'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { SoundObjectContainer } from './SoundObjectContainer';
import { SoundObjectHeader } from './SoundObjectHeader';
import { SoundObjectControls } from './SoundObjectControls';
import { AdvancedSynthParameters } from './AdvancedSynthParameters';
import { SoundObjectSynthParams } from './SoundObjectSynthParams';
import { SoundTransformSection } from './SoundTransformSection';
import { SoundObjectFooter } from './SoundObjectFooter';
import { SoundObjectMovementControls } from './components/SoundObjectMovementControls';

interface SoundObjectEditorProps {
  selectedObject: SoundObject;
  onParamChange: (param: string | number | symbol, value: string | number | string[] | Record<string, string>) => void;
  onTransformChange: (property: "position" | "rotation" | "scale", axis: 0 | 1 | 2, value: number) => void;
  onResetTransform: () => void;
  roundToDecimals: (value: number) => number;
  onRemove: (id: string) => void;
}

export function SoundObjectEditor({
  selectedObject,
  onParamChange,
  onTransformChange,
  onResetTransform,
  roundToDecimals,
  onRemove
}: SoundObjectEditorProps) {
  // Asegurar que audioParams existe
  if (!selectedObject.audioParams) {
    selectedObject.audioParams = {
      frequency: 440,
      waveform: 'sine',
      volume: 0.5
    };
  }

  return (
    <SoundObjectContainer>
      {/* Header con información del objeto */}
      <SoundObjectHeader 
        selectedObject={selectedObject}
        onRemove={onRemove}
      />

      <SoundObjectControls 
        selectedObject={selectedObject}
        onParamChange={onParamChange}
        onTransformChange={onTransformChange}
        onResetTransform={onResetTransform}
        roundToDecimals={roundToDecimals}
        onRemove={onRemove}
      />

      {/* Parámetros avanzados de sintetizadores */}
      <AdvancedSynthParameters 
        object={selectedObject}
      />

      {/* Parámetros específicos de sintetizadores */}
      <SoundObjectSynthParams
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />

      {/* Controles de movimiento */}
      <SoundObjectMovementControls
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />
      
      {/* Sección de Posición y Tamaño - Movida al final */}
      <SoundTransformSection 
        selectedObject={selectedObject}
        onTransformChange={onTransformChange}
        onResetTransform={onResetTransform}
        roundToDecimals={roundToDecimals}
      />

      <SoundObjectFooter />
    </SoundObjectContainer>
  );
}