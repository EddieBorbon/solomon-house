'use client';

import React from 'react';

interface EffectZoneContainerProps {
  children: React.ReactNode;
}

export function EffectZoneContainer({ children }: EffectZoneContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-xs max-h-[75vh] overflow-y-auto">
        {/* Efecto de brillo interior */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
        {children}
      </div>
    </div>
  );
}
