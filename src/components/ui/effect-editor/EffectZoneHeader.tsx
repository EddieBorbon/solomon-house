'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface EffectZoneHeaderProps {
  zone: EffectZone;
  isRefreshingEffects: boolean;
  onRemove: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRefresh: () => void;
}

export function EffectZoneHeader({
  zone,
  isRefreshingEffects,
  onRemove,
  onToggleLock,
  onRefresh
}: EffectZoneHeaderProps) {
  return (
    <EffectZoneHeaderComponent 
      zone={zone}
      isRefreshingEffects={isRefreshingEffects}
      onRemove={onRemove}
      onToggleLock={onToggleLock}
      onRefresh={onRefresh}
    />
  );
}