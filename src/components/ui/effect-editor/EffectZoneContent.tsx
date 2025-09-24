'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { EffectZoneHeader } from './EffectZoneHeader';
import { EffectZoneParams } from './EffectZoneParams';
import { EffectShapeSelector } from './EffectShapeSelector';
import { EffectTransformSection } from './EffectTransformSection';
import { EffectInfoSection } from './EffectInfoSection';

interface EffectZoneContentProps {
  zone: EffectZone;
  isRefreshingEffects: boolean;
  isUpdatingParams: boolean;
  lastUpdatedParam: string | null;
  onRemove: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRefresh: () => void;
  onEffectParamChange: (param: string, value: number | string) => void;
  onUpdateEffectZone: (id: string, updates: Partial<EffectZone>) => void;
  roundToDecimals: (value: number) => number;
}

export function EffectZoneContent({
  zone,
  isRefreshingEffects,
  isUpdatingParams,
  lastUpdatedParam,
  onRemove,
  onToggleLock,
  onRefresh,
  onEffectParamChange,
  onUpdateEffectZone,
  roundToDecimals
}: EffectZoneContentProps) {
  return (
    <>
      {/* Header con información de la zona de efecto */}
      <EffectZoneHeader 
        zone={zone}
        isRefreshingEffects={isRefreshingEffects}
        onRemove={onRemove}
        onToggleLock={onToggleLock}
        onRefresh={onRefresh}
      />

      {/* Controles de parámetros del efecto */}
      <EffectZoneParams
        zone={zone}
        isUpdatingParams={isUpdatingParams}
        lastUpdatedParam={lastUpdatedParam}
        onEffectParamChange={onEffectParamChange}
      />

      {/* Selector de forma */}
      <EffectShapeSelector 
        zone={zone}
        onShapeChange={(shape) => onUpdateEffectZone(zone?.id, { shape })}
      />

      {/* Sección de Posición y Tamaño para Zonas de Efectos */}
      <EffectTransformSection 
        zone={zone}
        onUpdateEffectZone={onUpdateEffectZone}
        roundToDecimals={roundToDecimals}
      />

      {/* Información adicional */}
      <EffectInfoSection effectType={zone.type} />
    </>
  );
}
