'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { EffectParametersSection } from '../EffectParametersSection';
import { EffectSpecificParameters } from '../EffectSpecificParameters';
import { EffectBasicParameters } from './EffectBasicParameters';

interface EffectZoneParamsProps {
  zone: EffectZone;
  isUpdatingParams: boolean;
  lastUpdatedParam: string | null;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function EffectZoneParams({
  zone,
  isUpdatingParams,
  lastUpdatedParam,
  onEffectParamChange
}: EffectZoneParamsProps) {
  return (
    <div className="space-y-4">
      <EffectParametersSection 
        zone={zone}
        isUpdatingParams={isUpdatingParams}
        lastUpdatedParam={lastUpdatedParam}
        onEffectParamChange={onEffectParamChange}
      />
      
      {/* Parámetros específicos del efecto */}
      <EffectSpecificParameters 
        zone={zone}
        onEffectParamChange={onEffectParamChange}
      />
      
      {/* Parámetros básicos del efecto */}
      <EffectBasicParameters 
        zone={zone}
        onEffectParamChange={onEffectParamChange}
      />
    </div>
  );
}
