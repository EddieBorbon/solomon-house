'use client';

import React from 'react';

interface EffectInfoSectionProps {
  effectType: string;
}

export function EffectInfoSection({ effectType }: EffectInfoSectionProps) {
  return (
    <div className="mt-6 pt-4 border-t border-gray-700">
      <div className="p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
        <p className="text-xs text-purple-300 text-center">
          💡 Los objetos sonoros dentro de esta zona se procesarán automáticamente con el efecto {effectType}
        </p>
      </div>
    </div>
  );
}
