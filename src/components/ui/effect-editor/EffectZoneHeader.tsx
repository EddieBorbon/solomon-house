'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { EffectZoneHeader } from '../parameter-editor';

interface EffectZoneHeaderProps {
  zone: EffectZone;
  isRefreshingEffects: boolean;
  onRemove: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRefresh: () => void;
}

export function EffectZoneHeaderComponent({
  zone,
  isRefreshingEffects,
  onRemove,
  onToggleLock,
  onRefresh
}: EffectZoneHeaderProps) {
  return (
    <EffectZoneHeader 
      zone={zone}
      isRefreshingEffects={isRefreshingEffects}
      onRemove={onRemove}
      onToggleLock={onToggleLock}
      onRefresh={onRefresh}
    />
  );
}
