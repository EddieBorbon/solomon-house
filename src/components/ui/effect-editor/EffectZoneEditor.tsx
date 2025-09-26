'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { EffectZoneContainer } from './EffectZoneContainer';
import { EffectZoneContent } from './EffectZoneContent';

interface EffectZoneEditorProps {
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

export function EffectZoneEditor({
  zone,
  // isRefreshingEffects,
  isUpdatingParams,
  // lastUpdatedParam,
  onRemove,
  onToggleLock,
  // onRefresh,
  onEffectParamChange,
  onUpdateEffectZone,
  roundToDecimals
}: EffectZoneEditorProps) {
  // Asegurar que effectParams existe
  if (!zone?.effectParams) {
    zone.effectParams = {};
  }

  return (
    <EffectZoneContainer>
      <EffectZoneContent
        zone={zone}
        isUpdatingParams={isUpdatingParams}
        onRemove={onRemove}
        onToggleLock={onToggleLock}
        onEffectParamChange={onEffectParamChange}
        onUpdateEffectZone={onUpdateEffectZone}
        roundToDecimals={roundToDecimals}
      />
    </EffectZoneContainer>
  );
}