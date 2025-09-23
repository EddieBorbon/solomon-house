'use client';

import React from 'react';
import { EffectZoneCard } from '../EffectZoneCard';
import { LockControl } from '../LockControl';
import { RefreshEffectsButton } from '../RefreshEffectsButton';
import { type EffectZone } from '../../../state/useWorldStore';

interface EffectZoneHeaderProps {
  zone: EffectZone;
  isRefreshingEffects: boolean;
  onRemove: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRefresh: () => void;
}

/**
 * Header para zonas de efectos con controles básicos
 * Responsabilidad única: Renderizar el header y controles básicos de zona de efectos
 */
export function EffectZoneHeader({ 
  zone, 
  isRefreshingEffects, 
  onRemove, 
  onToggleLock, 
  onRefresh 
}: EffectZoneHeaderProps) {
  return (
    <>
      {/* Header con información de la zona de efecto */}
      <EffectZoneCard zone={zone} onRemove={onRemove} />

      {/* Control de bloqueo */}
      <LockControl zone={zone} onToggleLock={onToggleLock} />

      {/* Botón de refrescar efectos */}
      <RefreshEffectsButton 
        isRefreshing={isRefreshingEffects}
        onRefresh={onRefresh}
      />
    </>
  );
}
