'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';

interface EffectSpecificParametersProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function EffectSpecificParameters({
  // zone,
  // onEffectParamChange
}: EffectSpecificParametersProps) {
  return (
    <div className="futuristic-param-container">
      {/* Parámetros específicos del efecto */}
    </div>
  );
}
